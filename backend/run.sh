#!/bin/bash

# Script to build and run the Go backend server

echo "🚀 Starting Car Seller API Backend..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Error: Go is not installed. Please install Go 1.21 or higher."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
go mod download
go mod tidy

# Create bin directory if it doesn't exist
mkdir -p bin

# Build the application
echo "🔨 Building application..."
if ! go build -o bin/server ./cmd/server; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Run the server
echo "🌐 Starting server on port 8080..."
echo "📍 API endpoint: http://localhost:8080/api/sellers"
echo "💚 Health check: http://localhost:8080/health"
echo ""
echo "Example usage:"
echo "  curl 'http://localhost:8080/api/sellers?zip=75007&radius=50'"
echo ""
echo "Press Ctrl+C to stop the server"
echo "---"

./bin/server

