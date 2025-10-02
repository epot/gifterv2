package database

import (
	"context"
	"fmt"
	"time"
)

type EventType int

const (
	ChristmasEventType = iota
)

type Event struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	CreatorName string    `json:"creator_name"`
	Date        time.Time `json:"date"`
	Type        EventType `json:"event_type"`
}

func (s *service) ListEvents(ctx context.Context, userID string) ([]Event, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`
SELECT 
    events.id, 
    events.name, 
    events.date, 
    events.type, 
    users.name, 
    FROM events 
    JOIN users ON events.creatorid = users.id
    JOIN participants ON events.id = participants.eventid
    WHERE partitions.userid = $1
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

	return events, nil
}
