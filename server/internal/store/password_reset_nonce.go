package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

var (
	resetPasswordOnceValidity = 15 * time.Minute
)

type ResetPasswordNonce struct {
	UserID string `json:"user_id"`
	Nonce  string `json:"nonce"`
}

func (s *store) RemoveExistingNonces(ctx context.Context, userID string) error {
	_, err := s.db.ExecContext(
		ctx,
		"DELETE FROM password_reset_nonces WHERE user_id = $1",
		userID,
	)
	if err != nil {
		return fmt.Errorf("failed to remove existing nonces: %w", err)
	}

	return nil
}

func (s *store) CreateNewNonce(ctx context.Context, userID string, nonce string) error {
	_, err := s.db.ExecContext(
		ctx,
		"INSERT INTO password_reset_nonces (user_id, nonce, expires_at) VALUES ($1, $2, $3)",
		userID,
		nonce,
		time.Now().UTC().Add(resetPasswordOnceValidity),
	)
	if err != nil {
		return fmt.Errorf("failed to insert reset password nonce: %w", err)
	}

	return nil
}

func (s *store) GetNonce(ctx context.Context, nonceStr string) (ResetPasswordNonce, bool, error) {
	row := s.db.QueryRowContext(
		ctx,
		`
	SELECT 
		user_id, expires_at
    FROM password_reset_nonces 
    WHERE nonce = $1
`,
		nonceStr,
	)

	var (
		userID    string
		expiresAt time.Time
	)

	err := row.Scan(&userID, &expiresAt)
	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {
			return ResetPasswordNonce{}, false, nil
		}
		return ResetPasswordNonce{}, false, fmt.Errorf("failed to get nonce: %w", err)
	}

	if time.Now().After(expiresAt) {
		return ResetPasswordNonce{}, false, nil
	}

	return ResetPasswordNonce{
		UserID: userID,
		Nonce:  nonceStr,
	}, true, nil
}
