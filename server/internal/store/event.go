package store

import (
	"context"
	"fmt"
	"sort"
	"time"
)

type EventType int

const (
	ChristmasEventType = iota
)

type ParticipantRole int

const (
	OwnerParticipantRole = iota
)

type Event struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	CreatorName string    `json:"creator_name"`
	Date        time.Time `json:"date"`
	Type        EventType `json:"event_type"`
}

func (s *store) ListEvents(ctx context.Context, userID string) ([]Event, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`
	SELECT 
		events.id, 
		events.name, 
		events.date, 
		events.type, 
		users.name
    FROM events 
    JOIN users ON events.creator_id = users.id
    JOIN participants ON events.id = participants.event_id
    WHERE participants.user_id = $1
`,
		userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list events: %w", err)
	}
	defer rows.Close()

	var events []Event

	for rows.Next() {
		var event Event
		err = rows.Scan(&event.ID, &event.Name, &event.Date, &event.Type, &event.CreatorName)
		if err != nil {
			return nil, fmt.Errorf("error scanning event: %w", err)
		}

		events = append(events, event)
	}

	sort.Slice(events, func(i, j int) bool {
		return events[i].Date.After(events[j].Date)
	})

	return events, nil
}

func (s *store) CreateEvent(ctx context.Context, userID string, eventName string, eventDate time.Time) (finalErr error) {
	txn, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}

	defer func() {
		if finalErr != nil {
			errRollback := txn.Rollback()
			if errRollback != nil {
				finalErr = fmt.Errorf("error rolling back transaction: %w (after %w)", errRollback, err)
			}
			finalErr = fmt.Errorf("error running transaction: %w", err)
		}
	}()

	var eventID string
	err = s.db.QueryRowContext(ctx, "INSERT INTO events (creator_id, name, date, type) VALUES ($1, $2, $3, $4) RETURNING id", userID, eventName, eventDate, ChristmasEventType).Scan(&eventID)
	if err != nil {
		return fmt.Errorf("failed to create event: %w", err)
	}

	var participantID string
	err = s.db.QueryRowContext(ctx, "INSERT INTO participants (user_id, event_id, participant_role) VALUES ($1, $2, $3) RETURNING id", userID, eventID, OwnerParticipantRole).Scan(&participantID)
	if err != nil {
		return fmt.Errorf("failed to create participant: %w", err)
	}

	if err := txn.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}
