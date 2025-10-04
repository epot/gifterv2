package server

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/epot/gifterv2/internal/store"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

var (
	isProduction = os.Getenv("ENV") == "production"
)

type Server struct {
	port int
	db   store.Store
}

func init() {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	callbackURL := os.Getenv("GOOGLE_CALLBACK_URL")

	if clientID == "" || clientSecret == "" || callbackURL == "" {
		log.Println("Error: Google OAuth environment variables are not set in .env")
	}

	// Configure session store
	sessionSecret := os.Getenv("SESSION_SECRET")
	if sessionSecret == "" {
		sessionSecret = "default-session-secret"
	}
	log.Println("session key: ", sessionSecret)

	store := sessions.NewCookieStore([]byte(sessionSecret))

	log.Println("is production: ", isProduction)

	domain := os.Getenv("SESSION_COOKIE_DOMAIN")
	if domain == "" {
		domain = "localhost"
	}
	log.Println("domain: ", domain)

	store.Options = &sessions.Options{
		HttpOnly: true,
		Secure:   isProduction, // Enable secure cookies in production
		Path:     "/",
		MaxAge:   86400 * 30, // 30 days
		Domain:   domain,
	}

	gothic.Store = store

	// Configure Google provider
	goth.UseProviders(
		google.New(clientID, clientSecret, callbackURL, "email", "profile"),
	)
}

func NewServer() *http.Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	NewServer := &Server{
		port: port,
		db:   store.New(isProduction),
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
