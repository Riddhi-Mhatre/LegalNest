# LegalNest / GharBid - Project Summary

> **Project Name:** GharBid (marketed as **LegalNest**)
> **Type:** Full-Stack Real-Estate Auction Platform
> **Last Updated:** June 17, 2026

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

**GharBid / LegalNest** is a legally compliant real-estate marketplace and live auction platform for India. It enables:

- **Sellers** to list verified properties, upload KYC documents, pay platform fees, and schedule auctions
- **Buyers** (members) to browse listings, place live bids, and chat post-auction
- **Admins** to approve properties, verify users, schedule auctions, and moderate the platform

Core differentiators:
- **Live auction rooms** with real-time bidding via WebSocket
- **Anti-sniping** extension logic (auto-extends if a bid arrives within 2 minutes of close)
- **Membership gating** - buyers require an active membership to participate
- **Platform fee system** - sellers pay per listing (sale: Rs.999 / rent: Rs.299)
- **Document management** - dedicated KYC / legal document upload flow for sellers
- **AWS-native** - Cognito auth, DynamoDB, S3 (3 buckets), SES email, Amazon Location

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) + JavaScript |
| Framework | Express 4 |
| Auth | AWS Cognito + JWT (aws-jwt-verify) |
| Database | AWS DynamoDB (@aws-sdk/lib-dynamodb) |
| File Storage | AWS S3 (pre-signed URLs) |
| Email | AWS SES |
| Geo / Maps | AWS Location Service |
| Real-time | Socket.IO 4 |
| Validation | Zod |
| Logging | Winston + Morgan |
| Rate Limiting | express-rate-limit |
| Security | Helmet + CORS |
| Dev Server | node --watch (native Node.js) |

> **Note:** The backend was migrated from TypeScript to plain JavaScript (ESM) in the June 2026 update.

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
FRONTEND (Vite/React)
  Browser -> React Router -> Pages -> API Services
                         WS (Socket.IO client)
           |
           | HTTP REST v1 / WebSocket
           |
BACKEND (Express / Node.js ESM)
  [Routes] -> [Middleware] -> [Controllers] -> [Services]
  [WebSocket: auctionHandler | chatHandler | notificationHandler]
           |
AWS SERVICES
  Cognito | DynamoDB | S3 (3 buckets) | SES | Amazon Location
