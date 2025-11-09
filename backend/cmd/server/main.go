package main

import (
	"log"
	"net/http"
	"os"

	"hackutd2025/backend/internal/handlers"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// Create router
	router := mux.NewRouter()

	// Register routes
	router.HandleFunc("/api/sellers", handlers.GetSellers).Methods("GET")
	router.HandleFunc("/api/dealers/search", handlers.SearchDealers).Methods("POST")
	router.HandleFunc("/api/calls/submit", handlers.SubmitCalls).Methods("POST")
	router.HandleFunc("/api/calls/finish", handlers.FinishCall).Methods("POST")

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// Wrap router with CORS middleware
	handler := c.Handler(router)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s...", port)
	log.Printf("API endpoint: http://localhost:%s/api/sellers?zip=75007&radius=50", port)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
