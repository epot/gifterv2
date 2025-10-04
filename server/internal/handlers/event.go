package handlers

import (
	"encoding/json"
	"github.com/epot/gifterv2/internal/store"
	"github.com/markbates/goth/gothic"
	"log"
	"net/http"
	"time"
)

type Events struct {
	Events []store.Event `json:"events"`
}

func GetEvents(db store.Store) http.HandlerFunc {
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

func CreateEvent(db store.Store) http.HandlerFunc {
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
	Users []store.User `json:"users"`
}

func GetEventParticipants(db store.Store) http.HandlerFunc {
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

type newParticipantRequest struct {
	ParticipantEmail string `json:"participant_email"`
}

func AddEventParticipant(db store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var (
			decoder = json.NewDecoder(r.Body)
			eventID = r.PathValue("event_id")
			ctx     = r.Context()
		)

		var req newParticipantRequest
		err = decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}

		hasAccess, err := checkIfUserHasAccessToEvents(ctx, db, userID, eventID)
		if err != nil {
			http.Error(w, "Error checking event access", http.StatusInternalServerError)
			return
		}
		if !hasAccess {
			http.Error(w, "Event not found", http.StatusBadRequest)
			return
		}
		err = db.AddEventParticipant(ctx, eventID, req.ParticipantEmail)
		if err != nil {
			if store.IsUnknownParticipantError(err) {
				http.Error(w, "Email does not exist", http.StatusBadRequest)
				return
			}
			http.Error(w, "Error adding new participant", http.StatusInternalServerError)
			return
		}

		// Respond with user data
		_ = json.NewEncoder(w).Encode(nil)
	}
}
