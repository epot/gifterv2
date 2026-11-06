package store

import (
	"context"
	"errors"
)

type ResetPasswordNonce struct {
	UserID string `json:"user_id"`
	Nonce  string `json:"nonce"`
}

func (s *store) RemoveExistingNonces(ctx context.Context, userID string) error {
	return errors.New("not implemented")
}

func (s *store) CreateNewNonce(ctx context.Context, userID string, nonce string) error {
	return errors.New("not implemented")
}

func (s *store) GetNonce(ctx context.Context, userID string) (ResetPasswordNonce, bool, error) {
	return ResetPasswordNonce{}, false, errors.New("not implemented")
}
