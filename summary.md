# LegalNest / GharBid — Project Summary

> **Project Name:** GharBid (marketed as **LegalNest**)
> **Type:** Full-Stack Real-Estate Auction Platform
> **Last Updated:** June 2026

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [AWS Infrastructure](#aws-infrastructure)
5. [Backend — Complete File Structure](#backend--complete-file-structure)
6. [Backend — Implemented Services](#backend--implemented-services)
7. [Backend — API Routes](#backend--api-routes)
8. [Backend — Middleware](#backend--middleware)
9. [Backend — Lambda Functions](#backend--lambda-functions)
10. [Backend — WebSocket Server](#backend--websocket-server)
11. [Frontend — Complete File Structure](#frontend--complete-file-structure)
12. [Frontend — Pages & Routing](#frontend--pages--routing)
13. [Frontend — Components](#frontend--components)
14. [Frontend — Services & State](#frontend--services--state)
15. [Data Models](#data-models)
16. [Environment Configuration](#environment-configuration)

---

## Project Overview

**GharBid / LegalNest** is a legally compliant real-estate marketplace and live auction platform for India. It enables:

- **Sellers** to list verified properties and schedule auctions
- **Buyers** (members) to browse listings, place live bids, and chat post-auction
- **Admins** to approve properties, verify users, schedule auctions, and moderate the platform

Core differentiators:
- **Live auction rooms** with real-time bidding via WebSocket
- **Anti-sniping** extension logic (auto-extends auction if a bid arrives within 2 minutes of close)
- **Membership gating** — buyers require an active membership to participate
- **AWS-native** — Cognito auth, DynamoDB storage, S3 media, SES email, Amazon Location

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 4 |
| Auth | AWS Cognito + JWT (`aws-jwt-verify`) |
| Database | AWS DynamoDB (via `@aws-sdk/lib-dynamodb`) |
| File Storage | AWS S3 (pre-signed URLs) |
| Email | AWS SES |
| Geo / Maps | AWS Location Service |
| Real-time | Socket.IO 4 |
| Validation | Zod |
| Logging | Winston + Morgan |
| Rate Limiting | `express-rate-limit` |
| Security | Helmet + CORS |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS 3 + custom globals |
| UI Primitives | Radix UI (Dialog, Select, Tabs, Toast, etc.) |
| Icons | Lucide React |
| State Management | Zustand |
| Server State | TanStack React Query v5 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod resolvers |
| Charts | Recharts |
| Maps | MapLibre GL + AWS Location |
| Real-time | Socket.IO Client |
| Notifications | Sonner |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vite/React)                   │
│  Browser  →  React Router  →  Pages  →  API Services        │
│                           ↕ WebSocket (Socket.IO client)     │
└──────────────────────────────────┬──────────────────────────┘
                                   │ HTTP (REST v1) / WS
┌──────────────────────────────────▼──────────────────────────┐
│                      BACKEND (Express / Node.js)             │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐   │
│  │  Routes  │→ │Middleware│→ │Controllers│→ │ Services  │   │
│  └──────────┘  └──────────┘  └──────────┘  └─────┬─────┘   │
│                                                   │         │
│  ┌─────────────────────────────────────────────── ▼ ──────┐ │
│  │              WebSocket Server (Socket.IO)              │ │
│  │   auctionHandler │ chatHandler │ notificationHandler   │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────┐
│                      AWS SERVICES                            │
│  Cognito │ DynamoDB │ S3 │ SES │ Location Service            │
└─────────────────────────────────────────────────────────────┘
```

---

## AWS Infrastructure

| Service | Purpose | Key Config |
|---|---|---|
| **AWS Cognito** | User auth, sign-up, sign-in, groups | Pool: `ap-south-1_KwhN2NRwO`, Client: `kggusnn2j96q7bdjdr7tlcvns` |
| **DynamoDB** | Primary NoSQL database | 8 tables (see Data Models) |
| **S3 — `legalnest-media`** | Property images & media | Pre-signed PUT URLs (5 min) |
| **S3 — `legalnest-documents`** | KYC / legal documents | Scoped per user, 5-min pre-signed |
| **SES** | Transactional email | From: `noreply@legalnest.com` |
| **Amazon Location** | Geocoding & reverse-geocoding | Index: `LegalNestPlaceIndex` |
| **AWS Region** | All services | `ap-south-1` (Mumbai) |

---

## Backend — Complete File Structure

```
backend/
├── .env                          # Environment variables
├── .gitignore
├── package.json                  # gharbid-backend v1.0.0
├── tsconfig.json
├── scratch.ts                    # Dev scratch scripts
├── scratch_confirm.ts
├── scratch_dynamo.ts
├── scratch_signin.ts
├── test_dynamo.ts
├── test_login.js / .ts
├── test_register.js / .ts
│
├── scripts/
│   ├── createTables.ts           # DynamoDB table provisioning
│   └── seedDatabase.ts           # Seed data for dev
│
└── src/
    ├── app.ts                    # Express app setup, middleware, route mounting
    ├── server.ts                 # HTTP server bootstrap + WebSocket init
    │
    ├── config/
    │   ├── aws.ts                # AWS SDK client instances (Cognito, DynamoDB, S3, SES, Location)
    │   ├── database.ts           # DynamoDB DocumentClient factory
    │   ├── env.ts                # Zod-validated environment schema + export
    │   └── redis.ts              # Redis config (placeholder)
    │
    ├── controllers/
    │   ├── adminController.ts    # Dashboard stats, user verification, property approval
    │   ├── auctionController.ts  # List/get auctions, place bid, auto-bid, bid history
    │   ├── authController.ts     # Register, login, OTP, refresh, logout, verify-email
    │   ├── chatController.ts     # Get rooms, messages, send message
    │   ├── membershipController.ts # Create / get membership
    │   ├── propertyController.ts # CRUD, interest, favourite, upload URL
    │   └── userController.ts     # Get/update profile
    │
    ├── middleware/
    │   ├── auth.ts               # JWT Cognito token verification (authenticate)
    │   ├── authorize.ts          # Fine-grained action authorization
    │   ├── errorHandler.ts       # Global error handler with structured JSON errors
    │   ├── logging.ts            # Request logger (requestLogger)
    │   ├── rateLimit.ts          # authLimiter / bidLimiter / generalLimiter
    │   ├── rbac.ts               # requireRole([...]) role-based access control
    │   └── validation.ts         # Zod schema validation middleware (validate)
    │
    ├── models/
    │   ├── dynamodb/
    │   │   ├── AuctionModel.ts   # DynamoDB CRUD helpers for Auctions table
    │   │   ├── BidModel.ts       # putBid, getBidHistory
    │   │   ├── PropertyModel.ts  # CRUD + GSI queries for Properties table
    │   │   ├── TransactionModel.ts # Transaction record helpers
    │   │   └── UserModel.ts      # User get/put/update helpers
    │   └── entities/
    │       ├── Auction.ts        # TypeScript Auction entity interface
    │       ├── Bid.ts            # Bid entity interface
    │       ├── Property.ts       # Property entity interface
    │       ├── Transaction.ts    # Transaction entity interface
    │       └── User.ts           # User entity interface
    │
    ├── routes/
    │   └── v1/
    │       ├── admin.routes.ts       # /v1/admin/*
    │       ├── auction.routes.ts     # /v1/auctions/*
    │       ├── auth.routes.ts        # /v1/auth/*
    │       ├── chat.routes.ts        # /v1/chat/*
    │       ├── membership.routes.ts  # /v1/memberships/*
    │       ├── property.routes.ts    # /v1/properties/*
    │       └── user.routes.ts        # /v1/users/*
    │
    ├── services/
    │   ├── auctionEngine.ts      # Core bid logic, anti-sniping, auto-bids, broadcast
    │   ├── chatService.ts        # Chat rooms + messages (DynamoDB)
    │   ├── cognitoService.ts     # signUp, signIn, confirmSignUp, OTP, role mgmt
    │   ├── dynamoService.ts      # Generic DynamoDB get/put/update/delete/query/scan
    │   ├── emailService.ts       # SES email templates (welcome, outbid, winner, expiry)
    │   ├── locationService.ts    # Geocode, reverse-geocode, nearby search
    │   ├── notificationService.ts # In-app notification helpers
    │   └── s3Service.ts          # Pre-signed media + document upload/read URLs
    │
    ├── utils/
    │   ├── constants.ts          # AUCTION_CONFIG, app-wide constants
    │   ├── helpers.ts            # generateUUID, date helpers
    │   ├── jwt.ts                # JWT sign/verify wrappers
    │   └── logger.ts             # Winston logger instance
    │
    ├── validators/
    │   ├── auction.validator.ts  # Zod schemas for auction inputs
    │   ├── auth.validator.ts     # loginSchema, registerSchema, otpSchema
    │   ├── property.validator.ts # Zod schemas for property creation/update
    │   └── user.validator.ts     # Zod schemas for user profile updates
    │
    ├── lambdas/
    │   ├── auctionScheduler/
    │   │   └── index.ts          # Lambda: auto-start/close scheduled auctions
    │   ├── documentVerification/
    │   │   └── index.ts          # Lambda: KYC document verification trigger
    │   ├── membershipExpiry/
    │   │   └── index.ts          # Lambda: detect and expire stale memberships
    │   └── streamProcessor/
    │       └── index.ts          # Lambda: DynamoDB Streams consumer
    │
    └── websocket/
        ├── server.ts             # Socket.IO init, JWT auth middleware, handler wiring
        ├── socketAuth.ts         # Socket JWT handshake verification
        └── handlers/
            ├── auctionHandler.ts     # join_auction, place_bid, leave_auction events
            ├── chatHandler.ts        # join_room, send_message, typing events
            └── notificationHandler.ts # notification delivery events
```

---

## Backend — Implemented Services

### 1. `cognitoService.ts` — Authentication & User Management
| Function | Description |
|---|---|
| `signUp()` | Register user with email, password, name, phone (optional) |
| `signIn()` | USER_PASSWORD_AUTH flow; returns tokens + role |
| `refreshSession()` | REFRESH_TOKEN_AUTH flow |
| `signOut()` | Global sign-out (invalidates all tokens) |
| `confirmSignUp()` | Email code confirmation |
| `addUserToGroup()` | Assign Buyer or Seller Cognito group |
| `getUserRole()` | Resolve user's Cognito group (buyer/seller/admin) |
| `forgotPassword()` | Trigger Cognito forgot-password flow |
| `confirmForgotPassword()` | Reset password with confirmation code |
| `requestOtp()` | SMS OTP (stub — SNS integration placeholder) |
| `verifyOtp()` | OTP verification (stub) |

---

### 2. `auctionEngine.ts` — Live Auction Core
| Function | Description |
|---|---|
| `placeBid()` | Validate, conditionally write bid (race-condition safe), save bid, anti-snipe check, process auto-bids, broadcast via Socket.IO |
| `extendAuction()` | Extend end time by snipe window; broadcast `auction_extended` |
| `processAutoBids()` | Auto-bid processing placeholder (Sprint 3) |
| `getBidHistory()` | Delegate to BidModel |
| `setAutoBid()` | Configure max auto-bid amount |
| `setIo()` | Register Socket.IO instance for real-time broadcasts |

**Anti-sniping logic:** If a bid arrives within `AUCTION_CONFIG.SNIPE_WINDOW_MS` (2 min) of close and `extensionCount < MAX_EXTENSIONS`, the auction end time is extended.

---

### 3. `dynamoService.ts` — Generic DynamoDB Adapter
| Function | Description |
|---|---|
| `getItem()` | GetCommand wrapper |
| `putItem()` | PutCommand wrapper |
| `updateItem()` | Dynamic UpdateExpression builder with auto `updatedAt` |
| `deleteItem()` | DeleteCommand wrapper |
| `queryItems()` | QueryCommand with optional GSI, filter, limit |
| `scanItems()` | ScanCommand (use sparingly) |

---

### 4. `chatService.ts` — Messaging
| Function | Description |
|---|---|
| `getUserRooms()` | Get all chat rooms for a user (buyer or seller) |
| `getMessages()` | Retrieve all messages in a chat room |
| `saveMessage()` | Save message with 90-day TTL |
| `createChatRoom()` | Create a post-auction buyer-seller chat room |
| `markMessagesRead()` | Batch mark messages read (TODO) |

---

### 5. `emailService.ts` — Transactional Email (AWS SES)
| Function | Email Trigger |
|---|---|
| `sendWelcomeEmail()` | On successful registration |
| `sendOutbidEmail()` | When a buyer is outbid at an auction |
| `sendAuctionWinnerEmail()` | When a buyer wins an auction |
| `sendMembershipExpiryEmail()` | Before membership expires |

---

### 6. `s3Service.ts` — File Storage (AWS S3)
| Function | Description |
|---|---|
| `getMediaUploadUrl()` | Pre-signed PUT URL for property images (5 min TTL) |
| `getDocumentUploadUrl()` | Pre-signed PUT URL for KYC documents, scoped by userId + docType |
| `getDocumentReadUrl()` | Pre-signed GET URL for private document access |

---

### 7. `locationService.ts` — Geo Services (AWS Location)
| Function | Description |
|---|---|
| `geocodeAddress()` | Text-to-coordinates (up to 5 results) |
| `reverseGeocode()` | Lat/Lng to address |
| `searchNearbyPlaces()` | Category search biased to a position |

---

### 8. `notificationService.ts` — In-App Notifications
Provides helpers to push notifications to the DynamoDB Notifications table and trigger real-time delivery via WebSocket.

---

## Backend — API Routes

All routes are versioned under `/v1`.

### Auth — `/v1/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register (rate limited) |
| POST | `/login` | — | Login (rate limited) |
| POST | `/otp/request` | — | Request OTP (rate limited) |
| POST | `/otp/verify` | — | Verify OTP (rate limited) |
| POST | `/refresh` | — | Refresh tokens |
| POST | `/logout` | — | Global sign-out |
| POST | `/verify-email` | — | Confirm email code |

### Properties — `/v1/properties`
| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | — | — | List all properties |
| GET | `/:id` | — | — | Get property detail |
| POST | `/` | Yes | seller | Create property |
| PUT | `/:id` | Yes | seller, admin | Update property |
| DELETE | `/:id` | Yes | seller, admin | Delete property |
| POST | `/:id/interest` | Yes | buyer | Express interest |
| POST | `/:id/favorite` | Yes | buyer | Save to favourites |
| GET | `/:id/upload-url` | Yes | seller | Get S3 pre-signed URL |

### Auctions — `/v1/auctions`
| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | — | — | List auctions |
| GET | `/:id` | — | — | Get auction details |
| GET | `/:id/bids` | — | — | Get bid history |
| POST | `/:id/bid` | Yes | buyer | Place a bid (bid rate limited) |
| POST | `/:id/auto-bid` | Yes | buyer | Set auto-bid max amount |

### Users — `/v1/users`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | Yes | Get own profile |
| PUT | `/me` | Yes | Update own profile |

### Chat — `/v1/chat`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/rooms` | Yes | Get user's chat rooms |
| GET | `/rooms/:roomId/messages` | Yes | Get room messages |
| POST | `/rooms/:roomId/messages` | Yes | Send message |

### Memberships — `/v1/memberships`
| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/` | Yes | buyer | Purchase membership |
| GET | `/me` | Yes | buyer | Get membership status |

### Admin — `/v1/admin` *(requires admin role)*
| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Platform stats (users, properties, auctions) |
| GET | `/users` | List all users |
| PUT | `/users/:userId/verify` | Verify a user's KYC |
| GET | `/properties/pending` | List pending property approvals |
| PUT | `/properties/:id/approve` | Approve property listing |
| PUT | `/properties/:id/reject` | Reject property listing |
| POST | `/auctions` | Schedule a new auction |
| PUT | `/interests/:interestId/approve` | Approve buyer interest |

---

## Backend — Middleware

| File | Middleware | Description |
|---|---|---|
| `auth.ts` | `authenticate` | Verify Cognito JWT; attaches `userId`, `email`, `role` to `req` |
| `authorize.ts` | `authorize()` | Fine-grained action-level authorization |
| `rbac.ts` | `requireRole([...])` | Role whitelist guard (buyer / seller / admin) |
| `rateLimit.ts` | `authLimiter` | 10 req/15 min per IP for auth routes |
| `rateLimit.ts` | `bidLimiter` | 30 req/min per IP for bidding |
| `rateLimit.ts` | `generalLimiter` | 100 req/15 min per IP for general routes |
| `validation.ts` | `validate(schema)` | Zod schema validation of request body |
| `errorHandler.ts` | `errorHandler` | Global JSON error responses with proper HTTP codes |
| `logging.ts` | `requestLogger` | Logs every request with method, path, status, duration |

---

## Backend — Lambda Functions

| Lambda | Trigger | Function |
|---|---|---|
| **auctionScheduler** | EventBridge scheduled rule | Auto-transitions auctions between scheduled/live/closed states |
| **documentVerification** | S3 event (document upload) | Initiates KYC doc review pipeline |
| **membershipExpiry** | EventBridge scheduled rule | Scans memberships and marks expired ones; triggers expiry email |
| **streamProcessor** | DynamoDB Streams | Processes change events for notifications, analytics, or downstream sync |

---

## Backend — WebSocket Server

**Server:** `websocket/server.ts` — Socket.IO 4 over HTTP with JWT authentication at handshake.

### Socket Events

#### Auction Events (`auctionHandler.ts`)
| Event (Client to Server) | Description |
|---|---|
| `join_auction` | Join auction room (`auction_<id>`) |
| `place_bid` | Submit a live bid |
| `leave_auction` | Leave auction room |

| Event (Server to Client) | Description |
|---|---|
| `new_bid` | Broadcast latest bid `{ userId, amount, timestamp }` |
| `auction_extended` | Broadcast new end time after anti-snipe trigger |

#### Chat Events (`chatHandler.ts`)
| Event (Client to Server) | Description |
|---|---|
| `join_room` | Join a private chat room |
| `send_message` | Send a message in the room |
| `typing` | Typing indicator |

| Event (Server to Client) | Description |
|---|---|
| `message` | Delivered message |
| `typing` | Forwarded typing indicator |

#### Notification Events (`notificationHandler.ts`)
| Event (Server to Client) | Description |
|---|---|
| `notification` | Push in-app notification to user |

---

## Frontend — Complete File Structure

```
frontend/
├── .env.local                    # VITE_API_URL, VITE_WS_URL, etc.
├── index.html                    # Vite HTML entry
├── package.json                  # gharbid-frontend v1.0.0
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── postcss.config.js
├── tailwind.config.js            # Custom tokens, dark mode, animations
│
└── src/
    ├── main.tsx                  # React root, React Query provider mount
    ├── App.tsx                   # BrowserRouter, Routes, lazy pages, SplashScreen
    ├── vite-env.d.ts
    │
    ├── styles/
    │   └── globals.css           # Tailwind directives + CSS custom properties
    │
    ├── pages/
    │   ├── LandingPage.tsx       # Hero, features, CTA sections (public)
    │   ├── LoginPage.tsx         # Email/password login form with Cognito
    │   ├── RegisterPage.tsx      # Buyer/Seller registration form
    │   ├── VerifyPage.tsx        # Email OTP verification page
    │   ├── PropertyListPage.tsx  # Browse all approved properties
    │   ├── PropertyDetailPage.tsx# Full property view with gallery + interest btn
    │   ├── AuctionsListPage.tsx  # Auction cards with filters, live status badges
    │   ├── AuctionRoomPage.tsx   # Live bidding room with timer, leaderboard, chat
    │   ├── BuyerDashboard.tsx    # Watchlist, bid history, membership status
    │   ├── SellerDashboard.tsx   # My listings, property status, analytics
    │   ├── AdminDashboard.tsx    # Admin stats, pending approvals, user management
    │   ├── ChatPage.tsx          # Private buyer-seller chat interface
    │   ├── MembershipPage.tsx    # Membership tiers and purchase flow
    │   └── ProfilePage.tsx       # User profile view and edit
    │
    ├── components/
    │   ├── auctions/
    │   │   ├── BidHistory.tsx    # Scrollable bid history list
    │   │   ├── BidPanel.tsx      # Bid input, min-bid display, submit button
    │   │   ├── CountdownTimer.tsx# Live countdown with urgency color states
    │   │   └── Leaderboard.tsx   # Top bidders ranked list
    │   │
    │   ├── chat/
    │   │   ├── ChatInput.tsx     # Message composer with send + file attach
    │   │   ├── ChatWindow.tsx    # Scrollable chat message display
    │   │   ├── MeetingRequest.tsx# Buyer-seller meeting scheduling widget
    │   │   └── MessageBubble.tsx # Individual message bubble with timestamp
    │   │
    │   ├── common/
    │   │   ├── ErrorBoundary.tsx # React error boundary wrapper
    │   │   ├── Loader.tsx        # Fullscreen loading spinner
    │   │   ├── PrivateRoute.tsx  # Role-based route guard (Outlet pattern)
    │   │   └── SplashScreen.tsx  # Animated brand splash on first load
    │   │
    │   ├── layout/
    │   │   ├── Navbar.tsx        # Top navigation with auth state, role menu
    │   │   ├── Footer.tsx        # Site footer with links
    │   │   └── MobileNav.tsx     # Bottom mobile navigation bar
    │   │
    │   └── properties/
    │       ├── ImageGallery.tsx  # Lightbox image gallery for property photos
    │       ├── PropertyCard.tsx  # Property thumbnail card with price + status
    │       ├── PropertyFilters.tsx # Filter panel (price, type, location, etc.)
    │       ├── PropertyGrid.tsx  # Responsive grid of PropertyCards
    │       └── PropertyMap.tsx   # MapLibre GL map with property pins
    │
    ├── hooks/
    │   ├── useAuth.ts            # Auth state access (Zustand authStore)
    │   ├── useDebounce.ts        # Debounce hook for search inputs
    │   ├── useGeolocation.ts     # Browser Geolocation API wrapper
    │   ├── useMediaQuery.ts      # Responsive breakpoint detection
    │   └── useSocket.ts          # Socket.IO connection management hook
    │
    ├── services/
    │   ├── api.ts                # Axios instance with base URL + auth interceptors
    │   ├── authService.ts        # login(), register(), logout(), refresh() API calls
    │   ├── auctionService.ts     # listAuctions(), getAuction(), placeBid() calls
    │   ├── chatService.ts        # getRooms(), getMessages(), sendMessage() calls
    │   ├── membershipService.ts  # getMembership(), purchaseMembership() calls
    │   ├── propertyService.ts    # listProperties(), getProperty(), createProperty()
    │   └── userService.ts        # getProfile(), updateProfile() calls
    │
    ├── store/
    │   ├── authStore.ts          # Zustand: user, tokens, role, login/logout actions
    │   ├── auctionStore.ts       # Zustand: active auction, current bid, bidders
    │   ├── chatStore.ts          # Zustand: rooms, messages, active room
    │   └── filterStore.ts        # Zustand: property filter state (price, type, geo)
    │
    ├── types/
    │   ├── api.types.ts          # Generic API response wrapper types
    │   ├── auction.types.ts      # Auction, Bid TypeScript interfaces
    │   ├── chat.types.ts         # ChatRoom, Message interfaces
    │   ├── property.types.ts     # Property, PropertyType enums, interfaces
    │   └── user.types.ts         # User, Role, Membership interfaces
    │
    └── utils/
        ├── constants.ts          # App-wide constants (API base URL, limits)
        ├── formatters.ts         # Currency (INR), date, area formatters
        ├── geohash.ts            # Geohash encode/decode for geo queries
        ├── socket.ts             # Socket.IO client singleton factory
        └── validators.ts         # Client-side Zod schemas for forms
```

---

## Frontend — Pages & Routing

| Path | Page | Auth | Allowed Roles |
|---|---|---|---|
| `/` | LandingPage | Public | — |
| `/login` | LoginPage | Public | — |
| `/register` | RegisterPage | Public | — |
| `/verify` | VerifyPage | Public | — |
| `/properties` | PropertyListPage | Public | — |
| `/properties/:id` | PropertyDetailPage | Public | — |
| `/auctions` | AuctionsListPage | Public | — |
| `/auctions/:id` | AuctionRoomPage | Public | — |
| `/membership` | MembershipPage | Public | — |
| `/buyer/dashboard` | BuyerDashboard | Protected | buyer |
| `/seller/dashboard` | SellerDashboard | Protected | seller |
| `/admin/dashboard` | AdminDashboard | Protected | admin |
| `/chat` | ChatPage | Protected | buyer, seller, admin |
| `/profile` | ProfilePage | Protected | buyer, seller, admin |

> All pages are **lazy-loaded** via `React.lazy()` with `<Suspense>` fallback.
> A **SplashScreen** component plays on first app load before routing begins.

---

## Frontend — Components

### Auction Components
| Component | Description |
|---|---|
| `BidPanel` | Primary bidding UI — shows current bid, min-bid, input field, and submit button |
| `BidHistory` | Scrollable list of all bids with bidder, amount, and timestamp |
| `CountdownTimer` | Live ticking countdown with color urgency states (green to yellow to red) |
| `Leaderboard` | Ranked list of top bidders in the current auction room |

### Chat Components
| Component | Description |
|---|---|
| `ChatWindow` | Scrollable message thread display |
| `ChatInput` | Message input composer with send action |
| `MessageBubble` | Individual message with sender, content, timestamp styling |
| `MeetingRequest` | Widget to schedule a buyer-seller physical meeting |

### Layout Components
| Component | Description |
|---|---|
| `Navbar` | Top bar with logo, nav links, role-based menu, auth state |
| `Footer` | Bottom footer with links and branding |
| `MobileNav` | Fixed bottom navigation bar for mobile viewports |

### Common Components
| Component | Description |
|---|---|
| `PrivateRoute` | Wraps protected routes; checks auth + role via Zustand |
| `SplashScreen` | Animated splash screen shown on first app load |
| `Loader` | Fullscreen centered loading spinner |
| `ErrorBoundary` | Catches render errors and shows fallback UI |

### Property Components
| Component | Description |
|---|---|
| `PropertyCard` | Thumbnail card with image, price, location, type badge |
| `PropertyGrid` | Responsive grid layout for PropertyCard list |
| `PropertyFilters` | Sidebar filter panel (price range, property type, location, bedrooms) |
| `PropertyMap` | MapLibre GL interactive map with property pin markers |
| `ImageGallery` | Lightbox-style image gallery for property photos |

---

## Frontend — Services & State

### API Service Layer (`services/`)
All services use a shared **Axios instance** (`api.ts`) configured with:
- Base URL from `VITE_API_URL` env variable
- Auth interceptor attaching JWT `Authorization: Bearer <token>` header
- Response interceptor for 401 handling (auto-refresh or logout)

### State Management (Zustand Stores)

| Store | State | Key Actions |
|---|---|---|
| `authStore` | `user`, `role`, `accessToken`, `isAuthenticated` | `login()`, `logout()`, `setTokens()` |
| `auctionStore` | `currentAuction`, `currentBid`, `bidders`, `timeLeft` | `setBid()`, `setAuction()`, `addBidder()` |
| `chatStore` | `rooms`, `activeRoom`, `messages` | `setRooms()`, `setMessages()`, `addMessage()` |
| `filterStore` | `priceRange`, `propertyType`, `location`, `bedrooms` | `setFilter()`, `resetFilters()` |

### Custom Hooks

| Hook | Purpose |
|---|---|
| `useAuth` | Reads from `authStore` for auth state and actions |
| `useSocket` | Manages Socket.IO connection lifecycle (connect on auth, disconnect on logout) |
| `useGeolocation` | Wraps `navigator.geolocation` with loading/error states |
| `useDebounce` | Debounces rapidly changing values (e.g., search input) |
| `useMediaQuery` | Detects responsive breakpoints for conditional rendering |

---

## Data Models

### DynamoDB Tables

| Table | Partition Key | Sort Key | Description |
|---|---|---|---|
| `LegalNest-Users` | `userId` | — | User profiles, KYC status, role |
| `LegalNest-Properties` | `propertyId` | — | Property listings with geo, images, status |
| `LegalNest-Auctions` | `auctionId` | — | Auction state, bids, timing |
| `LegalNest-Bids` | `auctionId` | `bidId` | All bids per auction |
| `LegalNest-Transactions` | `transactionId` | — | Post-auction transaction records |
| `LegalNest-ChatRooms` | `roomId` | — | Buyer-seller chat rooms |
| `LegalNest-Messages` | `roomId` | `messageId` | Chat messages (90-day TTL) |
| `LegalNest-Notifications` | `userId` | `notificationId` | In-app notification records |

### Entity Interfaces

**User**
```typescript
{ userId, email, name, phone, role: 'buyer'|'seller'|'admin',
  isVerified, membershipId?, createdAt, updatedAt }
```

**Property**
```typescript
{ propertyId, sellerId, title, description, price, propertyType,
  status: 'pending'|'approved'|'rejected'|'auctioned',
  address, lat, lng, geohash, bedrooms, bathrooms, area,
  images[], documents[], createdAt, updatedAt }
```

**Auction**
```typescript
{ auctionId, propertyId, sellerId, startTime, endTime,
  status: 'scheduled'|'live'|'closed',
  startingBid, currentHighestBid, highestBidderId,
  bidIncrement, extensionCount, createdAt, updatedAt }
```

**Bid**
```typescript
{ bidId, auctionId, userId, amount, timestamp, isAutoBid }
```

**Transaction**
```typescript
{ transactionId, auctionId, buyerId, sellerId,
  finalAmount, status, chatRoomId, createdAt }
```

---

## Environment Configuration

### Backend (`.env`)
```
NODE_ENV=development
PORT=3000
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_KwhN2NRwO
COGNITO_CLIENT_ID=kggusnn2j96q7bdjdr7tlcvns
JWT_SECRET=<min 32 chars>
DYNAMODB_USERS_TABLE=LegalNest-Users
DYNAMODB_PROPERTIES_TABLE=LegalNest-Properties
DYNAMODB_AUCTIONS_TABLE=LegalNest-Auctions
DYNAMODB_BIDS_TABLE=LegalNest-Bids
DYNAMODB_TRANSACTIONS_TABLE=LegalNest-Transactions
DYNAMODB_CHAT_ROOMS_TABLE=LegalNest-ChatRooms
DYNAMODB_MESSAGES_TABLE=LegalNest-Messages
DYNAMODB_NOTIFICATIONS_TABLE=LegalNest-Notifications
S3_MEDIA_BUCKET=legalnest-media
S3_DOCUMENTS_BUCKET=legalnest-documents
LOCATION_INDEX_NAME=LegalNestPlaceIndex
SES_FROM_EMAIL=noreply@legalnest.com
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:3000/v1
VITE_WS_URL=http://localhost:3000
VITE_AWS_REGION=ap-south-1
```

---

## NPM Scripts

### Backend
| Script | Command |
|---|---|
| `npm run dev` | `ts-node-dev` hot-reload dev server |
| `npm run build` | TypeScript compile to `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm run seed` | Seed DynamoDB with sample data |
| `npm run create-tables` | Provision DynamoDB tables |
| `npm test` | Jest test runner |

### Frontend
| Script | Command |
|---|---|
| `npm run dev` | Vite dev server (localhost:5173) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |

---

*Generated on 2026-06-15 | LegalNest / GharBid v1.0.0*
