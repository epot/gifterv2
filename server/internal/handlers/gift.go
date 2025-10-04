package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/epot/gifterv2/internal/store"
	"github.com/markbates/goth/gothic"
	"log"
	"net/http"
	"strings"
)

type Gifts struct {
	Gifts []store.Gift `json:"gifts"`
}

type createGiftRequest struct {
	Name string   `json:"name"`
	ToID string   `json:"to_id"`
	URLs []string `json:"urls"`
}

func GetGifts(db store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		eventID := r.PathValue("event_id")

		ctx := r.Context()

		hasAccess, err := checkIfUserHasAccessToEvents(ctx, db, userID, eventID)
		if err != nil {
			http.Error(w, "Error checking event access", http.StatusInternalServerError)
			return
		}
		if !hasAccess {
			http.Error(w, "Event not found", http.StatusBadRequest)
			return
		}

		gifts, err := db.ListGifts(ctx, userID, eventID)
		if err != nil {
			http.Error(w, "Error fetching gifts", http.StatusInternalServerError)
			return
		}

		// Respond with user data
		_ = json.NewEncoder(w).Encode(Gifts{Gifts: gifts})
	}
}

func CreateGift(db store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		decoder := json.NewDecoder(r.Body)
		var req createGiftRequest
		err = decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}

		eventID := r.PathValue("event_id")

		if req.Name == "" {
			http.Error(w, "Gift name is required", http.StatusBadRequest)
			return
		}
		if req.ToID == "" {
			http.Error(w, "To ID is required", http.StatusBadRequest)
			return
		}

		ctx := r.Context()

		hasAccess, err := checkIfUserHasAccessToEvents(ctx, db, userID, eventID)
		if err != nil {
			http.Error(w, "Error checking event access", http.StatusInternalServerError)
			return
		}
		if !hasAccess {
			http.Error(w, "Event not found", http.StatusBadRequest)
			return
		}

		var urls []string
		for _, url := range req.URLs {
			trimmedURL := strings.TrimSpace(url)
			if trimmedURL != "" {
				urls = append(urls, trimmedURL)
			}
		}

		err = db.CreateGift(ctx, userID, req.Name, eventID, req.ToID, urls)
		if err != nil {
			http.Error(w, "Error creating gift", http.StatusInternalServerError)
			return
		}

		_ = json.NewEncoder(w).Encode(nil)
	}
}

type updateGiftRequest struct {
	Status store.GiftStatus `json:"status"`
}

func UpdateGift(db store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		decoder := json.NewDecoder(r.Body)
		var req updateGiftRequest
		err = decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}

		var (
			eventID = r.PathValue("event_id")
			giftID  = r.PathValue("gift_id")
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

		err = db.UpdateGift(ctx, userID, giftID, eventID, req.Status)
		if err != nil {
			http.Error(w, "Error updating gift", http.StatusInternalServerError)
			return
		}

		_ = json.NewEncoder(w).Encode(nil)
	}
}

func checkIfUserHasAccessToEvents(
	ctx context.Context,
	db store.Store,
	userID string,
	eventID string,
) (bool, error) {
	events, err := db.ListEvents(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("error fetching events: %w", err)
	}

	var foundEvent bool
	for _, event := range events {
		if event.ID == eventID {
			foundEvent = true
			break
		}
	}

	return foundEvent, nil
}
