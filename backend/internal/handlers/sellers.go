package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"hackutd2025/backend/internal/models"
)

// GetSellers handles requests to get car sellers
func GetSellers(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(models.ErrorResponse{Error: "Method not allowed"})
		return
	}

	// Get query parameters
	queryParams := r.URL.Query()
	zip := queryParams.Get("zip")
	radius := queryParams.Get("radius")
	model := queryParams.Get("model")

	// Validate required parameters
	if zip == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ErrorResponse{Error: "zip parameter is required"})
		return
	}

	if radius == "" {
		radius = "50" // Default radius
	}

	if model == "" {
		model = "RAV4"
	}

	// Build CARFAX API URL
	carfaxURL := buildCarfaxURL(zip, radius, model)

	// Make request to CARFAX API
	response, err := makeCarfaxRequest(carfaxURL)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.ErrorResponse{Error: fmt.Sprintf("Failed to fetch data: %v", err)})
		return
	}

	// Return the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// buildCarfaxURL constructs the CARFAX API URL with parameters
func buildCarfaxURL(zip, radius, model string) string {
	baseURL := "https://helix.carfax.com/search/v2/vehicles"
	params := url.Values{}
	params.Add("zip", zip)
	params.Add("radius", radius)
	params.Add("model", model)
	params.Add("sort", "BEST")
	params.Add("dynamicRadius", "true")
	params.Add("make", "Toyota")
	params.Add("vehicleCondition", "NEW")
	params.Add("rows", "24")
	params.Add("fetchImageLimit", "6")
	params.Add("tpPositions", "1,2,3")

	return fmt.Sprintf("%s?%s", baseURL, params.Encode())
}

// makeCarfaxRequest makes the HTTP request to CARFAX API
func makeCarfaxRequest(carfaxURL string) (*models.CarfaxResponse, error) {
	// Create HTTP client
	client := &http.Client{}

	// Create request
	req, err := http.NewRequest("GET", carfaxURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Add headers
	// Note: Not setting Accept-Encoding allows Go's http.Client to handle compression automatically
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")
	req.Header.Set("Referer", "https://www.carfax.com/")
	req.Header.Set("Origin", "https://www.carfax.com")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Sec-Fetch-Dest", "empty")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("Sec-Fetch-Site", "same-site")

	// Execute request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("CARFAX API returned status %d: %s", resp.StatusCode, string(body))
	}

	// Read response body (Go's http.Client automatically handles decompression)
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Parse JSON response
	var carfaxResponse models.CarfaxResponse
	if err := json.Unmarshal(body, &carfaxResponse); err != nil {
		return nil, fmt.Errorf("failed to parse JSON response: %w", err)
	}

	return &carfaxResponse, nil
}