```

---

## AWS Infrastructure

| Service | Purpose | Key Config |
|---|---|---|
| **AWS Cognito** | User auth, groups | Pool: ap-south-1_KwhN2NRwO, Client: kggusnn2j96q7bdjdr7tlcvns |
| **DynamoDB** | Primary NoSQL database | 9 tables (see Data Models) |
| **S3 gharbid-app-storage-2026** | General media | Pre-signed PUT URLs, 5 min TTL |
| **S3 gharbid-property-images** | Property listing images | Pre-signed PUT URLs, 5 min TTL |
| **S3 gharbid-documents** | KYC / legal documents | Scoped per user+docType |
| **SES** | Transactional email | From: noreply@legalnest.com |
| **Amazon Location** | Geocoding | Index: LegalNestPlaceIndex |
| **AWS Region** | All services | ap-south-1 (Mumbai) |

---

## Backend - Complete File Structure

```
backend/
+-- .env                          # Environment variables
+-- package.json                  # legalnest-backend v1.0.0 (Node.js ESM)
+-- scripts/
|   +-- createTables.js           # DynamoDB table provisioning
|   +-- seedDatabase.js           # Seed data for dev
+-- src/
    +-- app.js                    # Express app, middleware, route mounting
    +-- server.js                 # HTTP server + WebSocket init
    +-- config/
    |   +-- aws.js                # AWS SDK clients (Cognito, DynamoDB, S3, SES, Location)
    |   +-- database.js           # DynamoDB DocumentClient factory
    |   +-- env.js                # Zod-validated env schema
    |   +-- redis.js              # Redis config (placeholder)
    +-- controllers/
    |   +-- adminController.js    # Dashboard, user verification, property approval
    |   +-- auctionController.js  # List/get auctions, place bid, auto-bid
    |   +-- authController.js     # Register, login, OTP, refresh, logout
    |   +-- chatController.js     # Rooms, messages
    |   +-- membershipController.js # Create / get membership
    |   +-- propertyController.js # CRUD, interest, favourite, upload URL
    |   +-- sellerController.js   # [NEW] Dashboard, docs, platform fees
    |   +-- userController.js     # Get/update profile
    +-- middleware/
    |   +-- auth.js               # JWT Cognito token verification
    |   +-- authorize.js          # Fine-grained action authorization
    |   +-- errorHandler.js       # Global structured error handler
    |   +-- logging.js            # Request logger
    |   +-- rateLimit.js          # authLimiter / bidLimiter / generalLimiter
    |   +-- rbac.js               # requireRole([...]) RBAC
    |   +-- validation.js         # Zod schema validation middleware
    +-- models/
    |   +-- dynamodb/
    |       +-- AuctionModel.js   # Auctions table helpers
    |       +-- BidModel.js       # putBid, getBidHistory
    |       +-- PaymentModel.js   # [NEW] createPayment, queryBySeller, queryByProperty
    |       +-- PropertyModel.js  # Properties table helpers + GSI queries
    |       +-- TransactionModel.js # Transaction helpers
    |       +-- UserModel.js      # User get/put/update
    +-- routes/
    |   +-- v1/
    |       +-- admin.routes.js       # /v1/admin/*
    |       +-- auction.routes.js     # /v1/auctions/*
    |       +-- auth.routes.js        # /v1/auth/*
    |       +-- chat.routes.js        # /v1/chat/*
    |       +-- membership.routes.js  # /v1/memberships/*
    |       +-- property.routes.js    # /v1/properties/*
    |       +-- seller.routes.js      # [NEW] /v1/seller/*
    |       +-- user.routes.js        # /v1/users/*
    +-- services/
    |   +-- auctionEngine.js      # Bid logic, anti-sniping, auto-bids, broadcast
    |   +-- chatService.js        # Chat rooms + messages
    |   +-- cognitoService.js     # Auth: signUp/signIn/OTP/roles
    |   +-- dynamoService.js      # Generic DynamoDB CRUD
    |   +-- emailService.js       # SES transactional emails
    |   +-- locationService.js    # Geocode, reverse-geocode, nearby
    |   +-- notificationService.js # In-app notifications
    |   +-- s3Service.js          # Pre-signed upload/read URLs
    +-- utils/
    |   +-- constants.js          # AUCTION_CONFIG, HTTP codes
    |   +-- helpers.js            # generateUUID, date helpers
    |   +-- jwt.js                # JWT sign/verify wrappers
    |   +-- logger.js             # Winston logger
    +-- validators/
    |   +-- auction.validator.js
    |   +-- auth.validator.js     # loginSchema, registerSchema, otpSchema
    |   +-- property.validator.js
    |   +-- user.validator.js
    +-- lambdas/
    |   +-- auctionScheduler/index.js    # Auto-start/close auctions
    |   +-- documentVerification/index.js # KYC document trigger
    |   +-- membershipExpiry/index.js    # Expire stale memberships
    |   +-- streamProcessor/index.js     # DynamoDB Streams consumer
    +-- websocket/
        +-- server.js             # Socket.IO init + handler wiring
        +-- socketAuth.js         # JWT handshake verification
        +-- handlers/
            +-- auctionHandler.js
            +-- chatHandler.js
            +-- notificationHandler.js
