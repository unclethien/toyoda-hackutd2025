# Car Seller API Backend

A Go backend service that fetches car listings from CARFAX API and exposes them through a simple REST API.

## 📁 Project Structure

```
backend/
├── cmd/
│   └── server/          # Main application entry point
│       └── main.go      # Server initialization and routing
├── internal/
│   ├── handlers/        # HTTP request handlers
│   │   └── sellers.go   # Car sellers API handler
│   └── models/          # Data models and types
│       └── types.go     # Response structures
├── docs/                # Documentation
│   ├── API.md          # API documentation
│   └── README.md       # Detailed project documentation
├── bin/                 # Compiled binaries (gitignored)
├── go.mod              # Go module dependencies
├── go.sum              # Dependency checksums
├── Makefile            # Build automation
├── run.sh              # Quick start script
└── .gitignore          # Git ignore patterns
```

## 🚀 Quick Start

### Option 1: Using the run script (Recommended)
```bash
./run.sh
```

### Option 2: Using Make
```bash
make deps    # Install dependencies (first time only)
make build   # Build the application
make run     # Run the server
```

Or combine build and run:
```bash
make dev
```

### Option 3: Using Go directly
```bash
go mod download
go build -o bin/server ./cmd/server
./bin/server
```

The server will start on `http://localhost:8080`

## 📡 API Endpoints

### Get Car Sellers
```bash
GET /api/sellers?zip=<zip>&radius=<radius>
```

**Example:**
```bash
curl "http://localhost:8080/api/sellers?zip=75007&radius=50"
```

### Health Check
```bash
GET /health
```

**Example:**
```bash
curl "http://localhost:8080/health"
```

For complete API documentation, see [docs/API.md](docs/API.md).

## 🛠 Development

### Build Commands

```bash
make build   # Build the application
make run     # Run the built application
make dev     # Build and run in one command
make clean   # Clean build artifacts
make test    # Run tests
make deps    # Download and tidy dependencies
```

### Project Organization

The project follows the standard Go project layout:

- **`cmd/server`**: Contains the main application entry point. This is where the server is initialized and routes are configured.

- **`internal/`**: Contains private application code that cannot be imported by other projects.
  - **`handlers/`**: HTTP request handlers and business logic
  - **`models/`**: Data structures and type definitions

- **`docs/`**: Project documentation including API specs and user guides

- **`bin/`**: Build output directory (automatically created, gitignored)

### Adding New Features

1. **New API Endpoint**: Add handler in `internal/handlers/` and register route in `cmd/server/main.go`
2. **New Data Model**: Add type definitions in `internal/models/types.go`
3. **Update Documentation**: Update `docs/API.md` with new endpoint details

## 🔧 Configuration

The server can be configured using environment variables:

- `PORT`: Server port (default: 8080)

Example:
```bash
PORT=3000 ./bin/server
```

## 📦 Dependencies

- **gorilla/mux**: HTTP router and URL matcher
- **rs/cors**: CORS middleware for handling cross-origin requests

## 🧪 Testing

Run tests with:
```bash
make test
```

Or directly:
```bash
go test -v ./...
```

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Full Documentation](docs/README.md) - Detailed project documentation

## ✅ Features

- ✅ Clean project structure following Go best practices
- ✅ RESTful API design
- ✅ CORS enabled for frontend integration
- ✅ Automatic gzip decompression
- ✅ Comprehensive error handling
- ✅ Type-safe data models
- ✅ Easy to extend and maintain

## 🚀 Production Deployment

To build for production:

```bash
# Build optimized binary
go build -ldflags="-s -w" -o bin/server ./cmd/server

# Run
./bin/server
```

For containerization, create a `Dockerfile`:

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o bin/server ./cmd/server

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/bin/server .
EXPOSE 8080
CMD ["./server"]
```

## 📝 License

This project is part of HackUTD 2025.

