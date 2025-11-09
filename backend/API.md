# API Documentation

## Base URL
```
http://localhost:8080
```

## Endpoints

### 1. Get Car Sellers

Fetch a list of car sellers and their available vehicles based on location.

**Endpoint:** `GET /api/sellers`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| zip | string | Yes | - | ZIP code for the search location |
| radius | integer | No | 50 | Search radius in miles |

**Example Requests:**

```bash
# Basic request
curl "http://localhost:8080/api/sellers?zip=75007&radius=50"

# Different location
curl "http://localhost:8080/api/sellers?zip=90210&radius=25"

# Using default radius
curl "http://localhost:8080/api/sellers?zip=10001"
```

**Success Response (200 OK):**

```json
{
  "searchArea": {
    "zip": "75007",
    "radius": 50,
    "dynamicRadius": true,
    "city": "Carrollton",
    "state": "TX",
    "latitude": 33.0071,
    "longitude": -96.899,
    "dynamicRadii": [50, 100, 200]
  },
  "listings": [
    {
      "dealer": {
        "carfaxId": "4MVI4HL001",
        "name": "Freeman Toyota",
        "address": "204 NE Loop 820",
        "city": "Hurst",
        "state": "TX",
        "zip": "76053",
        "phone": "8179044876",
        "latitude": "32.811453",
        "longitude": "-97.206943",
        "dealerAverageRating": 4.6,
        "dealerReviewCount": 1118,
        "dealerInventoryUrl": "http://freemantoyota.com"
      },
      "id": "3TMLB5JN8SM1942124MVI4HL00120251022",
      "vin": "3TMLB5JN8SM194212",
      "year": 2025,
      "make": "Toyota",
      "model": "Tacoma",
      "trim": "TRD Off Road",
      "listPrice": 45382,
      "currentPrice": 45382,
      "mileage": 1,
      "monthlyPaymentEstimate": {
        "price": 45382,
        "downPaymentPercent": 10,
        "interestRate": 5.400000095367432,
        "termInMonths": 60,
        "loanAmount": 40843.8,
        "monthlyPayment": 778.28
      },
      "images": {
        "baseUrl": "https://carfax-img.vast.com/carfax/v2/6481768334785240722/",
        "firstPhoto": {
          "large": "https://carfax-img.vast.com/carfax/v2/6481768334785240722/1/640x480",
          "medium": "https://carfax-img.vast.com/carfax/v2/6481768334785240722/1/344x258",
          "small": "https://carfax-img.vast.com/carfax/v2/6481768334785240722/1/120x90"
        }
      },
      "distanceToDealer": 22.400932137800893,
      "vehicleCondition": "New",
      "mpgCity": 19,
      "mpgHighway": 24,
      "engine": "4 Cyl",
      "transmission": "Automatic",
      "fuel": "Gasoline"
    }
  ]
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing zip parameter
{
  "error": "zip parameter is required"
}

// 500 Internal Server Error
{
  "error": "Failed to fetch data: <error message>"
}
```

### 2. Submit Calls to Dealers

Initiate phone calls to dealers through the agent service. This endpoint receives car/dealer information from the frontend and forwards it to the agent service with generated user IDs.

**Endpoint:** `POST /api/calls/submit`

**Request Body:**

```json
[
  {
    "model": "Camry",
    "year": 2025,
    "zipcode": "75007",
    "dealer_name": "Freeman Toyota",
    "phone_number": "8179044876",
    "msrp": 30000,
    "listing_price": 28500
  }
]
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | string | Yes | Car model name |
| year | integer | Yes | Year the car was produced |
| zipcode | string | Yes | ZIP code for the dealer location |
| dealer_name | string | Yes | Name of the dealer |
| phone_number | string | Yes | Dealer's phone number |
| msrp | float | Yes | Manufacturer's Suggested Retail Price |
| listing_price | float | Yes | Current listing price |

**Example Request:**

```bash
curl -X POST http://localhost:8080/api/calls/submit \
  -H "Content-Type: application/json" \
  -d '[
    {
      "model": "Camry",
      "year": 2025,
      "zipcode": "75007",
      "dealer_name": "Freeman Toyota",
      "phone_number": "8179044876",
      "msrp": 30000,
      "listing_price": 28500
    },
    {
      "model": "RAV4",
      "year": 2025,
      "zipcode": "75007",
      "dealer_name": "Toyota of Plano",
      "phone_number": "9724681800",
      "msrp": 35000,
      "listing_price": 33500
    }
  ]'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Calls initiated successfully",
  "data": {
    // Response from agent service
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid request body
{
  "success": false,
  "message": "Invalid request body: <error details>"
}

// 400 Bad Request - No requests provided
{
  "success": false,
  "message": "At least one call request is required"
}

// 400 Bad Request - Missing required fields
{
  "success": false,
  "message": "Request 0: Missing required fields (model, year, zipcode, dealer_name, phone_number)"
}

// 500 Internal Server Error - Agent service error
{
  "success": false,
  "message": "Failed to initiate calls: <error details>"
}
```

**Backend to Agent Service:**

The backend transforms the request and calls the agent service at `http://localhost:8000/calls/init` with:

```json
[
  {
    "user_id": "generated-uuid-v4",
    "make": "toyota",
    "model": "Camry",
    "year": 2025,
    "zipcode": "75007",
    "dealer_name": "Freeman Toyota",
    "phone_number": "8179044876",
    "msrp": 30000,
    "listing_price": 28500
  }
]
```

**Notes:**
- The backend automatically generates a unique `user_id` (UUID v4) for each call request
- The `make` field is automatically set to `"toyota"` (constant)
- The agent service must be running on `localhost:8000` for this endpoint to work
- Multiple call requests can be submitted in a single API call

### 3. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Example Request:**

```bash
curl "http://localhost:8080/health"
```

**Success Response (200 OK):**

```json
{
  "status": "ok"
}
```

## Response Fields

### Search Area Object

| Field | Type | Description |
|-------|------|-------------|
| zip | string | Search ZIP code |
| radius | integer | Search radius in miles |
| city | string | City name |
| state | string | State abbreviation |
| latitude | float | Latitude coordinate |
| longitude | float | Longitude coordinate |

### Dealer Object

| Field | Type | Description |
|-------|------|-------------|
| name | string | Dealer name |
| phone | string | Contact phone number |
| address | string | Street address |
| city | string | City |
| state | string | State abbreviation |
| zip | string | ZIP code |
| latitude | string | Latitude coordinate |
| longitude | string | Longitude coordinate |
| dealerAverageRating | float | Average customer rating (0-5) |
| dealerReviewCount | integer | Number of reviews |

### Listing Object

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique listing identifier |
| vin | string | Vehicle Identification Number |
| year | integer | Vehicle year |
| make | string | Vehicle manufacturer |
| model | string | Vehicle model |
| trim | string | Trim level |
| listPrice | integer | List price in USD |
| currentPrice | integer | Current price in USD |
| mileage | integer | Odometer reading |
| vehicleCondition | string | "New" or "Used" |
| engine | string | Engine description |
| transmission | string | Transmission type |
| fuel | string | Fuel type |
| mpgCity | integer | City fuel economy |
| mpgHighway | integer | Highway fuel economy |
| distanceToDealer | float | Distance to dealer in miles |

## CORS

The API has CORS enabled and accepts requests from any origin.

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider adding rate limiting middleware.

## Notes

- The API fetches data from CARFAX Helix API
- Currently hardcoded to search for new Toyota vehicles
- Results are limited to 24 listings per request
- The API includes vehicle images, payment estimates, and dealer information

