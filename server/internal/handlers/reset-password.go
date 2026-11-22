package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/epot/gifterv2/internal/store"
)

type resetPasswordRequest struct {
	Nonce    string `json:"nonce"`
	Password string `json:"password"`
}

func ResetPasswordHandler(db store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)

		var req resetPasswordRequest
		err := decoder.Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			log.Println(err)
			return
		}
		if req.Password == "" {
			http.Error(w, "Password is required", http.StatusBadRequest)
			return
		}

		// Save user to the database
		ctx := r.Context()
		nonce, found, err := db.GetNonce(ctx, req.Nonce)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			log.Println(err)
			return
		}
		if !found {
			http.Error(w, "Link not valid anymore", http.StatusNotFound)
			return
		}

		err = db.SetPassword(ctx, nonce.UserID, req.Password)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			log.Println(err)
			return
		}
		_ = json.NewEncoder(w).Encode(nil)
	}
}
