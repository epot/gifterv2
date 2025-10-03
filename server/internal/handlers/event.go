package handlers

import (
	"encoding/json"
	"github.com/epot/gifterv2/internal/database"
	"github.com/markbates/goth/gothic"
	"log"
	"net/http"
	"time"
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

type createEventRequest struct {
	Name string    `json:"name"`
	Date time.Time `json:"date"`
}

func CreateEvent(db database.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		decoder := json.NewDecoder(r.Body)

		var req createEventRequest
		err = decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}

		ctx := r.Context()
		err = db.CreateEvent(ctx, userID, req.Name, req.Date)
		if err != nil {
			http.Error(w, "Error creating event", http.StatusInternalServerError)
			return
		}

		_ = json.NewEncoder(w).Encode(nil)
	}
}

type Participants struct {
	Users []database.User `json:"users"`
}

func GetEventParticipants(db database.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var (
			eventID = r.PathValue("event_id")
			ctx     = r.Context()
		)

		hasAccess, err := checkIfUserHasAccessToEvents(ctx, db, userID, eventID)
		if err != nil {
			http.Error(w, "Error checking event access", http.StatusInternalServerError)
			return
		}
		if !hasAccess {
			http.Error(w, "Event not found", http.StatusBadRequest)
			return
		}
		users, err := db.GetEventParticipants(ctx, eventID)
		if err != nil {
			http.Error(w, "Error fetching participants", http.StatusInternalServerError)
			return
		}

		// Respond with user data
		_ = json.NewEncoder(w).Encode(Participants{Users: users})
	}
}
