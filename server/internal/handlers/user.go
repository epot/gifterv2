package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/epot/gifterv2/internal/database"
	"github.com/markbates/goth/gothic"
)

func GetUserHandler(db database.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Fetch user details from the database
		ctx := r.Context()
		user, err := db.GetUserByID(ctx, userID)
		if err != nil {
			http.Error(w, "Error fetching user", http.StatusInternalServerError)
			return
		}
		if user == nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		// Respond with user data
		_ = json.NewEncoder(w).Encode(user)
	}
}