```

---

## Backend - Implemented Services

### 1. cognitoService.js - Authentication

| Function | Description |
|---|---|
| signUp() | Register user (email, password, name, phone) |
| signIn() | USER_PASSWORD_AUTH; returns tokens + role |
| refreshSession() | REFRESH_TOKEN_AUTH |
| signOut() | Global sign-out |
| confirmSignUp() | Email code confirmation |
| addUserToGroup() | Assign Buyer or Seller Cognito group |
| getUserRole() | Resolve Cognito group (buyer/seller/admin) |
| forgotPassword() | Trigger forgot-password flow |
| confirmForgotPassword() | Reset with confirmation code |
| requestOtp() | SMS OTP (placeholder) |
| verifyOtp() | OTP verify (placeholder) |

### 2. auctionEngine.js - Live Auction Core

| Function | Description |
|---|---|
| placeBid() | Validate + conditional write (race-safe) + anti-snipe + broadcast |
| extendAuction() | Extend end time; broadcast auction_extended |
| processAutoBids() | Placeholder (Sprint 3) |
| getBidHistory() | Delegate to BidModel |
| setAutoBid() | Configure auto-bid max amount |
| setIo() | Register Socket.IO for broadcasts |

**Anti-sniping:** Extends auction if bid arrives within 2 min of close (up to MAX_EXTENSIONS times).

### 3. dynamoService.js - Generic DynamoDB Adapter

| Function | Description |
|---|---|
| getItem() | GetCommand wrapper |
| putItem() | PutCommand wrapper |
| updateItem() | Dynamic UpdateExpression + auto updatedAt |
| deleteItem() | DeleteCommand wrapper |
| queryItems() | QueryCommand with optional GSI, filter, limit |
| scanItems() | ScanCommand (use sparingly) |

### 4. chatService.js - Messaging

| Function | Description |
|---|---|
| getUserRooms() | Get all chat rooms for a user |
| getMessages() | Retrieve messages in a room |
| saveMessage() | Save message with 90-day TTL |
| createChatRoom() | Create post-auction buyer-seller room |
| markMessagesRead() | Batch mark read (TODO) |

### 5. emailService.js - SES Transactional Emails

| Function | Trigger |
|---|---|
| sendWelcomeEmail() | Registration |
| sendOutbidEmail() | Outbid at auction |
| sendAuctionWinnerEmail() | Auction won |
| sendMembershipExpiryEmail() | Membership about to expire |

### 6. s3Service.js - File Storage

| Function | Description |
|---|---|
| getMediaUploadUrl() | Pre-signed PUT URL for images (5 min) |
| getDocumentUploadUrl() | Pre-signed PUT URL for KYC docs (scoped) |
| getDocumentReadUrl() | Pre-signed GET URL for doc access |

### 7. locationService.js - Geo Services

| Function | Description |
|---|---|
| geocodeAddress() | Text-to-coordinates (up to 5 results) |
| reverseGeocode() | Lat/Lng to address |
| searchNearbyPlaces() | Category search biased to position |

### 8. notificationService.js - In-App Notifications

Stores notifications in DynamoDB and delivers via WebSocket.

---

## Backend - API Routes

All routes versioned under /v1.

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
| GET | /upload-url | Yes | seller | S3 pre-signed URL for images |
| GET | / | - | - | List all properties |
| GET | /:id | - | - | Get property detail |
| POST | / | Yes | seller | Create property |
| PUT | /:id | Yes | seller, admin | Update property |
| DELETE | /:id | Yes | seller, admin | Delete property |
| POST | /:id/interest | Yes | buyer | Express interest |
| POST | /:id/favorite | Yes | buyer | Save to favourites |

### Auctions - /v1/auctions

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | / | - | - | List auctions |
| GET | /:id | - | - | Get auction details |
| GET | /:id/bids | - | - | Get bid history |
| POST | /:id/bid | Yes | buyer | Place a bid (rate limited) |
| POST | /:id/auto-bid | Yes | buyer | Set auto-bid max amount |

### Seller - /v1/seller (NEW - requires seller role)

| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Seller stats (properties, views) |
| GET | /properties | My property listings |
| GET | /document-upload-url | Pre-signed S3 URL for doc upload |
| PATCH | /properties/:id/documents | Save uploaded doc S3 keys |
| POST | /properties/:id/pay-fee | Pay platform fee (sale: Rs.999, rent: Rs.299) |
| GET | /payments | My platform fee payment history |

### Users - /v1/users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /me | Yes | Get own profile |
| PUT | /me | Yes | Update own profile |

### Chat - /v1/chat

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /rooms | Yes | Get user chat rooms |
| GET | /rooms/:roomId/messages | Yes | Get room messages |
| POST | /rooms/:roomId/messages | Yes | Send message |

### Memberships - /v1/memberships

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | / | Yes | buyer | Purchase membership |
| GET | /me | Yes | buyer | Get membership status |

### Admin - /v1/admin (requires admin role)

| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Platform stats |
| GET | /users | List all users |
| PUT | /users/:userId/verify | Verify user KYC |
| GET | /properties/pending | Pending property approvals |
| PUT | /properties/:id/approve | Approve listing |
| PUT | /properties/:id/reject | Reject listing |
| POST | /auctions | Schedule auction |
| PUT | /interests/:interestId/approve | Approve buyer interest |

---

## Backend - Middleware

| File | Middleware | Description |
|---|---|---|
| auth.js | authenticate | Verify Cognito JWT; attach userId, email, role to req |
| authorize.js | authorize() | Fine-grained action authorization |
| rbac.js | requireRole([...]) | Role whitelist guard |
| rateLimit.js | authLimiter | 10 req/15 min per IP (auth routes) |
| rateLimit.js | bidLimiter | 30 req/min per IP (bidding) |
| rateLimit.js | generalLimiter | 100 req/15 min per IP (general) |
| validation.js | validate(schema) | Zod schema validation |
| errorHandler.js | errorHandler | Global JSON error handler |
| logging.js | requestLogger | Log method, path, status, duration |

---

## Backend - Lambda Functions

| Lambda | Trigger | Function |
|---|---|---|
| auctionScheduler | EventBridge | Auto-transitions auctions scheduled/live/closed |
| documentVerification | S3 event | KYC doc review pipeline trigger |
| membershipExpiry | EventBridge | Expire stale memberships + send email |
| streamProcessor | DynamoDB Streams | Notifications, analytics, downstream sync |

---

## Backend - WebSocket Server

**Server:** websocket/server.js - Socket.IO 4 + JWT auth at handshake.

### Auction Events (auctionHandler.js)

| Direction | Event | Description |
|---|---|---|
| Client -> Server | join_auction | Join auction room |
| Client -> Server | place_bid | Submit live bid |
| Client -> Server | leave_auction | Leave auction room |
| Server -> Client | new_bid | Broadcast { userId, amount, timestamp } |
| Server -> Client | auction_extended | Broadcast new end time after anti-snipe |

### Chat Events (chatHandler.js)

| Direction | Event | Description |
|---|---|---|
| Client -> Server | join_room | Join private chat room |
| Client -> Server | send_message | Send message |
| Client -> Server | typing | Typing indicator |
| Server -> Client | message | Delivered message |
| Server -> Client | typing | Forwarded typing indicator |

### Notification Events (notificationHandler.js)

| Direction | Event | Description |
|---|---|---|
| Server -> Client | notification | Push in-app notification |

---

## Frontend - Complete File Structure

```
frontend/
+-- .env.local                    # VITE_API_URL, VITE_WS_URL
+-- env.download                  # Env template/reference
+-- index.html
+-- package.json                  # gharbid-frontend v1.0.0
+-- tailwind.config.js
+-- vite.config.ts
+-- src/
    +-- main.tsx
    +-- App.tsx                   # Router, lazy pages, SplashScreen
    +-- styles/globals.css
    +-- pages/
    |   +-- LandingPage.tsx       # Hero + CTA (public)
    |   +-- LoginPage.tsx
    |   +-- RegisterPage.tsx
    |   +-- VerifyPage.tsx
    |   +-- PropertyListPage.tsx
    |   +-- PropertyDetailPage.tsx
    |   +-- AuctionsListPage.tsx
    |   +-- AuctionRoomPage.tsx   # Live bidding room
    |   +-- BuyerDashboard.tsx
    |   +-- SellerDashboard.tsx
    |   +-- AddPropertyPage.tsx   # [NEW] Multi-step listing form
    |   +-- MyPropertiesPage.tsx  # [NEW] Seller portfolio view
    |   +-- PaymentsPage.tsx      # [NEW] Fee payment history + pay action
    |   +-- DocumentUploadPage.tsx# [NEW] KYC doc upload with S3 integration
    |   +-- AdminDashboard.tsx
    |   +-- ChatPage.tsx
    |   +-- MembershipPage.tsx
    |   +-- ProfilePage.tsx
    +-- components/
    |   +-- auctions/
    |   |   +-- BidHistory.tsx
    |   |   +-- BidPanel.tsx
    |   |   +-- CountdownTimer.tsx
    |   |   +-- Leaderboard.tsx
    |   +-- chat/
    |   |   +-- ChatInput.tsx
    |   |   +-- ChatWindow.tsx
    |   |   +-- MeetingRequest.tsx
    |   |   +-- MessageBubble.tsx
    |   +-- common/
    |   |   +-- ErrorBoundary.tsx
    |   |   +-- Loader.tsx
    |   |   +-- PrivateRoute.tsx
    |   |   +-- SplashScreen.tsx
    |   +-- layout/
    |   |   +-- Navbar.tsx
    |   |   +-- Footer.tsx
    |   |   +-- MobileNav.tsx
    |   +-- properties/
    |       +-- ImageGallery.tsx
    |       +-- PropertyCard.tsx
    |       +-- PropertyFilters.tsx
    |       +-- PropertyGrid.tsx
    |       +-- PropertyMap.tsx
    +-- hooks/
    |   +-- useAuth.ts
    |   +-- useDebounce.ts
    |   +-- useGeolocation.ts
    |   +-- useMediaQuery.ts
    |   +-- useSocket.ts
    +-- services/
    |   +-- api.ts                # Axios + interceptors
    |   +-- authService.ts
    |   +-- auctionService.ts
    |   +-- chatService.ts
    |   +-- membershipService.ts
    |   +-- propertyService.ts
    |   +-- sellerService.ts      # [NEW] S3 uploads, platform fees, seller data
    |   +-- userService.ts
    +-- store/
    |   +-- authStore.ts
    |   +-- auctionStore.ts
    |   +-- chatStore.ts
    |   +-- filterStore.ts
    +-- types/
    |   +-- api.types.ts
    |   +-- auction.types.ts
    |   +-- chat.types.ts
    |   +-- property.types.ts
    |   +-- user.types.ts
    +-- utils/
        +-- constants.ts
        +-- formatters.ts         # Currency (INR), date, area
        +-- geohash.ts
        +-- socket.ts
        +-- validators.ts
