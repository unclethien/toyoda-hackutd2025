.PHONY: build run dev clean test help

# Default target
help:
	@echo "Available commands:"
	@echo "  make build    - Build the application"
	@echo "  make run      - Run the application"
	@echo "  make dev      - Build and run the application"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make test     - Run tests"
	@echo "  make deps     - Download dependencies"

# Build the application
build:
	@echo "Building..."
	go build -o bin/server ./cmd/server

# Run the application
run:
	@echo "Starting server..."
	./bin/server

# Build and run
dev: build
	@echo "Starting development server..."
	./bin/server

# Clean build artifacts
clean:
	@echo "Cleaning..."
	rm -rf bin/
	go clean

# Run tests
test:
	@echo "Running tests..."
	go test -v ./...

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

