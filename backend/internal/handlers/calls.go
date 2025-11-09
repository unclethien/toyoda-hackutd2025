package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"hackutd2025/backend/internal/database"

	"github.com/google/uuid"
)

// CallSubmitRequest represents the request from frontend for a single call
type CallSubmitRequest struct {
	UserID       string `json:"user_id"`
	Model        string `json:"model"`
	Year         int    `json:"year"`
	ZipCode      string `json:"zipcode"`
	DealerName   string `json:"dealer_name"`
	PhoneNumber  string `json:"phone_number"`
	MSRP         int64  `json:"msrp"`
	ListingPrice int64  `json:"listing_price"`
}

// AgentCallRequest represents the request to send to the agent service
type AgentCallRequest struct {
	CallID         string `json:"user_id"`
	Make           string `json:"make"`
	Model          string `json:"model"`
	Year           string `json:"year"`
	ZipCode        string `json:"zipcode"`
	DealerName     string `json:"dealer_name"`
	PhoneNumber    string `json:"phone_number"`
	MSRP           string `json:"msrp"`
	ListingPrice   string `json:"listing_price"`
	IsDealing      bool   `json:"is_dealing"`
	CompetingPrice int    `json:"competing_price"`
}

// CallSubmitResponse represents the response from the agent service
type CallSubmitResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// SubmitCalls handles POST /api/calls/submit
// Receives call requests from frontend and forwards them to the agent service
func SubmitCalls(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse request body
	var requests []CallSubmitRequest
	if err := json.NewDecoder(r.Body).Decode(&requests); err != nil {
		log.Printf("Error decoding request: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CallSubmitResponse{
			Success: false,
			Message: fmt.Sprintf("Invalid request body: %v", err),
		})
		return
	}

	// Validate that we have at least one request
	if len(requests) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CallSubmitResponse{
			Success: false,
			Message: "At least one call request is required",
		})
		return
	}

	// Validate each request
	for i, req := range requests {
		if req.Model == "" || req.Year == 0 || req.ZipCode == "" || req.DealerName == "" || req.PhoneNumber == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(CallSubmitResponse{
				Success: false,
				Message: fmt.Sprintf("Request %d: Missing required fields (model, year, zipcode, dealer_name, phone_number)", i),
			})
			return
		}
	}

	log.Printf("Received %d call request(s)", len(requests))

	// Transform requests and add generated fields
	agentRequests := make([]AgentCallRequest, len(requests))
	for i, req := range requests {
		callID := generateUserID()

		// Check for existing deals for the same car
		bestPrice, hasExistingDeal, err := database.GetBestDealForCar(req.Model, req.Year, req.ZipCode)
		isDealing := false
		competingPrice := 0

		if err != nil {
			log.Printf("⚠️  Warning: Failed to check for existing deals: %v", err)
		} else if hasExistingDeal {
			isDealing = true
			competingPrice = int(bestPrice)
			log.Printf("💰 Found existing deal for %s %d in %s: $%d", req.Model, req.Year, req.ZipCode, competingPrice)
		}

		agentRequests[i] = AgentCallRequest{
			CallID:         callID,
			Make:           "toyota", // Constant as specified
			Model:          req.Model,
			Year:           strconv.Itoa(req.Year),
			ZipCode:        req.ZipCode,
			DealerName:     req.DealerName,
			PhoneNumber:    req.PhoneNumber,
			MSRP:           strconv.FormatInt(req.MSRP, 10),
			ListingPrice:   strconv.FormatInt(req.ListingPrice, 10),
			IsDealing:      isDealing,
			CompetingPrice: competingPrice,
		}

		if isDealing {
			log.Printf("Generated call request %d: user_id=%s, dealer=%s, phone=%s, model=%s %d, competing_price=$%d",
				i+1, callID, req.DealerName, req.PhoneNumber, req.Model, req.Year, competingPrice)
		} else {
			log.Printf("Generated call request %d: user_id=%s, dealer=%s, phone=%s, model=%s %d (no existing deals)",
				i+1, callID, req.DealerName, req.PhoneNumber, req.Model, req.Year)
		}

		// Store call in database
		if err := database.CreateCall(req.UserID, agentRequests[i].CallID, req.Model, req.Year, req.ZipCode, req.DealerName, req.PhoneNumber, req.MSRP, req.ListingPrice); err != nil {
			log.Printf("⚠️  Warning: Failed to store call in database: %v", err)
		} else {
			log.Printf("✅ Call stored in database: %s", agentRequests[i].CallID)
		}
	}

	// Call the agent service
	agentResponse, err := callAgentService(agentRequests)
	if err != nil {
		log.Printf("Error calling agent service: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CallSubmitResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to initiate calls: %v", err),
		})
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(CallSubmitResponse{
		Success: true,
		Message: "Calls initiated successfully",
		Data:    agentResponse,
	})
}

