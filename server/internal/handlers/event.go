package handlers

import (
	"encoding/json"
	"github.com/epot/gifterv2/internal/database"
	"github.com/markbates/goth/gothic"
	"net/http"
)

type Events struct {
	Events []database.Event `json:"events"`
}

func GetEvents(db database.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Fetch user details from the database
		ctx := r.Context()
		events, err := db.ListEvents(ctx, userID)
		if err != nil {
			http.Error(w, "Error fetching events", http.StatusInternalServerError)
			return
		}

		// Respond with user data
		_ = json.NewEncoder(w).Encode(Events{Events: events})
	}
}
