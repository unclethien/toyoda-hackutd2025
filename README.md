# HackUTD 2025 - Automated Dealer Outreach Platform

**Event**: HackUTD 2025
**Status**: Backend Implementation Complete | Frontend Planning Phase
**Tech Stack**: Go Backend + React Frontend (Planned)

## Project Overview

MVP platform enabling car buyers to search inventory across dealers and automate personalized phone calls requesting price quotes, featuring real-time tracking and follow-up automation.

**Current Implementation**: Go REST API serving dealer inventory data from CARFAX API

**Planned Implementation**: Full-stack app with React frontend + Convex backend + ElevenLabs voice calls

## Features

### Implemented (Backend v1)
- ✅ RESTful API for fetching car dealers and inventory
- ✅ CARFAX API integration with automatic gzip decompression
- ✅ ZIP code-based dealer search with configurable radius
- ✅ CORS-enabled for frontend integration
- ✅ Comprehensive error handling
- ✅ Type-safe data models
- ✅ Health check endpoint

### Planned (Full MVP)
- 🔲 User authentication (Auth0)
- 🔲 Car search session management
- 🔲 Advanced filtering & comparison UI
- 🔲 Automated batch calling (ElevenLabs)
- 🔲 Real-time call status tracking
- 🔲 Quote recording & management
- 🔲 Automatic follow-up automation

## Tech Stack

### Backend (Current - Go)
- **Language**: Go 1.21
- **Router**: gorilla/mux
- **Middleware**: rs/cors
- **Build Tool**: Makefile
- **API Source**: CARFAX Helix API

### Frontend (Planned - React)
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Data**: TanStack Query
- **Routing**: React Router

### Backend (Planned - Convex)
- **Platform**: Convex (serverless DB + functions)
- **Auth**: Auth0
- **Scheduler**: Built-in Convex scheduler
- **APIs**: ElevenLabs Batch Caller

## Quick Start

### Backend API (Current)

```bash
cd backend
./run.sh
```

Or using Make:
```bash
cd backend
make dev
```

Server starts on `http://localhost:8080`

### API Endpoints

**Get Car Sellers**:
```bash
curl "http://localhost:8080/api/sellers?zip=75007&radius=50"
```

**Health Check**:
```bash
curl "http://localhost:8080/health"
```

See [backend/API.md](backend/API.md) for complete API documentation.

## Project Structure

```
hackutd2025/
├── backend/                 # Go REST API (current implementation)
│   ├── cmd/server/         # Main application entry point
│   ├── internal/
│   │   ├── handlers/       # HTTP request handlers
│   │   └── models/         # Data structures
│   ├── bin/                # Compiled binaries (gitignored)
│   ├── API.md             # API documentation
│   ├── README.md          # Backend-specific docs
│   ├── Makefile           # Build automation
│   └── go.mod             # Go dependencies
├── plans/
│   └── app-calling-agent/  # Full MVP implementation plan
│       ├── 251108-app-calling-agent-implementation-plan.md
│       ├── IMPLEMENTATION-SUMMARY.md
│       ├── ARCHITECTURE.md
│       ├── API-CONTRACTS.md
│       └── QUICK-START.md
├── docs/                   # Project documentation
│   ├── project-overview-pdr.md
│   ├── codebase-summary.md
│   ├── code-standards.md
│   ├── system-architecture.md
│   └── project-roadmap.md
├── .claude/               # AI agent configuration
│   ├── agents/           # Specialized AI agents
│   ├── commands/         # Slash commands (50+)
│   ├── skills/           # Technology-specific knowledge
│   └── workflows/        # Development workflows
└── CLAUDE.md             # AI development instructions
```

## Development

### Backend Development

```bash
cd backend

# Install dependencies
make deps

# Build
make build

# Run
make run

# Build and run
make dev

# Run tests
make test

# Clean build artifacts
make clean
```

### Environment Configuration

```bash
# Backend
PORT=8080  # Server port (default)
```

## Implementation Status

### Phase 1: Backend API ✅ Complete
- [x] Go project structure
- [x] CARFAX API integration
- [x] RESTful endpoints
- [x] Error handling
- [x] CORS configuration
- [x] Documentation

### Phase 2: Frontend MVP 🔲 Planned
- [ ] Vite + React setup
- [ ] Auth0 integration
- [ ] Session management UI
- [ ] Inventory display & filtering
- [ ] Dealer comparison features

### Phase 3: Voice Integration 🔲 Planned
- [ ] Convex backend setup
- [ ] ElevenLabs API integration
- [ ] Batch call initiation
- [ ] Real-time status tracking
- [ ] Call script generation

### Phase 4: Quote Management 🔲 Planned
- [ ] Quote recording UI
- [ ] Email integration
- [ ] Follow-up automation
- [ ] Analytics dashboard

See [docs/project-roadmap.md](docs/project-roadmap.md) for detailed timeline.

## Documentation

- **[Backend API Documentation](backend/API.md)** - REST API reference
- **[Backend README](backend/README.md)** - Backend setup & development
- **[Project Overview PDR](docs/project-overview-pdr.md)** - Requirements & goals
- **[Codebase Summary](docs/codebase-summary.md)** - Code organization
- **[System Architecture](docs/system-architecture.md)** - Technical architecture
- **[Code Standards](docs/code-standards.md)** - Development guidelines
- **[Project Roadmap](docs/project-roadmap.md)** - Implementation timeline
- **[Implementation Plan](plans/app-calling-agent/251108-app-calling-agent-implementation-plan.md)** - Full MVP plan

## API Integration

### CARFAX Helix API
- **Endpoint**: `https://helix.carfax.com/search/v2/vehicles`
- **Parameters**: ZIP code, radius, make, condition
- **Response**: Dealer listings with inventory, pricing, images
- **Features**: Automatic gzip decompression, retry logic

### ElevenLabs (Planned)
- **Service**: Batch Caller API
- **Features**: AI-powered voice calls, webhooks, transcripts
- **Use Case**: Automated dealer outreach for price quotes

## Contributing

### Development Workflow
1. Read relevant documentation
2. Create feature branch
3. Implement changes
4. Write tests
5. Update documentation
6. Submit for review

### Code Standards
- Go: Standard Go project layout
- TypeScript: Strict mode enabled
- Testing: Unit tests required
- Documentation: Keep up-to-date
- Commits: Conventional commit format

See [docs/code-standards.md](docs/code-standards.md) for details.

## AI-Powered Development

This project uses ClaudeKit Engineer template with:
- **50+ Slash Commands**: `/cook`, `/plan`, `/test`, `/debug`, etc.
- **14 Specialized Agents**: Planner, Tester, Code Reviewer, etc.
- **20+ Skills**: Next.js, MongoDB, Docker, Cloudflare, etc.

See [CLAUDE.md](CLAUDE.md) for AI development instructions.

## License

HackUTD 2025 Hackathon Project

## Resources

- **HackUTD**: [hackutd.com](https://hackutd.com)
- **CARFAX API**: [helix.carfax.com](https://helix.carfax.com)
- **ElevenLabs**: [elevenlabs.io](https://elevenlabs.io)
- **Convex**: [convex.dev](https://convex.dev)
- **Auth0**: [auth0.com](https://auth0.com)

## Contact

**Project**: HackUTD 2025 Automated Dealer Outreach
**Repository**: GitHub
**Documentation**: `./docs/` directory

---

**Last Updated**: 2025-11-08
**Current Phase**: Backend API Complete | Frontend Planning
