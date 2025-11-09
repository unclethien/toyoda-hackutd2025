# TOYODA AI Caller - Mobile Web App

**HackUTD 2025** - Automated Dealer Outreach Platform

## �� Quick Start

### Prerequisites
- Node.js 18+
- Auth0 account (free tier works)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up Auth0** (see Auth0 Setup section below)

3. **Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your Auth0 credentials
```

4. **Start development servers**:

Terminal 1 - Frontend:
```bash
npm run dev
# Opens on http://localhost:5175
```

Terminal 2 - Convex:
```bash
npm run convex:dev
# Watches backend changes
```

## 📱 App Flow

1. **Homepage** - Simple landing page with "Get Started" button
2. **Auth0 Login** - Secure authentication
3. **Sessions List** - View all your car searches
4. **Create Session** - Enter car details (type, model, version, ZIP)
5. **Session Detail** - View dealers, select & call
6. **AI Calls** - ElevenLabs calls dealers for quotes
7. **Track Quotes** - Monitor and compare prices

## 🔐 Auth0 Setup

1. **Create Auth0 Account**: https://auth0.com

2. **Create Application**:
   - Go to Applications > Create Application
   - Name: "TOYODA AI Caller"
   - Choose "Single Page Web Applications"
   - Select "React"

3. **Configure Settings**:
   - **Allowed Callback URLs**: `http://localhost:5175, http://localhost:5173`
   - **Allowed Logout URLs**: `http://localhost:5175, http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5175, http://localhost:5173`

4. **Get Credentials**:
   - Copy **Domain** (e.g., `your-tenant.us.auth0.com`)
   - Copy **Client ID**

5. **Update `.env.local`**:
```env
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Mobile-first navbar with Auth
│   │   └── Logo.tsx            # TOYODA logo
│   ├── pages/
│   │   ├── HomePage.tsx        # Landing page
│   │   ├── SessionsPage.tsx    # List of car searches
│   │   ├── CreateSessionPage.tsx  # New search form
│   │   └── SessionDetailPage.tsx  # Dealer list & calling
│   ├── lib/
│   │   ├── auth.ts             # Auth0 provider
│   │   ├── schemas.ts          # Zod validation
│   │   └── utils.ts            # Helper functions
│   └── App.tsx                 # Main app with routing
├── convex/
│   ├── schema.ts               # Database schema
│   ├── sessions.ts             # Session CRUD
│   ├── listings.ts             # Listing CRUD
│   ├── calls.ts                # Call tracking
│   └── quotes.ts               # Quote management
└── .env.local                  # Environment variables
```

## 🎨 Features

### ✅ Implemented
- ✅ Mobile-first responsive design
- ✅ Auth0 authentication flow
- ✅ Session management (CRUD)
- ✅ Convex real-time database
- ✅ Form validation with Zod
- ✅ Protected routes

### 🔄 Next Phase (Phase 4)
- 🔄 CARFAX API integration
- 🔄 Dealer listing from backend
- 🔄 Price comparison view

### 📋 Future (Phase 5+)
- 📋 ElevenLabs batch calling
- 📋 Call status tracking
- 📋 Quote recording
- 📋 Automatic follow-ups

## 🎯 User Journey

```
┌─────────────┐
│  Homepage   │  Simple landing, click "Get Started"
└──────┬──────┘
       ↓
┌─────────────┐
│ Auth0 Login │  Secure authentication
└──────┬──────┘
       ↓
┌─────────────┐
│  Sessions   │  List of car searches
│    List     │  Click "New Car Search"
└──────┬──────┘
       ↓
┌─────────────┐
│   Create    │  Enter: Type, Model, Version, ZIP, Radius
│   Session   │  Click "Search Dealers"
└──────┬──────┘
       ↓
┌─────────────┐
│   Session   │  View dealers with prices
│   Detail    │  Select dealers → Click "Call Dealers"
└──────┬──────┘
       ↓
┌─────────────┐
│ AI Calling  │  ElevenLabs calls selected dealers
│  & Quotes   │  Track quotes, compare prices
└─────────────┘
```

## 🗄️ Database Tables

### `sessions`
- User's car search configuration
- Fields: carType, model, version, zipCode, radiusMiles
- Status: draft → fetching → ready → calling → completed

### `listings`
- Dealer information from CARFAX API
- Fields: dealerName, phone, MSRP, price, MPG
- Selection status for batch calling

### `calls`
- Call records to dealers
- Fields: status, elevenLabsCallId, transcript
- Tracks promised quotes and due dates

### `quotes`
- Price quotes from dealers
- Fields: otdPrice, addOns, notes
- Source: email or manual entry

## 📊 Tech Stack

- **Frontend**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (mobile-first)
- **Auth**: Auth0 React SDK
- **Backend**: Convex (serverless + real-time)
- **Validation**: Zod
- **Routing**: React Router v7
- **Icons**: Lucide React

## 🔧 Development Commands

```bash
# Frontend development
npm run dev              # Start dev server (port 5175)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Backend (Convex)
npm run convex:dev       # Start Convex dev mode
npm run convex:deploy    # Deploy to production
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CONVEX_URL` | Convex deployment URL | ✅ Auto-generated |
| `CONVEX_DEPLOYMENT` | Deployment name | ✅ Auto-generated |
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain | ✅ Manual setup |
| `VITE_AUTH0_CLIENT_ID` | Auth0 client ID | ✅ Manual setup |
| `VITE_AUTH0_AUDIENCE` | Auth0 API audience | Optional |

## 🐛 Troubleshooting

### Auth0 Login Not Working
- Verify callback URLs are correct in Auth0 dashboard
- Check domain and client ID in `.env.local`
- Look for errors in browser console
- Make sure you saved settings in Auth0 dashboard

### Convex Connection Issues
- Ensure `npm run convex:dev` is running
- Check `.env.local` has `VITE_CONVEX_URL`
- Visit dashboard: https://dashboard.convex.dev
- Try `npx convex dev --once` to reinitialize

### Build Errors
- Delete `node_modules` and run `npm install`
- Check Node.js version: `node -v` (need 18+)
- Clear Vite cache: `rm -rf .vite`

## 🧪 Testing on Mobile

1. **Find your local IP**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. **Start Vite with host flag**:
```bash
npm run dev -- --host
```

3. **Access from phone**:
```
http://YOUR_IP:5175
```

4. **Update Auth0 callback URLs** to include your local IP

## 📄 License

HackUTD 2025 Hackathon Project

---

**Current Phase**: Phase 3 Complete ✅  
**Next Phase**: Phase 4 - CARFAX API Integration  
**Backend**: Live at https://dashboard.convex.dev
