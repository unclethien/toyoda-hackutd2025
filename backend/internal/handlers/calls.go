package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
)

// CallSubmitRequest represents the request from frontend for a single call
type CallSubmitRequest struct {
	Model        string  `json:"model"`
	Year         int     `json:"year"`
	ZipCode      string  `json:"zipcode"`
	DealerName   string  `json:"dealer_name"`
	PhoneNumber  string  `json:"phone_number"`
	MSRP         float64 `json:"msrp"`
	ListingPrice float64 `json:"listing_price"`
}

// AgentCallRequest represents the request to send to the agent service
type AgentCallRequest struct {
	UserID       string `json:"user_id"`
	Make         string `json:"make"`
	Model        string `json:"model"`
	Year         string `json:"year"`
	ZipCode      string `json:"zipcode"`
	DealerName   string `json:"dealer_name"`
	PhoneNumber  string `json:"phone_number"`
	MSRP         string `json:"msrp"`
	ListingPrice string `json:"listing_price"`
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
		agentRequests[i] = AgentCallRequest{
			UserID:       generateUserID(),
			Make:         "toyota", // Constant as specified
			Model:        req.Model,
			Year:         strconv.Itoa(req.Year),
			ZipCode:      req.ZipCode,
			DealerName:   req.DealerName,
			PhoneNumber:  req.PhoneNumber,
			MSRP:         fmt.Sprintf("%f", req.MSRP),
			ListingPrice: fmt.Sprintf("%f", req.ListingPrice),
		}
		log.Printf("Generated call request %d: user_id=%s, dealer=%s, phone=%s, model=%s %d",
			i+1, agentRequests[i].UserID, req.DealerName, req.PhoneNumber, req.Model, req.Year)
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
	agentURL := "http://localhost:8000/calls/init"

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

	// TODO: Store this information in a persistent data structure
	// For now, just log and acknowledge receipt

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(CallFinishResponse{
		Success: true,
		Message: "Call completion recorded successfully",
	})
}
