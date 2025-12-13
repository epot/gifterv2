package store

import (
	"context"
	"database/sql"
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
	MarkedForDeletionGiftStatus
	SecretGiftStatus
)

type Gift struct {
	ID        string
	CreatedAt time.Time
	CreatorID string
	EventID   string
	Content   GiftContent `json:"content"`
}

// how we serialize the content field in the gifts table
type GiftContent struct {
	Name   string     `json:"name"`
	Status GiftStatus `json:"status"`
	ToID   string     `json:"to"`
	FromID *string    `json:"from"`
	URLs   []string   `json:"urls"`
	Secret bool       `json:"secret"`
}

func (s *store) ListGifts(ctx context.Context, userID, eventID string) ([]Gift, error) {
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
			giftContentBytes []byte
		)
		err = rows.Scan(&gift.ID, &gift.CreatorID, &gift.EventID, &gift.CreatedAt, &giftContentBytes)
		if err != nil {
			return nil, fmt.Errorf("error scanning gift: %w", err)
		}

		err = json.Unmarshal(giftContentBytes, &giftContent)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal gift content: %w", err)
		}

		gift.Content = giftContent
		gifts = append(gifts, gift)
	}

	sort.Slice(gifts, func(i, j int) bool {
		return gifts[i].CreatedAt.After(gifts[j].CreatedAt)
	})

	return gifts, nil
}

func (s *store) HasGift(ctx context.Context, eventID string, giftID string) (bool, error) {
	row := s.db.QueryRowContext(
		ctx,
		`
	SELECT 
		id
    FROM gifts 
    WHERE event_id = $1 AND id = $2
`,
		eventID, giftID)

	err := row.Err()

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, fmt.Errorf("failed to check gift existence: %w", err)
	}

	return true, nil
}

func (s *store) CreateGift(
	ctx context.Context,
	userID string,
	name string,
	eventID string,
	toUserID string,
	urls []string,
	secret bool,
) error {
	content := GiftContent{
		Name:   name,
		Status: NewGiftStatus,
		ToID:   toUserID,
		URLs:   urls,
		Secret: secret,
	}

	contentMarshalled, err := json.Marshal(content)
	if err != nil {
		return fmt.Errorf("failed to marshal gift content: %w", err)
	}

	_, err = s.db.ExecContext(ctx, "INSERT INTO gifts (creator_id, event_id, created_at, content) VALUES ($1, $2, $3, $4)", userID, eventID, time.Now().UTC(), contentMarshalled)
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

	if (giftContent.Status == AboutToBeBoughtGiftStatus || giftContent.Status == BoughtGiftStatus) && giftContent.FromID != nil && *giftContent.FromID != userID {
		return errors.New("gift already has a buyer")
	}
	if giftContent.Status == AboutToBeBoughtGiftStatus || giftContent.Status == BoughtGiftStatus {
		giftContent.FromID = &userID
	} else {
		giftContent.FromID = nil
	}
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
