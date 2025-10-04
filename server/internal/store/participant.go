package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"sort"
)

func (s *store) GetEventParticipants(ctx context.Context, eventID string) ([]User, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`
	SELECT 
		users.id, 
		users.name, 
		users.email, 
		users.picture
    FROM users 
    JOIN participants ON users.id = participants.user_id
    WHERE participants.event_id = $1
`,
		eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to list participants: %w", err)
	}
	defer rows.Close()

	var users []User

	for rows.Next() {
		var (
			user    User
			picture sql.NullString
		)
		err = rows.Scan(&user.ID, &user.Name, &user.Email, &picture)
		if err != nil {
			return nil, fmt.Errorf("error scanning user: %w", err)
		}

		if picture.Valid {
			user.Picture = picture.String
		}

		users = append(users, user)
	}

	sort.Slice(users, func(i, j int) bool {
		return users[i].Name < users[j].Name
	})

	return users, nil
}

type UnknownParticipantError struct {
	error
}

func NewUnknownParticipantError(err error) error {
	return UnknownParticipantError{
		error: err,
	}
}

func IsUnknownParticipantError(err error) bool {
	var unknownErr UnknownParticipantError
	return errors.As(err, &unknownErr)
}

func (s *store) AddEventParticipant(ctx context.Context, eventID string, userEmail string) error {
	var userID string
	err := s.db.QueryRowContext(ctx, "SELECT id FROM users WHERE email = $1", userEmail).Scan(&userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return NewUnknownParticipantError(fmt.Errorf("no user with email %s", userEmail))
		}
		return fmt.Errorf("failed to get user: %w", err)
	}

	var participantID string
	err = s.db.QueryRowContext(ctx, "INSERT INTO participants (user_id, event_id, participant_role) VALUES ($1, $2, $3) RETURNING id", userID, eventID, OwnerParticipantRole).Scan(&participantID)
	if err != nil {
		return fmt.Errorf("failed to create participant: %w", err)
	}

	return nil
}
