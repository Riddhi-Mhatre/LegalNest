# LegalNest / GharBid - Project Summary

> **Project Name:** GharBid (marketed as **LegalNest**)
> **Type:** Full-Stack Real-Estate Auction Platform
> **Last Updated:** June 23, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [AWS Infrastructure](#aws-infrastructure)
5. [Backend - Complete File Structure](#backend--complete-file-structure)
6. [Backend - Implemented Services](#backend--implemented-services)
7. [Backend - API Routes](#backend--api-routes)
8. [Backend - Middleware](#backend--middleware)
9. [Backend - Lambda Functions](#backend--lambda-functions)
10. [Backend - WebSocket Server](#backend--websocket-server)
11. [Frontend - Complete File Structure](#frontend--complete-file-structure)
12. [Frontend - Pages and Routing](#frontend--pages-and-routing)
13. [Frontend - Components](#frontend--components)
14. [Frontend - Services and State](#frontend--services-and-state)
15. [Data Models](#data-models)
16. [Environment Configuration](#environment-configuration)
17. [NPM Scripts](#npm-scripts)
18. [Changelog](#changelog)

---

## Project Overview

**GharBid / LegalNest** - legally compliant real-estate marketplace + live auction platform for India.

| Role | Capabilities |
|---|---|
| **Seller** | List properties, upload KYC/identity docs, pay platform fee, schedule auctions, manage bids, view interested buyers |
| **Buyer** | Browse, save, schedule visits, bid live, view legal docs, track purchases, manage membership + notifications |
| **Admin** | Approve properties, verify users, schedule auctions, moderate platform |

Core features:
- **Live auction rooms** - real-time bidding via Socket.IO
- **Anti-sniping** - extends if bid arrives within 2 min of close
- **Membership tiers** - Basic (free) / Premium (Rs.999/30d) / Elite (Rs.2999/30d); Premium+ gating for bidding
- **Platform fee** - sale: Rs.999, rent: Rs.299 per listing
- **Property visit scheduling** - buyer requests, seller notified
- **Legal + identity doc flow** - S3 upload for both seller KYC (gharbid-documents) and identity docs
- **Seller auction management** - schedule auctions on approved props, view bids + interested buyers
- **Feature-based frontend structure** - buyer + seller pages in `src/features/` modules

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) + JavaScript |
| Framework | Express 4 |
| Auth | AWS Cognito + JWT (aws-jwt-verify) |
| Database | AWS DynamoDB (@aws-sdk/lib-dynamodb) |
| Storage | AWS S3 (pre-signed URLs) |
| Email | AWS SES |
| Geo | AWS Location Service |
| Real-time | Socket.IO 4 |
| Validation | Zod |
| Logging | Winston + Morgan |
| Rate Limiting | express-rate-limit |
| Security | Helmet + CORS |
| Dev | node --watch |

> Backend: JavaScript (ESM). Migrated from TypeScript June 2026.

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS 3 |
| UI | Radix UI primitives |
| Icons | Lucide React |
| State | Zustand |
| Server State | TanStack React Query v5 |
| HTTP | Axios |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Maps | MapLibre GL + AWS Location |
| Real-time | Socket.IO Client |
| Toasts | Sonner |

---

## System Architecture

```
FRONTEND (Vite / React / TypeScript)
  src/pages/          -> public + shared routes
  src/features/buyer/ -> all /buyer/* pages
  src/features/seller/-> all /seller/* pages
  Socket.IO client    -> real-time bids + notifications
          |
          | HTTP /v1/* REST + WebSocket
          |
BACKEND (Express / Node.js ESM)
  Routes -> Middleware (auth/rbac/rateLimit/validate)
         -> Controllers -> Services -> DynamoDB Models
  Socket.IO server -> auctionHandler | chatHandler | notificationHandler
          |
AWS
  Cognito | DynamoDB (10+ tables) | S3 (3 buckets) | SES | Location
          |
Lambdas (EventBridge / S3 event / DynamoDB Streams)
  auctionScheduler | documentVerification | membershipExpiry | streamProcessor
```

---

## AWS Infrastructure

| Service | Purpose | Config |
|---|---|---|
| **Cognito** | Auth + groups (Buyer/Seller/Admin) | Pool: ap-south-1_KwhN2NRwO |
| **DynamoDB** | NoSQL primary store | 10+ tables |
| **S3 gharbid-app-storage-2026** | General media | Pre-signed PUT, 5 min |
| **S3 gharbid-property-images** | Property images | Pre-signed PUT, 5 min |
| **S3 gharbid-documents** | KYC + identity docs | Scoped per user+docType |
| **SES** | Transactional email | noreply@legalnest.com |
| **Amazon Location** | Geocoding | Index: LegalNestPlaceIndex |
| **Region** | All services | ap-south-1 (Mumbai) |

---

## Backend - Complete File Structure

```
backend/
+-- .env
+-- package.json              # legalnest-backend v1.0.0 (Node.js ESM)
+-- scripts/
|   +-- createTables.js
|   +-- seedDatabase.js
+-- src/
    +-- app.js                # Express init, middleware, route mount
    +-- server.js             # HTTP + Socket.IO bootstrap
    +-- config/
    |   +-- aws.js            # SDK clients (Cognito/DynamoDB/S3/SES/Location)
    |   +-- database.js       # DynamoDB DocumentClient
    |   +-- env.js            # Zod-validated env
    |   +-- redis.js          # Redis placeholder
    +-- controllers/
    |   +-- auctionController.js        # List/get auctions, place bid
    |   +-- authController.js           # Register, login, OTP, refresh, logout
    |   +-- buyerController.js          # 14 handlers: full buyer workflow
    |   +-- chatController.js           # Rooms + messages
    |   +-- membershipController.js     # Legacy membership (pre-buyerService)
    |   +-- propertyController.js       # Property CRUD, interest, upload URL
    |   +-- sellerAuctionController.js  # Seller auction schedule + manage
    |   +-- sellerController.js         # Seller dashboard, docs, platform fees
    |   +-- userController.js           # User profile get/update
    +-- middleware/
    |   +-- auth.js           # Cognito JWT verify -> req.user
    |   +-- authorize.js      # Fine-grained action auth
    |   +-- errorHandler.js   # Global JSON error response
    |   +-- logging.js        # requestLogger
    |   +-- rateLimit.js      # authLimiter / bidLimiter / generalLimiter
    |   +-- rbac.js           # requireRole([...])
    |   +-- validation.js     # Zod validate(schema)
    +-- models/
    |   +-- dynamodb/
    |       +-- AuctionModel.js         # Auctions CRUD
    |       +-- BidModel.js             # putBid, getBidHistory
    |       +-- MembershipModel.js      # getMembership, upsertMembership
    |       +-- PaymentModel.js         # createPayment, queryBySeller/ByProperty
    |       +-- PropertyModel.js        # Properties CRUD + GSI
    |       +-- PurchaseModel.js        # getPurchasesByBuyer, createPurchase
    |       +-- SavedPropertiesModel.js # save, remove, getSaved, checkExists
    |       +-- TransactionModel.js     # Transaction records
    |       +-- UserModel.js            # User get/put/update
    |       +-- VisitModel.js           # createVisit, getVisitsByBuyer, updateVisit
    +-- routes/
    |   +-- v1/
    |       +-- auction.routes.js       # /v1/auctions/*
    |       +-- auth.routes.js          # /v1/auth/*
    |       +-- buyer.routes.js         # /v1/buyer/* (23 routes, buyer role)
    |       +-- chat.routes.js          # /v1/chat/*
    |       +-- membership.routes.js    # /v1/memberships/* (legacy)
    |       +-- property.routes.js      # /v1/properties/*
    |       +-- seller.routes.js        # /v1/seller/* (+ 5 auction sub-routes)
    |       +-- user.routes.js          # /v1/users/*
    +-- services/
    |   +-- auctionEngine.js            # Bid logic, anti-snipe, broadcast
    |   +-- buyerNotificationService.js # get/markRead/delete/createAlert
    |   +-- buyerService.js             # Dashboard, recommendations, saved props
    |   +-- chatService.js              # Chat rooms + messages
    |   +-- cognitoService.js           # signUp/signIn/OTP/roles
    |   +-- dynamoService.js            # Generic DynamoDB CRUD
    |   +-- emailService.js             # SES emails
    |   +-- locationService.js          # Geocode, reverse, nearby
    |   +-- membershipService.js        # Plans (basic/premium/elite) + upgrade
    |   +-- notificationService.js      # DynamoDB store + Socket.IO deliver
    |   +-- s3Service.js                # Pre-signed upload/read URLs
    |   +-- visitService.js             # Schedule/update/cancel visits
    +-- utils/
    |   +-- constants.js      # AUCTION_CONFIG, HTTP codes
    |   +-- helpers.js        # generateUUID, date utils
    |   +-- jwt.js            # JWT sign/verify
    |   +-- logger.js         # Winston logger
    +-- validators/
    |   +-- auction.validator.js
    |   +-- auth.validator.js
    |   +-- property.validator.js
    |   +-- user.validator.js
    +-- lambdas/
    |   +-- auctionScheduler/index.js
    |   +-- documentVerification/index.js
    |   +-- membershipExpiry/index.js
    |   +-- streamProcessor/index.js
    +-- websocket/
        +-- server.js         # Socket.IO init + JWT handshake + handler wiring
        +-- socketAuth.js     # Socket JWT verify
        +-- handlers/
            +-- auctionHandler.js
            +-- chatHandler.js
            +-- notificationHandler.js
```

---

## Backend - Implemented Services

### cognitoService.js

| Function | Description |
|---|---|
| signUp() | Register (email, password, name, phone) |
| signIn() | USER_PASSWORD_AUTH; tokens + role |
| refreshSession() | REFRESH_TOKEN_AUTH |
| signOut() | Global sign-out |
| confirmSignUp() | Email code confirm |
| addUserToGroup() | Assign Buyer/Seller Cognito group |
| getUserRole() | Resolve group (buyer/seller/admin) |
| forgotPassword() | Trigger forgot-password |
| confirmForgotPassword() | Reset with code |
| requestOtp() | SMS OTP placeholder |
| verifyOtp() | OTP verify placeholder |

### auctionEngine.js

| Function | Description |
|---|---|
| placeBid() | Validate + race-safe write + anti-snipe check + broadcast |
| extendAuction() | Extend end time; emit auction_extended |
| processAutoBids() | Placeholder (Sprint 3) |
| getBidHistory() | Delegate to BidModel |
| setAutoBid() | Set auto-bid max amount |
| setIo() | Register Socket.IO instance |

Anti-snipe: bid within SNIPE_WINDOW_MS (2 min) of close + extensionCount < MAX_EXTENSIONS -> extend.

### buyerService.js

| Function | Description |
|---|---|
| getDashboardStats() | Aggregate: saved, visits, purchases, activeBids, wonAuctions, unread notifications |
| getRecommendations() | Approved listings excl. already saved; paginated |
| saveProperty() | Add to SavedPropertiesModel |
| removeSavedProperty() | Remove from saved |
| getSavedProperties() | List saved with property detail |
| getBuyerBids() | All buyer bids from BidModel |
| getLegalDocumentUrl() | Pre-signed GET URL for property docs |

### visitService.js

| Function | Description |
|---|---|
| scheduleVisit() | Create visit; notify seller |
| getBuyerVisits() | List visits enriched with property data |
| updateVisit() | Change status (scheduled/confirmed/completed/cancelled) |
| cancelVisit() | Set cancelled; guard: no cancel on completed |

### membershipService.js

Plans: `basic` (free, unlimited), `premium` (Rs.999/30d), `elite` (Rs.2999/30d).

| Function | Description |
|---|---|
| getMembershipPlans() | Return all 3 plan configs |
| getBuyerMembership() | Membership + isActive check |
| upgradeMembership() | Upsert premium/elite; 30-day expiry |

### buyerNotificationService.js

| Function | Description |
|---|---|
| getNotifications() | Filter by type + sort newest first |
| markNotificationRead() | Set isRead:true + readAt timestamp |
| deleteNotification() | Remove from DynamoDB |
| createAuctionAlert() | Outbid / auction-alert notification |

### dynamoService.js

| Function | Description |
|---|---|
| getItem() | GetCommand |
| putItem() | PutCommand |
| updateItem() | Dynamic UpdateExpression + auto updatedAt |
| deleteItem() | DeleteCommand |
| queryItems() | QueryCommand + optional GSI/filter/limit |
| scanItems() | ScanCommand (sparingly) |

### chatService.js

| Function | Description |
|---|---|
| getUserRooms() | Rooms for user |
| getMessages() | Room messages |
| saveMessage() | Save with 90-day TTL |
| createChatRoom() | Post-auction buyer-seller room |
| markMessagesRead() | Batch read (TODO) |

### emailService.js (SES)

| Function | Trigger |
|---|---|
| sendWelcomeEmail() | Registration |
| sendOutbidEmail() | Outbid |
| sendAuctionWinnerEmail() | Won auction |
| sendMembershipExpiryEmail() | Expiry warning |

### s3Service.js

| Function | Description |
|---|---|
| getMediaUploadUrl() | PUT URL for images (5 min) |
| getDocumentUploadUrl() | PUT URL for KYC/identity docs (scoped) |
| getDocumentReadUrl() | GET URL for doc access |

### locationService.js

| Function | Description |
|---|---|
| geocodeAddress() | Text -> coords (5 results) |
| reverseGeocode() | Lat/Lng -> address |
| searchNearbyPlaces() | Category search near position |

### notificationService.js

Store notifications to `LegalNest-Notifications` DynamoDB + deliver via Socket.IO.

---

## Backend - API Routes

All versioned under `/v1`.

### Auth - /v1/auth

| Method | Path | Description |
|---|---|---|
| POST | /register | Register (rate limited) |
| POST | /login | Login (rate limited) |
| POST | /otp/request | Request OTP |
| POST | /otp/verify | Verify OTP |
| POST | /refresh | Refresh tokens |
| POST | /logout | Global sign-out |
| POST | /verify-email | Confirm email code |

### Properties - /v1/properties

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | /upload-url | Yes | seller | S3 pre-signed URL for images |
| GET | / | - | - | List properties |
| GET | /:id | - | - | Property detail |
| POST | / | Yes | seller | Create property |
| PUT | /:id | Yes | seller, admin | Update property |
| DELETE | /:id | Yes | seller, admin | Delete property |
| POST | /:id/interest | Yes | buyer | Express interest |
| POST | /:id/favorite | Yes | buyer | Save to favourites |

### Auctions - /v1/auctions

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | / | - | - | List auctions |
| GET | /:id | - | - | Auction detail |
| GET | /:id/bids | - | - | Bid history |
| POST | /:id/bid | Yes | buyer | Place bid (rate limited) |
| POST | /:id/auto-bid | Yes | buyer | Set auto-bid max |

### Seller - /v1/seller (requires seller role)

| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Stats: props total/pending/approved/rejected + views |
| GET | /properties | My listings |
| GET | /document-upload-url | Pre-signed S3 URL for KYC doc |
| PATCH | /properties/:id/documents | Save uploaded doc S3 keys |
| POST | /properties/:id/pay-fee | Record platform fee |
| GET | /payments | My fee payment history |
| GET | /auctions | All my auctions across all properties |
| POST | /properties/:id/auction | Schedule auction on approved property |
| GET | /properties/:id/auction | Auction details for property |
| GET | /properties/:id/auction/bids | Bid history for property auction |
| GET | /properties/:id/interested-buyers | Interested buyers list |

### Buyer - /v1/buyer (requires buyer role)

| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Stats: saved/bids/auctions won/visits/purchases/notifications |
| GET | /recommendations | Paginated approved listings (excl. saved) |
| POST | /saved-properties/:propertyId | Save property |
| GET | /saved-properties | List saved properties |
| DELETE | /saved-properties/:propertyId | Remove saved |
| GET | /bids | My bid history |
| GET | /auctions | Active auctions |
| GET | /auctions/:auctionId | Auction detail |
| POST | /auctions/:auctionId/bid | Place live bid |
| POST | /visits | Schedule property visit |
| GET | /visits | My visits (enriched with property) |
| PUT | /visits/:visitId | Update visit status |
| DELETE | /visits/:visitId | Cancel visit |
| GET | /properties/:propertyId/documents | Property legal docs (pre-signed URLs) |
| GET | /properties/:propertyId/legal-report | Legal report |
| GET | /purchases | Purchased properties |
| GET | /membership | My membership + isActive |
| POST | /membership/upgrade | Upgrade plan |
| GET | /notifications | My notifications (filterable by type) |
| PUT | /notifications/:notificationId/read | Mark read |
| DELETE | /notifications/:notificationId | Delete notification |
| GET | /profile | Buyer profile |
| PUT | /profile | Update profile |

### Users - /v1/users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /me | Yes | Get own profile |
| PUT | /me | Yes | Update own profile |

### Chat - /v1/chat

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /rooms | Yes | User chat rooms |
| GET | /rooms/:roomId/messages | Yes | Room messages |
| POST | /rooms/:roomId/messages | Yes | Send message |

### Memberships - /v1/memberships (legacy)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | / | Yes | buyer | Purchase membership |
| GET | /me | Yes | buyer | Membership status |

---

## Backend - Middleware

| File | Export | Description |
|---|---|---|
| auth.js | authenticate | Cognito JWT verify; set req.user |
| authorize.js | authorize() | Fine-grained action auth |
| rbac.js | requireRole([...]) | Role whitelist guard |
| rateLimit.js | authLimiter | 10 req/15 min per IP (auth) |
| rateLimit.js | bidLimiter | 30 req/min per IP (bids) |
| rateLimit.js | generalLimiter | 100 req/15 min per IP |
| validation.js | validate(schema) | Zod body validation |
| errorHandler.js | errorHandler | Global JSON error response |
| logging.js | requestLogger | Log method/path/status/duration |

---

## Backend - Lambda Functions

| Lambda | Trigger | Function |
|---|---|---|
| auctionScheduler | EventBridge | scheduled -> live -> closed transitions |
| documentVerification | S3 put event | KYC doc review pipeline |
| membershipExpiry | EventBridge | Expire memberships + send email |
| streamProcessor | DynamoDB Streams | Notifications, analytics, sync |

---

## Backend - WebSocket Server

`websocket/server.js` - Socket.IO 4 + JWT at handshake.

### Auction Events

| Dir | Event | Payload |
|---|---|---|
| C->S | join_auction | { auctionId } |
| C->S | place_bid | { amount } |
| C->S | leave_auction | - |
| S->C | new_bid | { userId, amount, timestamp } |
| S->C | auction_extended | { newEndTime } |

### Chat Events

| Dir | Event | Payload |
|---|---|---|
| C->S | join_room | { roomId } |
| C->S | send_message | { content } |
| C->S | typing | { roomId } |
| S->C | message | { content, sender, timestamp } |
| S->C | typing | { userId } |

### Notification Events

| Dir | Event | Payload |
|---|---|---|
| S->C | notification | { type, title, message, data } |

---

## Frontend - Complete File Structure

```
frontend/
+-- .env.local            # VITE_API_URL, VITE_WS_URL
+-- index.html
+-- package.json          # gharbid-frontend v1.0.0
+-- tailwind.config.js
+-- vite.config.ts
+-- src/
    +-- main.tsx
    +-- App.tsx           # Router, lazy imports from pages/ + features/
    +-- vite-env.d.ts
    +-- styles/globals.css
    |
    +-- pages/            # Public + shared pages only
    |   +-- LandingPage.tsx
    |   +-- LoginPage.tsx
    |   +-- RegisterPage.tsx
    |   +-- VerifyPage.tsx
    |   +-- PropertyListPage.tsx
    |   +-- PropertyDetailPage.tsx
    |   +-- AuctionsListPage.tsx
    |   +-- AuctionRoomPage.tsx   # Live bidding room
    |   +-- MembershipPage.tsx    # Public membership info
    |   +-- ChatPage.tsx
    |   +-- ProfilePage.tsx
    |
    +-- features/                 # Feature modules (role-scoped)
    |   +-- buyer/
    |   |   +-- pages/
    |   |       +-- BuyerDashboard.tsx          # Stats: saved/bids/visits/purchases
    |   |       +-- BuyerAuctionsPage.tsx        # Active auctions list
    |   |       +-- BuyerBidsPage.tsx            # My bid history
    |   |       +-- BuyerSavedPage.tsx           # Saved properties
    |   |       +-- BuyerVisitsPage.tsx          # Scheduled visits
    |   |       +-- BuyerLegalDocumentsPage.tsx  # Property legal doc viewer
    |   |       +-- BuyerPurchasesPage.tsx       # Purchased properties
    |   |       +-- BuyerMembershipPage.tsx      # Membership status + upgrade
    |   |       +-- BuyerProfilePage.tsx         # Buyer profile edit
    |   +-- seller/
    |       +-- pages/
    |           +-- SellerDashboard.tsx              # Seller home + stats
    |           +-- AddPropertyPage.tsx              # Multi-step listing form
    |           +-- MyPropertiesPage.tsx             # Property portfolio
    |           +-- PaymentsPage.tsx                 # Platform fee history + pay
    |           +-- DocumentUploadPage.tsx           # KYC doc upload (S3)
    |           +-- SellerAuctionDashboard.tsx       # All seller auctions
    |           +-- SellerAuctionManagementPage.tsx  # Per-property auction manage
    |           +-- SellerIdentityDocsPage.tsx       # Identity doc upload + manage
    |
    +-- components/
    |   +-- auctions/
    |   |   +-- BidHistory.tsx
    |   |   +-- BidPanel.tsx
    |   |   +-- CountdownTimer.tsx   # Urgency colors green/yellow/red
    |   |   +-- Leaderboard.tsx
    |   +-- chat/
    |   |   +-- ChatInput.tsx
    |   |   +-- ChatWindow.tsx
    |   |   +-- MeetingRequest.tsx
    |   |   +-- MessageBubble.tsx
    |   +-- common/
    |   |   +-- ErrorBoundary.tsx
    |   |   +-- Loader.tsx
    |   |   +-- NotificationPanel.tsx    # In-app notification dropdown
    |   |   +-- PrivateRoute.tsx         # Role guard (Outlet)
    |   |   +-- PublicOnlyRoute.tsx      # Redirect logged-in users away from login/register
    |   |   +-- SplashScreen.tsx
    |   |   +-- SummaryCard.tsx          # Reusable stat summary card
    |   +-- layout/
    |   |   +-- BuyerLayout.tsx          # Persistent sidebar shell for /buyer/* routes
    |   |   +-- BuyerSidebar.tsx         # Nav: dashboard/auctions/bids/saved/visits/docs/purchases/membership/profile
    |   |   +-- Footer.tsx
    |   |   +-- MobileNav.tsx
    |   |   +-- Navbar.tsx               # Top nav with role menu + auth state
    |   +-- properties/
    |       +-- ImageGallery.tsx
    |       +-- PropertyCard.tsx
    |       +-- PropertyFilters.tsx
    |       +-- PropertyGrid.tsx
    |       +-- PropertyMap.tsx           # MapLibre GL pins
    |
    +-- hooks/
    |   +-- useAuth.ts        # Reads authStore
    |   +-- useDebounce.ts    # Debounce values
    |   +-- useGeolocation.ts # navigator.geolocation wrapper
    |   +-- useMediaQuery.ts  # Responsive breakpoints
    |   +-- useSocket.ts      # Socket.IO lifecycle
    |
    +-- services/
    |   +-- api.ts            # Axios + base URL + auth interceptors
    |   +-- authService.ts    # login, register, logout, refresh
    |   +-- auctionService.ts # listAuctions, getAuction, placeBid
    |   +-- chatService.ts    # getRooms, getMessages, sendMessage
    |   +-- membershipService.ts
    |   +-- propertyService.ts
    |   +-- sellerService.ts  # S3 uploads, platform fees, auction mgmt
    |   +-- userService.ts
    |
    +-- store/
    |   +-- authStore.ts      # Zustand: user/role/tokens/isAuthenticated
    |   +-- auctionStore.ts   # Zustand: active auction state
    |   +-- chatStore.ts      # Zustand: rooms + messages
    |   +-- filterStore.ts    # Zustand: property filters
    |
    +-- types/
    |   +-- api.types.ts
    |   +-- auction.types.ts
    |   +-- chat.types.ts
    |   +-- property.types.ts
    |   +-- user.types.ts
    |
    +-- utils/
        +-- constants.ts
        +-- formatters.ts     # Currency (INR), date, area
        +-- geohash.ts
        +-- socket.ts
        +-- validators.ts
```

---

## Frontend - Pages and Routing

### Public Routes

| Path | Page |
|---|---|
| / | LandingPage |
| /verify | VerifyPage |
| /properties | PropertyListPage |
| /properties/:id | PropertyDetailPage |
| /auctions | AuctionsListPage |
| /auctions/:id | AuctionRoomPage |
| /membership | MembershipPage |

### PublicOnlyRoute (redirect if logged in)

| Path | Page |
|---|---|
| /login | LoginPage |
| /register | RegisterPage |

### Protected - Buyer (role: buyer, wrapped in BuyerLayout)

| Path | Page | Source |
|---|---|---|
| /buyer/dashboard | BuyerDashboard | features/buyer/pages |
| /buyer/auctions | BuyerAuctionsPage | features/buyer/pages |
| /buyer/bids | BuyerBidsPage | features/buyer/pages |
| /buyer/saved | BuyerSavedPage | features/buyer/pages |
| /buyer/visits | BuyerVisitsPage | features/buyer/pages |
| /buyer/legal-documents | BuyerLegalDocumentsPage | features/buyer/pages |
| /buyer/purchases | BuyerPurchasesPage | features/buyer/pages |
| /buyer/membership | BuyerMembershipPage | features/buyer/pages |
| /buyer/profile | BuyerProfilePage | features/buyer/pages |

### Protected - Seller (role: seller)

| Path | Page | Source |
|---|---|---|
| /seller | SellerDashboard | features/seller/pages |
| /seller/dashboard | SellerDashboard | features/seller/pages |
| /seller/add-property | AddPropertyPage | features/seller/pages |
| /seller/my-properties | MyPropertiesPage | features/seller/pages |
| /seller/auctions | SellerAuctionDashboard | features/seller/pages |
| /seller/auctions/:id | SellerAuctionManagementPage | features/seller/pages |
| /seller/payments | PaymentsPage | features/seller/pages |
| /seller/documents | DocumentUploadPage | features/seller/pages |
| /seller/identity-documents | SellerIdentityDocsPage | features/seller/pages |

### Protected - All authenticated (buyer or seller)

| Path | Page |
|---|---|
| /chat | ChatPage |
| /profile | ProfilePage |

All pages lazy-loaded. SplashScreen on first load. Buyer routes nested inside BuyerLayout.

---

## Frontend - Components

### Auction
| Component | Purpose |
|---|---|
| BidPanel | Bid input + current price + submit |
| BidHistory | Scrollable bid list |
| CountdownTimer | Urgency countdown green/yellow/red |
| Leaderboard | Ranked top bidders |

### Chat
| Component | Purpose |
|---|---|
| ChatWindow | Message thread |
| ChatInput | Composer + send |
| MessageBubble | Single message |
| MeetingRequest | Schedule visit widget |

### Layout
| Component | Purpose |
|---|---|
| BuyerLayout | Shell + sidebar for all /buyer/* routes |
| BuyerSidebar | Nav links for buyer feature pages |
| Navbar | Top nav: role menu + auth state |
| Footer | Site footer |
| MobileNav | Fixed bottom mobile nav |

### Common
| Component | Purpose |
|---|---|
| PrivateRoute | Auth + role guard (Outlet pattern) |
| PublicOnlyRoute | Redirect logged-in users from /login and /register |
| NotificationPanel | In-app notification dropdown (read/delete) |
| SummaryCard | Reusable stat card for dashboards |
| SplashScreen | Branded splash on first load |
| Loader | Fullscreen spinner |
| ErrorBoundary | Render error fallback |

### Properties
| Component | Purpose |
|---|---|
| PropertyCard | Image + price + location card |
| PropertyGrid | Responsive card grid |
| PropertyFilters | Filter panel (price, type, location, beds) |
| PropertyMap | MapLibre GL pins |
| ImageGallery | Lightbox gallery |

---

## Frontend - Services and State

### sellerService.ts

| Function | Description |
|---|---|
| getSellerDashboard() | Seller stats |
| getSellerProperties() | My listings |
| getSellerPayments() | Fee payment history |
| uploadFileToS3() | POST /properties/upload-url -> PUT to S3 -> return publicUrl |
| getDocumentUploadUrl() | Pre-signed doc upload URL + s3Key |
| uploadDocumentToS3() | Upload doc to S3; return s3Key |
| saveDocumentsToProperty() | PATCH /seller/properties/:id/documents |
| payPlatformFee() | POST /seller/properties/:id/pay-fee |
| deleteSellerProperty() | DELETE /properties/:id |
| getSellerAuctions() | GET /seller/auctions |
| scheduleAuction() | POST /seller/properties/:id/auction |
| getPropertyAuction() | GET /seller/properties/:id/auction |
| getAuctionBids() | GET /seller/properties/:id/auction/bids |

### Zustand Stores

| Store | State | Actions |
|---|---|---|
| authStore | user, role, accessToken, isAuthenticated | login(), logout(), setTokens() |
| auctionStore | currentAuction, currentBid, bidders, timeLeft | setBid(), setAuction(), addBidder() |
| chatStore | rooms, activeRoom, messages | setRooms(), setMessages(), addMessage() |
| filterStore | priceRange, propertyType, location, bedrooms | setFilter(), resetFilters() |

### Custom Hooks

| Hook | Purpose |
|---|---|
| useAuth | Read authStore |
| useSocket | Socket.IO lifecycle |
| useGeolocation | navigator.geolocation wrapper |
| useDebounce | Debounce inputs |
| useMediaQuery | Responsive breakpoints |

---

## Data Models

### DynamoDB Tables

| Table | PK | SK | Description |
|---|---|---|---|
| LegalNest-Users | userId | - | Profiles, KYC, role |
| LegalNest-Properties | propertyId | - | Listings + geo + images |
| LegalNest-Auctions | auctionId | - | Auction state + timing |
| LegalNest-Bids | auctionId | bidId | All bids per auction |
| LegalNest-Transactions | transactionId | - | Post-auction transactions |
| LegalNest-ChatRooms | roomId | - | Buyer-seller rooms |
| LegalNest-Messages | roomId | messageId | Messages (90-day TTL) |
| LegalNest-Notifications | userId | notificationId | In-app notifications |
| LegalNest-Payments | paymentId | - | Platform fee records |
| LegalNest-Memberships | userId | - | Membership plan + expiry |
| LegalNest-SavedProperties | buyerId + propertyId | - | Saved property records |
| LegalNest-Visits | visitId | - | Property visit records |
| LegalNest-Purchases | purchaseId | - | Purchased property records (GSI: buyerId) |

### Key Entity Shapes

**Property**
```json
{
  "propertyId": "", "sellerId": "", "title": "", "price": 0,
  "listingType": "sale|rent",
  "status": "pending|approved|rejected|auctioned",
  "verificationStatus": "pending|verified|rejected",
  "platformFeePaid": false, "isAuctionRequested": false,
  "documents": [], "images": [],
  "lat": 0, "lng": 0, "geohash": "",
  "viewCount": 0, "createdAt": "", "updatedAt": ""
}
```

**Auction**
```json
{
  "auctionId": "", "propertyId": "", "sellerId": "",
  "status": "scheduled|live|closed",
  "startingPrice": 0, "reservePrice": 0,
  "currentHighestBid": 0, "highestBidderId": "",
  "bidIncrement": 0, "extensionCount": 0,
  "startTime": "", "endTime": ""
}
```

**Membership**
```json
{
  "userId": "", "plan": "basic|premium|elite",
  "purchasedAt": "", "expiryDate": "",
  "status": "active|expired", "transactionId": ""
}
```

**Visit**
```json
{
  "visitId": "", "buyerId": "", "propertyId": "", "sellerId": "",
  "date": "", "time": "",
  "status": "scheduled|confirmed|completed|cancelled",
  "createdAt": ""
}
```

**Payment**
```json
{
  "paymentId": "", "sellerId": "", "propertyId": "",
  "amount": 0, "type": "sale_listing|rent_listing",
  "status": "success|pending|failed", "createdAt": ""
}
```

### Membership Plans

| Plan | Price | Duration | Key Benefits |
|---|---|---|---|
| basic | Free | Indefinite | Browse, save 10 props, basic support |
| premium | Rs.999 | 30 days | Live auctions, unlimited saves, priority KYC, dedicated support |
| elite | Rs.2999 | 30 days | All premium + early luxury access, free valuations, concierge visits |

---

## Environment Configuration

### Backend (.env)

```
NODE_ENV=development
PORT=3000
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_KwhN2NRwO
COGNITO_CLIENT_ID=kggusnn2j96q7bdjdr7tlcvns
JWT_SECRET=legalnest_super_secret_key_2026_very_secure
DYNAMODB_USERS_TABLE=LegalNest-Users
DYNAMODB_PROPERTIES_TABLE=LegalNest-Properties
DYNAMODB_AUCTIONS_TABLE=LegalNest-Auctions
DYNAMODB_BIDS_TABLE=LegalNest-Bids
DYNAMODB_TRANSACTIONS_TABLE=LegalNest-Transactions
DYNAMODB_CHAT_ROOMS_TABLE=LegalNest-ChatRooms
DYNAMODB_MESSAGES_TABLE=LegalNest-Messages
DYNAMODB_NOTIFICATIONS_TABLE=LegalNest-Notifications
S3_MEDIA_BUCKET=gharbid-app-storage-2026
S3_UPLOADS_BUCKET=gharbid-property-images
S3_DOCUMENTS_BUCKET=gharbid-documents
LOCATION_INDEX_NAME=LegalNestPlaceIndex
SES_FROM_EMAIL=noreply@legalnest.com
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)

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
| npm run dev | node --watch src/server.js |
| npm start | node src/server.js |
| npm run seed | node scripts/seedDatabase.js |
| npm run create-tables | node scripts/createTables.js |
| npm test | Jest (ESM) |

### Frontend

| Script | Command |
|---|---|
| npm run dev | Vite dev (localhost:5173) |
| npm run build | tsc + Vite build |
| npm run preview | Preview prod |
| npm run lint | ESLint |

---

## Changelog

### June 23, 2026 (evening) - Frontend Refactor

**Frontend restructured to feature-based module layout:**
- `src/pages/` now contains only public + shared pages (11 files)
- `src/features/buyer/pages/` - all 9 buyer pages moved here
- `src/features/seller/pages/` - all seller pages moved here (8 files)
- New seller page: `SellerIdentityDocsPage.tsx` + route `/seller/identity-documents`

**New common components:**
- `PublicOnlyRoute.tsx` - redirects logged-in users away from /login and /register
- `NotificationPanel.tsx` - in-app notification dropdown with read/delete
- `SummaryCard.tsx` - reusable stat card for dashboards

**Routing changes in App.tsx:**
- Login + register wrapped in `PublicOnlyRoute`
- Seller routes expanded: `/seller/identity-documents` added

### June 23, 2026 (morning) - Buyer Module + Seller Auctions

**Backend - New Buyer Module (/v1/buyer)**
- `buyerController.js` - 14 handlers
- `buyer.routes.js` - 23 routes, buyer role required
- `buyerService.js` - dashboard stats, recommendations, saved properties
- `visitService.js` - schedule/update/cancel visits; seller notified
- `membershipService.js` - 3 tiers (basic/premium/elite)
- `buyerNotificationService.js` - get/markRead/delete/alert

**Backend - New DynamoDB Models**
- `MembershipModel.js`, `PurchaseModel.js`, `SavedPropertiesModel.js`, `VisitModel.js`

**Backend - Seller Auction Management**
- `sellerAuctionController.js` - schedule, view details, bid history, interested buyers, all auctions
- `seller.routes.js` extended with 5 auction sub-routes

**Frontend - New Buyer Pages (9)**
All in `src/features/buyer/pages/`

**Frontend - New Seller Pages (2)**
`SellerAuctionDashboard`, `SellerAuctionManagementPage` in `src/features/seller/pages/`

**Frontend - Layout**
- `BuyerLayout.tsx` + `BuyerSidebar.tsx` - persistent sidebar for /buyer/* routes

### June 17, 2026 - TypeScript to JavaScript + Seller Module

- Backend migrated TypeScript -> JavaScript (ESM); node --watch replaces ts-node-dev
- `sellerController.js` + `seller.routes.js` with dashboard, docs, platform fees
- `PaymentModel.js` + LegalNest-Payments table
- S3: 2 -> 3 buckets (added gharbid-property-images)
- Frontend: AddPropertyPage, MyPropertiesPage, PaymentsPage, DocumentUploadPage
- `sellerService.ts` with S3 upload + platform fee functions

### June 15, 2026 - Initial

- Initial project summary
- TypeScript backend + React/TypeScript frontend documented

---

*Generated on 2026-06-23 | LegalNest / GharBid v1.0.0*
