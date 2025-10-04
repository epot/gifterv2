package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"time"
)

type GiftStatus int

const (
	NewGiftStatus = iota
	AboutToBeBoughtGiftStatus
	BoughtGiftStatus
	MarkedForDeletionStatus
)

type Gift struct {
	ID           string     `json:"id"`
	Name         string     `json:"name"`
	Status       GiftStatus `json:"status"`
	CreatorName  string     `json:"creator_name"`
	ToName       string     `json:"to_name"`
	FromName     string     `json:"from_name"`
	StatusFrozen bool       `json:"status_frozen"`
	URLs         []string   `json:"urls"`
	CreatedAt    time.Time  `json:"created_at"`
	EventID      string     `json:"event_id"`
}

// how we serialize the content field in the gifts table
type GiftContent struct {
	Name   string     `json:"name"`
	Status GiftStatus `json:"status"`
	ToID   string     `json:"to"`
	FromID string     `json:"from"`
	URLs   []string   `json:"urls"`
}

func (s *store) ListGifts(ctx context.Context, userID, eventID string) ([]Gift, error) {
	var (
		userIDToName = make(map[string]string)
	)

	rows, err := s.db.QueryContext(
		ctx,
		`
	SELECT 
		id, 
		creator_id, 
		event_id, 
		created_at, 
		content
    FROM gifts 
    WHERE event_id = $1
`,
		eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to list gifts: %w", err)
	}
	defer rows.Close()

	var gifts []Gift

	for rows.Next() {
		var (
			gift             Gift
			giftContent      GiftContent
			creatorID        string
			giftContentBytes []byte
		)
		err = rows.Scan(&gift.ID, &creatorID, &gift.EventID, &gift.CreatedAt, &giftContentBytes)
		if err != nil {
			return nil, fmt.Errorf("error scanning gift: %w", err)
		}

		creatorName, err := s.UserIDToName(ctx, creatorID, userIDToName)
		if err != nil {
			return nil, fmt.Errorf("failed to get creator name: %w", err)
		}
		gift.CreatorName = creatorName

		err = json.Unmarshal(giftContentBytes, &giftContent)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal gift content: %w", err)
		}

		gift.Name = giftContent.Name
		gift.Status = giftContent.Status

		toName, err := s.UserIDToName(ctx, giftContent.ToID, userIDToName)
		if err != nil {
			return nil, fmt.Errorf("failed to get to name: %w", err)
		}
		gift.ToName = toName
		if giftContent.FromID != "" {
			fromName, err := s.UserIDToName(ctx, giftContent.FromID, userIDToName)
			if err != nil {
				return nil, fmt.Errorf("failed to get from name: %w", err)
			}
			gift.FromName = fromName
			gift.StatusFrozen = giftContent.FromID != userID
		}
		gift.URLs = giftContent.URLs

		gifts = append(gifts, gift)
	}

	sort.Slice(gifts, func(i, j int) bool {
		return gifts[i].CreatedAt.After(gifts[j].CreatedAt)
	})

	return gifts, nil
}

func (s *store) CreateGift(
	ctx context.Context,
	userID string,
	name string,
	eventID string,
	toUserID string,
	urls []string,
) error {
	content := GiftContent{
		Name:   name,
		Status: NewGiftStatus,
		ToID:   toUserID,
		URLs:   urls,
	}

	contentMarshalled, err := json.Marshal(content)
	if err != nil {
		return fmt.Errorf("failed to marshal gift content: %w", err)
	}

	_, err = s.db.ExecContext(ctx, "INSERT INTO gifts (creator_id, event_id, created_at, content) VALUES ($1, $2, $3, $4)", userID, eventID, time.Now(), contentMarshalled)
	if err != nil {
		return fmt.Errorf("failed to create gift: %w", err)
	}

	return nil
}

func (s *store) UpdateGift(ctx context.Context, userID string, giftID string, eventID string, status GiftStatus) error {
	var contentMarshalled []byte
	err := s.db.QueryRowContext(
		ctx,
		`
	SELECT 
		content
	FROM gifts
    WHERE id = $1 AND event_id = $2
`,
		giftID, eventID).Scan(&contentMarshalled)

	var giftContent GiftContent

	err = json.Unmarshal(contentMarshalled, &giftContent)
	if err != nil {
		return fmt.Errorf("failed to unmarshal gift content: %w", err)
	}

	if giftContent.FromID != "" && giftContent.FromID != userID {
		return errors.New("gift already has a buyer")
	}
	giftContent.FromID = userID
	giftContent.Status = status

	contentMarshalled, err = json.Marshal(giftContent)
	if err != nil {
		return fmt.Errorf("failed to marshal gift content: %w", err)
	}
	_, err = s.db.ExecContext(ctx, "UPDATE gifts SET content = $1 where id = $2", contentMarshalled, giftID)
	if err != nil {
		return fmt.Errorf("failed to update gift: %w", err)
	}
	return nil
}
