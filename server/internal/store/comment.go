package store

import (
	"context"
	"fmt"
	"github.com/hako/durafmt"
	"time"
)

type Comment struct {
	ID        string    `json:"id"`
	Author    User      `json:"author"`
	CreatedAt time.Time `json:"created_at"`
	Since     string    `json:"since"`
	Message   string    `json:"message"`
}

func (s *store) CreateComment(ctx context.Context, userID string, giftID string, message string) error {
	_, err := s.db.ExecContext(ctx, "INSERT INTO comments (author_id, gift_id, created_at, message) VALUES ($1, $2, $3, $4)", userID, giftID, time.Now().UTC(), message)
	if err != nil {
		return fmt.Errorf("failed to create comment: %w", err)
	}

	return nil
}

func (s *store) ListComments(ctx context.Context, giftID string) ([]Comment, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`
	SELECT 
		comments.id, 
		comments.message, 
		comments.created_at, 
		users.id,
		users.name,
		users.email,
		users.picture
    FROM comments 
    JOIN users ON comments.author_id = users.id
    WHERE comments.gift_id = $1
	ORDER BY comments.created_at ASC
`,
		giftID)
	if err != nil {
		return nil, fmt.Errorf("failed to list comments: %w", err)
	}
	defer rows.Close()

	var comments []Comment

	for rows.Next() {
		var comment Comment
		err = rows.Scan(&comment.ID, &comment.Message, &comment.CreatedAt, &comment.Author.ID, &comment.Author.Name, &comment.Author.Email, &comment.Author.Picture)
		if err != nil {
			return nil, fmt.Errorf("error scanning comment: %w", err)
		}

		comment.Since = durafmt.Parse(time.Since(comment.CreatedAt.Truncate(time.Second))).LimitFirstN(1).String()

		comments = append(comments, comment)
	}

	return comments, nil
}
