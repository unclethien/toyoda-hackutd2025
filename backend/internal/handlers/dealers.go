package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

// DealerSearchRequest represents the search criteria from frontend
type DealerSearchRequest struct {
	Make        string `json:"make"`
	Model       string `json:"model"`
	Version     string `json:"version"`
	ZipCode     string `json:"zipCode"`
	RadiusMiles int    `json:"radiusMiles"`
}

// DealerResponse represents a single dealer with car listing
type DealerResponse struct {
	DealerName      string  `json:"dealerName"`
	Phone           string  `json:"phone"`
	Address         string  `json:"address"`
	MSRP            float64 `json:"msrp"`
	DiscountedPrice float64 `json:"discountedPrice"`
	MPG             int     `json:"mpg"`
	Distance        float64 `json:"distance"`
}

// DealerSearchResponse represents the API response
type DealerSearchResponse struct {
	Success bool             `json:"success"`
	Dealers []DealerResponse `json:"dealers"`
	Count   int              `json:"count"`
	Message string           `json:"message"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Message string `json:"message"`
}

// SearchDealers handles POST /api/dealers/search
// This will integrate with CARFAX API in the future
func SearchDealers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse request body
	var req DealerSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding request: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Success: false,
			Error:   "Invalid request body",
			Message: err.Error(),
		})
		return
	}

	// Validate request
	if req.Make == "" || req.Model == "" || req.Version == "" || req.ZipCode == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Success: false,
			Error:   "Missing required fields",
			Message: "Make, Model, Version, and ZipCode are required",
		})
		return
	}

	log.Printf("Searching for: %s %s %s near %s (radius: %d miles)",
		req.Make, req.Model, req.Version, req.ZipCode, req.RadiusMiles)

	// TODO: Call CARFAX API here
	// For now, return mock data
	mockDealers := generateMockDealers(req)

	response := DealerSearchResponse{
		Success: true,
		Dealers: mockDealers,
		Count:   len(mockDealers),
		Message: "Successfully retrieved dealers",
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// generateMockDealers creates test dealer data
// This will be replaced with real CARFAX API calls
func generateMockDealers(req DealerSearchRequest) []DealerResponse {
	basePrice := 35000.0

	// Generate different dealers based on the car model
	dealerNames := []string{
		req.Make + " of Dallas",
		req.Make + " of Plano",
		req.Make + " of Frisco",
		"AutoNation " + req.Make,
		"Sewell " + req.Make,
	}

	dealers := make([]DealerResponse, 0)

	for i, name := range dealerNames {
		discount := float64(i) * 500 // Increasing discount per dealer
		dealers = append(dealers, DealerResponse{
			DealerName:      name,
			Phone:           generateMockPhone(i),
			Address:         generateMockAddress(i, req.ZipCode),
			MSRP:            basePrice,
			DiscountedPrice: basePrice - discount,
			MPG:             28 + (i % 3),
			Distance:        5.5 + float64(i)*3.2,
		})
	}

	return dealers
}

func generateMockPhone(index int) string {
	phones := []string{
		"469-535-8000",
		"972-468-1800",
		"214-291-2000",
		"469-209-1000",
		"972-661-9000",
	}
	if index < len(phones) {
		return phones[index]
	}
	return "972-000-0000"
}

func generateMockAddress(index int, zipCode string) string {
	addresses := []string{
		"6000 Central Expy, Plano, TX 75023",
		"5300 N Central Expy, Dallas, TX 75205",
		"8400 Gaylord Pkwy, Frisco, TX 75034",
		"14900 N Dallas Pkwy, Dallas, TX 75254",
		"2700 N Stemmons Fwy, Dallas, TX 75207",
	}
	if index < len(addresses) {
		return addresses[index]
	}
	return "Unknown Address"
}