```

---

## Frontend - Pages and Routing

| Path | Page | Auth | Roles |
|---|---|---|---|
| / | LandingPage | Public | - |
| /login | LoginPage | Public | - |
| /register | RegisterPage | Public | - |
| /verify | VerifyPage | Public | - |
| /properties | PropertyListPage | Public | - |
| /properties/:id | PropertyDetailPage | Public | - |
| /auctions | AuctionsListPage | Public | - |
| /auctions/:id | AuctionRoomPage | Public | - |
| /membership | MembershipPage | Public | - |
| /buyer/dashboard | BuyerDashboard | Protected | buyer |
| /seller | SellerDashboard | Protected | seller |
| /seller/dashboard | SellerDashboard | Protected | seller |
| /seller/add-property | AddPropertyPage | Protected | seller |
| /seller/my-properties | MyPropertiesPage | Protected | seller |
| /seller/payments | PaymentsPage | Protected | seller |
| /seller/documents | DocumentUploadPage | Protected | seller |
| /admin/dashboard | AdminDashboard | Protected | admin |
| /chat | ChatPage | Protected | buyer, seller, admin |
| /profile | ProfilePage | Protected | buyer, seller, admin |

All pages are lazy-loaded via React.lazy() with Suspense fallback. A SplashScreen plays on first load.

---

## Frontend - Components

### Auction Components
| Component | Description |
|---|---|
| BidPanel | Current bid, min-bid, input field, submit |
| BidHistory | Scrollable bid list with amounts and timestamps |
| CountdownTimer | Live countdown with urgency colors (green/yellow/red) |
| Leaderboard | Ranked top bidders list |

### Chat Components
| Component | Description |
|---|---|
| ChatWindow | Scrollable message thread |
| ChatInput | Message composer |
| MessageBubble | Individual message with sender and time |
| MeetingRequest | Schedule buyer-seller meeting |

### Layout Components
| Component | Description |
|---|---|
| Navbar | Top bar with role-based menu + auth state |
| Footer | Site footer |
| MobileNav | Fixed bottom nav for mobile |

### Common Components
| Component | Description |
|---|---|
| PrivateRoute | Route guard checking auth + role via Zustand |
| SplashScreen | Animated brand splash on first load |
| Loader | Fullscreen loading spinner |
| ErrorBoundary | Render error fallback |

### Property Components
| Component | Description |
|---|---|
| PropertyCard | Thumbnail with image, price, location |
| PropertyGrid | Responsive card grid |
| PropertyFilters | Filter panel (price, type, location, bedrooms) |
| PropertyMap | MapLibre GL map with property pins |
| ImageGallery | Lightbox image gallery |

---

## Frontend - Services and State

### sellerService.ts (NEW)

| Function | Description |
|---|---|
| getSellerDashboard() | Fetch seller stats |
| getSellerProperties() | Fetch seller listings |
| getSellerPayments() | Fetch fee payment history |
| getImageUploadUrl() | Pre-signed URL for image upload |
| uploadImageToS3() | Direct S3 upload, return public URL |
| getDocumentUploadUrl() | Pre-signed URL + S3 key for doc |
| uploadDocumentToS3() | Direct S3 doc upload, return s3Key |
| saveDocumentsToProperty() | Persist doc keys to property |
| payPlatformFee() | Trigger listing fee payment |
| deleteSellerProperty() | Delete own property |

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
| useAuth | Reads authStore |
| useSocket | Manages Socket.IO lifecycle |
| useGeolocation | Wraps navigator.geolocation |
| useDebounce | Debounces search inputs |
| useMediaQuery | Detects responsive breakpoints |

---

## Data Models

### DynamoDB Tables

| Table | Partition Key | Sort Key | Description |
|---|---|---|---|
| LegalNest-Users | userId | - | User profiles, KYC, role |
| LegalNest-Properties | propertyId | - | Listings with geo, images |
| LegalNest-Auctions | auctionId | - | Auction state + timing |
| LegalNest-Bids | auctionId | bidId | All bids per auction |
| LegalNest-Transactions | transactionId | - | Post-auction transactions |
| LegalNest-ChatRooms | roomId | - | Buyer-seller chat rooms |
| LegalNest-Messages | roomId | messageId | Messages (90-day TTL) |
| LegalNest-Notifications | userId | notificationId | In-app notifications |
| LegalNest-Payments | paymentId | - | [NEW] Platform fee records |

### Key Entity Shapes

**Property**
```json
{
  "propertyId": "", "sellerId": "", "title": "", "price": 0,
  "listingType": "sale|rent",
  "status": "pending|approved|rejected|auctioned",
  "verificationStatus": "pending|verified|rejected",
  "platformFeePaid": false,
  "documents": [], "images": [],
  "lat": 0, "lng": 0, "geohash": "",
  "viewCount": 0, "createdAt": "", "updatedAt": ""
}
```

**Auction**
```json
{
  "auctionId": "", "propertyId": "",
  "status": "scheduled|live|closed",
  "startingBid": 0, "currentHighestBid": 0, "highestBidderId": "",
  "bidIncrement": 0, "extensionCount": 0,
  "startTime": 0, "endTime": 0
}
```

**Payment (NEW)**
```json
{
  "paymentId": "", "sellerId": "", "propertyId": "",
  "amount": 0, "type": "sale_listing|rent_listing",
  "status": "success|pending|failed", "createdAt": ""
}
```

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
| npm run dev | node --watch hot-reload |
| npm start | node src/server.js |
| npm run seed | Seed DynamoDB |
| npm run create-tables | Provision DynamoDB tables |
| npm test | Jest (ESM mode) |

### Frontend

| Script | Command |
|---|---|
| npm run dev | Vite dev server (localhost:5173) |
| npm run build | TypeScript + Vite production build |
| npm run preview | Preview production build |
| npm run lint | ESLint |

---

## Changelog

### June 17, 2026

- **Backend migrated TypeScript -> JavaScript (ESM)** - all .ts files converted to .js; ts-node-dev replaced with node --watch
- **New: Seller module** - sellerController.js + seller.routes.js covering dashboard, properties, document upload URL, save documents, platform fee payment, payment history
- **New: PaymentModel.js** - DynamoDB model with GSI queries by sellerId and propertyId
- **New: LegalNest-Payments table** - platform listing fee records (paymentId PK)
- **S3 buckets updated** - from 2 to 3 buckets: gharbid-app-storage-2026, gharbid-property-images, gharbid-documents
- **New frontend pages (4):** AddPropertyPage.tsx, MyPropertiesPage.tsx, PaymentsPage.tsx, DocumentUploadPage.tsx
- **New frontend service:** sellerService.ts with 10 functions (S3 direct uploads, platform fees, seller data)
- **Updated routing:** Seller has 6 dedicated sub-routes under /seller/*
- **entities/ directory cleared** - TypeScript entity interfaces removed (backend is now JS)
- **package.json simplified** - TypeScript toolchain removed from backend devDependencies

### June 15, 2026

- Initial project summary created
- Full TypeScript backend + React/TypeScript frontend documented

---

*Generated on 2026-06-17 | LegalNest / GharBid v1.0.0*