// generateUserID generates a unique user ID for each call
func generateUserID() string {
	// Generate UUID
	return uuid.New().String()
}

// callAgentService makes a request to the agent service to initiate calls
func callAgentService(requests []AgentCallRequest) (interface{}, error) {
	agentURL := "https://unimplicitly-ebracteate-loma.ngrok-free.dev/calls/init"

	// Marshal requests to JSON
	jsonData, err := json.Marshal(requests)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	log.Printf("Calling agent service at %s with payload: %s", agentURL, string(jsonData))

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Create request
	req, err := http.NewRequest("POST", agentURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Execute request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errorBody bytes.Buffer
		errorBody.ReadFrom(resp.Body)
		return nil, fmt.Errorf("agent service returned status %d: %s", resp.StatusCode, errorBody.String())
	}

	// Parse response
	var agentResponse interface{}
	if err := json.NewDecoder(resp.Body).Decode(&agentResponse); err != nil {
		return nil, fmt.Errorf("failed to parse agent response: %w", err)
	}

	log.Printf("Successfully initiated calls with agent service")
	return agentResponse, nil
}

// CallFinishRequest represents the request from agent service when a call is finished
type CallFinishRequest struct {
	UserID      string `json:"user_id"`
	IsAvailable bool   `json:"is_available"`
	DealPrice   int    `json:"deal_price"`
	Remarks     string `json:"remarks"`
}

// CallFinishResponse represents the response to the agent service
type CallFinishResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// FinishCall handles POST /api/calls/finish
// Receives notification from agent service when a call is completed
func FinishCall(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse request body
	var request CallFinishRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		log.Printf("Error decoding call finish request: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CallFinishResponse{
			Success: false,
			Message: fmt.Sprintf("Invalid request body: %v", err),
		})
		return
	}

	// Validate required fields
	if request.UserID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CallFinishResponse{
			Success: false,
			Message: "user_id is required",
		})
		return
	}

	// Log the call completion details
	log.Printf("Call finished - UserID: %s, IsAvailable: %t, DealPrice: %d, Remarks: %s",
		request.UserID, request.IsAvailable, request.DealPrice, request.Remarks)

	// Update call in database
	if err := database.UpdateCallResult(request.UserID, request.IsAvailable, request.DealPrice, request.Remarks); err != nil {
		log.Printf("⚠️  Warning: Failed to update call in database: %v", err)
	} else {
		log.Printf("✅ Call updated in database: %s", request.UserID)
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(CallFinishResponse{
		Success: true,
		Message: "Call completion recorded successfully",
	})
}

// GetCall retrieves a specific call by user ID
func GetCall(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "user_id parameter is required",
		})
		return
	}

	call, err := database.GetCallByUserID(userID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Call not found",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    call,
	})
}

// GetAllCalls retrieves all calls with optional status filter
func GetAllCalls(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	status := r.URL.Query().Get("status")

	var calls []database.Call
	var err error

	if status != "" {
		calls, err = database.GetCallsByStatus(status)
	} else {
		calls, err = database.GetAllCalls()
	}

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Failed to retrieve calls",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"count":   len(calls),
		"data":    calls,
	})
}
