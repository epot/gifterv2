package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/epot/gifterv2/internal/store"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

const (
	// 32 bytes => 256 bits
	numBytesEntropy = 32
)

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

func ForgotPasswordHandler(db store.Store, isProduction bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)

		var req forgotPasswordRequest
		err := decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}

		// Save user to the database
		ctx := r.Context()
		user, err := db.GetUserByEmailWithPassword(ctx, req.Email)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			log.Println(err)
			return
		}
		if user == nil {
			// no user with password found, let's return a 200
			_ = json.NewEncoder(w).Encode(nil)
			return
		}

		err = db.RemoveExistingNonces(ctx, user.ID)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			log.Println(err)
			return
		}

		nonce, err := getNewNonce()
		if err != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			log.Println(err)
			return
		}

		err = db.CreateNewNonce(ctx, user.ID, nonce)
		if err != nil {
			http.Error(w, "database error", http.StatusInternalServerError)
			log.Println(err)
			return
		}

		from := mail.NewEmail("Rene Coty", os.Getenv("SENDGRID_SENDER_EMAIL"))
		subject := "Reset Password"
		to := mail.NewEmail(user.Name, user.Email)

		var (
			host   = "gifter-1033.appspot.com"
			scheme = "https"
		)
		if !isProduction {
			host = "localhost:5173"
			scheme = "http"
		}

		u := url.URL{
			Scheme: scheme,
			Host:   host,
			Path:   "/reset-password",
		}
		q := u.Query()
		q.Add("nonce", nonce)
		u.RawQuery = q.Encode()
		resetLink := u.String()

		plainTextContent := fmt.Sprintf("Reset your password with this link (valid for 15min): %s", resetLink)
		htmlContent := fmt.Sprintf("<p>Reset your password with this link (valid for 15min): <a href=\"%s\">this link</a></p>", resetLink)
		message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
		client := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))
		pass, err := client.Send(message)
		if err != nil {
			http.Error(w, "sendgrid error", http.StatusInternalServerError)
			log.Println(err)
			return
		}
		if pass.StatusCode >= http.StatusBadRequest {
			http.Error(w, "sendgrid error", http.StatusInternalServerError)
			log.Println(fmt.Sprintf("failed to send email: %s", pass.Body))
			return
		}
		_ = json.NewEncoder(w).Encode(nil)
		return
	}
}

func getNewNonce() (string, error) {
	b := make([]byte, numBytesEntropy)
	n, err := rand.Read(b)
	if err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}
	if n != numBytesEntropy {
		return "", fmt.Errorf("expected to read: %d random bytes, but got: %d", numBytesEntropy, n)
	}

	return hex.EncodeToString(b), nil
}
