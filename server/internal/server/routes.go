package server

import (
	"net/http"

	"github.com/epot/gifterv2/internal/handlers"
	"github.com/epot/gifterv2/internal/middleware"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/markbates/goth/gothic"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
	}))

	// Root and health routes
	r.Get("/", handlers.HelloWorldHandler)
	r.Get("/health", handlers.HealthHandler(s.db))

	// Authentication routes
	r.Post("/auth/login", handlers.LoginHandler(s.db))
	r.Post("/auth/signup", handlers.SignupHandler(s.db))
	r.Get("/auth", gothic.BeginAuthHandler)
	r.Get("/auth/callback", handlers.GoogleCallbackHandler(s.db))
	r.Get("/auth/logout", handlers.LogoutHandler)

	// API routes (protected)
	r.With(middleware.AuthMiddleware).Get("/api/user", handlers.GetUserHandler(s.db))
	r.With(middleware.AuthMiddleware).Get("/api/events", handlers.GetEvents(s.db))
	r.With(middleware.AuthMiddleware).Post("/api/events/create", handlers.CreateEvent(s.db))

	return r
}
