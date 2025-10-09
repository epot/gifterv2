package handlers

import (
	"encoding/json"
	"github.com/epot/gifterv2/internal/store"
	"github.com/markbates/goth/gothic"
	"log"
	"net/http"
)

type Comments struct {
	Comments []store.Comment `json:"comments"`
}

func ListComments(db store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var (
			giftID = r.PathValue("gift_id")
			ctx    = r.Context()
		)

		comments, err := db.ListComments(ctx, giftID)
		if err != nil {
			http.Error(w, "Error fetching comments", http.StatusInternalServerError)
			return
		}

		// Respond with user data
		_ = json.NewEncoder(w).Encode(Comments{Comments: comments})
	}
}

type createCommentRequest struct {
	Message string `json:"message"`
}

func CreateComment(db store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		decoder := json.NewDecoder(r.Body)

		var req createCommentRequest
		err = decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}

		if req.Message == "" {
			http.Error(w, "Message is required", http.StatusBadRequest)
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

		hasGift, err := db.HasGift(ctx, giftID, eventID)
		if err != nil {
			http.Error(w, "Error checking gift access", http.StatusInternalServerError)
			return
		}

		if !hasGift {
			http.Error(w, "Gift not found", http.StatusBadRequest)
			return
		}

		err = db.CreateComment(ctx, userID, giftID, req.Message)
		if err != nil {
			http.Error(w, "Error creating comment", http.StatusInternalServerError)
			return
		}

		_ = json.NewEncoder(w).Encode(nil)
	}
}
