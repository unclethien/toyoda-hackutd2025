#!/bin/bash

# Test script for the /api/calls/submit endpoint
# Make sure the backend server is running before executing this script

echo "Testing /api/calls/submit endpoint..."
echo ""

# Test 1: Valid request with one call
echo "Test 1: Valid request with one dealer"
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
    }
  ]'
echo -e "\n\n"

# Test 2: Valid request with multiple calls
echo "Test 2: Valid request with multiple dealers"
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
echo -e "\n\n"

# Test 3: Invalid request - missing required field
echo "Test 3: Invalid request - missing phone_number"
curl -X POST http://localhost:8080/api/calls/submit \
  -H "Content-Type: application/json" \
  -d '[
    {
      "model": "Camry",
      "year": 2025,
      "zipcode": "75007",
      "dealer_name": "Freeman Toyota",
      "msrp": 30000,
      "listing_price": 28500
    }
  ]'
echo -e "\n\n"

# Test 4: Invalid request - empty array
echo "Test 4: Invalid request - empty array"
curl -X POST http://localhost:8080/api/calls/submit \
  -H "Content-Type: application/json" \
  -d '[]'
echo -e "\n\n"

echo "Tests completed!"

