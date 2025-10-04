package handlers

import (
	"encoding/json"
	"github.com/epot/gifterv2/internal/store"
	"github.com/markbates/goth/gothic"
	"log"
	"net/http"
	"os"
)

type signupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func SignupHandler(db store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)

		var req signupRequest
		err := decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}

		// Save user to the database
		ctx := r.Context()
		userID, err := db.Signup(ctx, req.Name, req.Email, req.Password)
		if err != nil {
			if store.IsEmailAlreadyUsedError(err) {
				http.Error(w, "Email already used", http.StatusBadRequest)
				return
			}
			http.Error(w, "Database error", http.StatusInternalServerError)
			log.Println(err)
			return
		}

		// Save user ID in the session
		err = gothic.StoreInSession("user_id", userID, r, w)
		if err != nil {
			http.Error(w, "Failed to save session", http.StatusInternalServerError)
			log.Println(err)
			return
		}

		// Redirect to the secure area
		redirectSecure := os.Getenv("REDIRECT_SECURE")
		if redirectSecure == "" {
			redirectSecure = "http://localhost:5173/events"
		}

		http.Redirect(w, r, redirectSecure, http.StatusFound)
	}
}
