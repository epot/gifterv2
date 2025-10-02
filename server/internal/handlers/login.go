package handlers

import (
	"encoding/json"
	"github.com/epot/gifterv2/internal/database"
	"github.com/markbates/goth/gothic"
	"log"
	"net/http"
	"os"
)

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(db database.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)

		var req loginRequest
		err := decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}

		// Save user to the database
		ctx := r.Context()
		userID, err := db.Login(ctx, req.Email, req.Password)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			log.Println(err)
			return
		}
		if userID == "" {
			http.Error(w, "Unknown email or password", http.StatusNotFound)
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
			redirectSecure = "http://localhost:5173/secure"
		}

		http.Redirect(w, r, redirectSecure, http.StatusFound)
	}
}
