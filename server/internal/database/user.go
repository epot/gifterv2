package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

type EmailAlreadyUsedError struct {
	error
}

func NewEmailAlreadyUsedError(err error) error {
	return EmailAlreadyUsedError{
		error: err,
	}
}

func IsEmailAlreadyUsedError(err error) bool {
	var emailErr EmailAlreadyUsedError
	return errors.As(err, &emailErr)
}

type User struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

// HashPassword generates a bcrypt hash for the given password.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func (s *service) FindOrCreateUser(ctx context.Context, user *User) (string, error) {
	var userID string
	err := s.db.QueryRowContext(ctx, "SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			err = s.db.QueryRowContext(ctx, "INSERT INTO users (name, email, picture) VALUES ($1, $2, $3) RETURNING id", user.Name, user.Email, user.Picture).Scan(&userID)
		}
	}
	if err != nil {
		return "", fmt.Errorf("failed to find or create user: %w", err)
	}
	return userID, nil
}

func (s *service) Login(ctx context.Context, userEmail string, password string) (string, error) {
	var userID string
	hash, err := HashPassword(password)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	err = s.db.QueryRowContext(ctx, "SELECT id FROM users WHERE email = $1 AND password_hash = $2", userEmail, hash).Scan(&userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil
		}
		return "", fmt.Errorf("failed to login user: %w", err)
	}

	return userID, nil
}

func (s *service) Signup(ctx context.Context, userName string, userEmail string, password string) (string, error) {
	var userID string

	hash, err := HashPassword(password)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	err = s.db.QueryRowContext(ctx, "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id", userName, userEmail, hash).Scan(&userID)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return "", NewEmailAlreadyUsedError(pgErr)
		}
		return "", fmt.Errorf("failed to signup user: %w", err)
	}

	return userID, nil
}

func (s *service) GetUserByID(ctx context.Context, userID string) (*User, error) {
	var (
		user    User
		picture sql.NullString
	)
	err := s.db.QueryRowContext(ctx, "SELECT id, name, email, picture FROM users WHERE id = $1", userID).Scan(&user.ID, &user.Name, &user.Email, &picture)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if picture.Valid {
		user.Picture = picture.String
	}
	return &user, err
}
