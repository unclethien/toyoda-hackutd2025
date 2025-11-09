package database

import (
	"context"
	"fmt"
	"time"
)

// Call represents a call record in the database
type Call struct {
	ID           int64     `json:"id"`
	UserID       *string   `json:"user_id,omitempty"`
	CallID       *string   `json:"call_id,omitempty"`
	Model        *string   `json:"model,omitempty"`
	Year         *int      `json:"year,omitempty"`
	ZipCode      *string   `json:"zipcode,omitempty"`
	DealerName   *string   `json:"dealer_name,omitempty"`
	PhoneNumber  *string   `json:"phone_number,omitempty"`
	MSRP         *int64    `json:"msrp,omitempty"`
	ListingPrice *int64    `json:"listing_price,omitempty"`
	Status       *string   `json:"status,omitempty"`
	IsAvailable  *bool     `json:"is_available,omitempty"`
	DealPrice    *int64    `json:"deal_price,omitempty"`
	Remarks      *string   `json:"remarks,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CreateCall inserts a new call record with backend-generated call_id
func CreateCall(userID, callID, model string, year int, zipcode, dealerName, phoneNumber string, msrp, listingPrice int64) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		INSERT INTO calls (user_id, call_id, model, year, zipcode, dealer_name, phone_number, msrp, listing_price, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
	`

	_, err := Pool.Exec(ctx, query, userID, callID, model, year, zipcode, dealerName, phoneNumber, msrp, listingPrice)
	return err
}

// UpdateCallResult updates a call with completion results
func UpdateCallResult(callID string, isAvailable bool, dealPrice int, remarks string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	status := "completed"
	if !isAvailable {
		status = "failed"
	}

	// Convert int to int64 for deal_price
	dealPriceInt := int64(dealPrice)

	query := `
		UPDATE calls 
		SET is_available = $2, deal_price = $3, remarks = $4, status = $5, updated_at = now()
		WHERE call_id = $1
	`

	result, err := Pool.Exec(ctx, query, callID, isAvailable, dealPriceInt, remarks, status)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("no call found with call_id: %s", callID)
	}

	return nil
}

// GetCallByUserID retrieves a call by user ID
func GetCallByUserID(userID string) (*Call, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		SELECT id, user_id, call_id, model, year, zipcode, dealer_name, phone_number, 
		       msrp, listing_price, status, is_available, deal_price, remarks,
		       created_at, updated_at
		FROM calls
		WHERE user_id = $1
	`

	call := &Call{}
	err := Pool.QueryRow(ctx, query, userID).Scan(
		&call.ID, &call.UserID, &call.CallID, &call.Model, &call.Year, &call.ZipCode,
		&call.DealerName, &call.PhoneNumber, &call.MSRP, &call.ListingPrice,
		&call.Status, &call.IsAvailable, &call.DealPrice, &call.Remarks,
		&call.CreatedAt, &call.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return call, nil
}

// GetAllCalls retrieves all calls
func GetAllCalls() ([]Call, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT id, user_id, call_id, model, year, zipcode, dealer_name, phone_number, 
		       msrp, listing_price, status, is_available, deal_price, remarks,
		       created_at, updated_at
		FROM calls
		ORDER BY created_at DESC
	`

	rows, err := Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var calls []Call
	for rows.Next() {
		var call Call
		err := rows.Scan(
			&call.ID, &call.UserID, &call.CallID, &call.Model, &call.Year, &call.ZipCode,
			&call.DealerName, &call.PhoneNumber, &call.MSRP, &call.ListingPrice,
			&call.Status, &call.IsAvailable, &call.DealPrice, &call.Remarks,
			&call.CreatedAt, &call.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		calls = append(calls, call)
	}

	return calls, rows.Err()
}

// GetCallsByStatus retrieves calls filtered by status
func GetCallsByStatus(status string) ([]Call, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
		SELECT id, user_id, call_id, model, year, zipcode, dealer_name, phone_number, 
		       msrp, listing_price, status, is_available, deal_price, remarks,
		       created_at, updated_at
		FROM calls
		WHERE status = $1
		ORDER BY created_at DESC
	`

	rows, err := Pool.Query(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var calls []Call
	for rows.Next() {
		var call Call
		err := rows.Scan(
			&call.ID, &call.UserID, &call.CallID, &call.Model, &call.Year, &call.ZipCode,
			&call.DealerName, &call.PhoneNumber, &call.MSRP, &call.ListingPrice,
			&call.Status, &call.IsAvailable, &call.DealPrice, &call.Remarks,
			&call.CreatedAt, &call.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		calls = append(calls, call)
	}

	return calls, rows.Err()
}

// GetBestDealForCar finds the best (lowest) deal price for a specific car
// Returns the lowest deal_price and true if found, or 0 and false if no deals exist
func GetBestDealForCar(model string, year int, zipcode string) (int64, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		SELECT MIN(deal_price) as best_price
		FROM calls
		WHERE model = $1 
		  AND year = $2 
		  AND zipcode = $3 
		  AND status = 'completed'
		  AND is_available = true
		  AND deal_price IS NOT NULL
		  AND deal_price > 0
	`

	var bestPrice *int64
	err := Pool.QueryRow(ctx, query, model, year, zipcode).Scan(&bestPrice)

	if err != nil {
		return 0, false, err
	}

	// If no deals found, bestPrice will be nil
	if bestPrice == nil {
		return 0, false, nil
	}

	return *bestPrice, true, nil
}
