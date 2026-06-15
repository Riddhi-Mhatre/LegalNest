# 🏠 GharBid (LegalNest) Project Summary & File Structure

This document provides a comprehensive overview of the **GharBid (LegalNest)** project, outlining its architecture, complete directory structure, and details of all implemented frontend and backend services.

---

## 📖 Project Overview

**GharBid (LegalNest)** is a high-performance, real-time real-estate bidding and auction portal. The platform enables sellers to list verified properties for auction, specify starting prices, bid increments, and scheduling parameters, while buyers can bid in real-time, search for nearby places on interactive maps, chat directly with sellers, request meetings, manage portfolios, and subscribe to membership plans.

---

## 🛠️ Technology Stack & Architecture

### Backend (Node.js + Express + TypeScript + AWS)
- **Runtime & Language**: Node.js, TypeScript
- **Web Framework**: Express with TypeScript typings (`ts-node-dev` for hot-reloading)
- **Real-Time Communications**: `socket.io` for bi-directional real-time bidding events, live chat, and instant system notifications.
- **AWS Infrastructure**:
  - **AWS Cognito**: User Pools for authentication and group-based access control (`Buyer` and `Seller` user groups).
  - **AWS DynamoDB**: Main database for users, properties, auctions, bids, transactions, chats, messages, and notifications.
  - **AWS S3**: Document and media hosting with secure presigned URLs for property images and user identification papers.
  - **AWS Location Service**: Address geocoding, reverse geocoding, and proximity searches.
  - **AWS SES**: Transactional emails (e.g. outbid notifications, welcome emails, and membership expiry alerts).
  - **AWS Lambda**: Background workers for automated tasks.
- **Validation & Security**: `zod` for request payload validations; `helmet`, `cors`, and `express-rate-limit` for API security.

### Frontend (React 18 + Vite + TypeScript + ShadCN + Tailwind CSS)
- **Framework & Language**: React 18, Vite, TypeScript
- **State Management**: `zustand` for modular, client-side store management (auth, auctions, chat, property filtering).
- **Styling & Components**: Tailwind CSS, ShadCN UI components (built on Radix UI primitives), Lucide React icons.
- **Data Fetching & API Client**: `axios` with interceptors (managing automatic JWT token insertion and silent token refresh using Cognito refresh tokens), `@tanstack/react-query` for server state caching.
- **Maps**: Maplibre GL integrating with AWS Location Service for geographic searches and maps.
- **Analytics & Visuals**: `recharts` for visual data charts on user dashboards.
- **Form Validation**: React Hook Form combined with Zod schema verification.

---

## 📂 File Structure

Below is the directory tree of the workspace, displaying both the backend and frontend components.

```
gharbid/ (Workspace Root)
│
├── summary.md                          # Project documentation (copy at root)
│
└── LegalNest/
    ├── summary.md                      # [THIS FILE] Project documentation
    ├── backend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── scripts/
    │   │   ├── createTables.ts         # Script to initialize DynamoDB tables
    │   │   └── seedDatabase.ts         # Script to seed database mock values
    │   └── src/
    │       ├── app.ts                  # Express application setup
    │       ├── server.ts               # HTTP & WebSocket server entrypoint
    │       ├── config/
    │       │   ├── aws.ts              # AWS clients setup (Cognito, DynamoDB, S3, Location, SES)
    │       │   ├── database.ts         # Database constants
    │       │   ├── env.ts              # Zod environment variable parsing
    │       │   └── redis.ts            # Optional Redis client setup
    │       ├── controllers/
    │       │   ├── adminController.ts
    │       │   ├── auctionController.ts
    │       │   ├── authController.ts
    │       │   ├── chatController.ts
    │       │   ├── membershipController.ts
    │       │   ├── propertyController.ts
    │       │   └── userController.ts
    │       ├── lambdas/                # AWS Lambda Background Workers
    │       │   ├── auctionScheduler/   # Manages auction state transitions (start/end)
    │       │   │   └── index.ts
    │       │   ├── documentVerification/ # Verification checks for property papers
    │       │   │   └── index.ts
    │       │   ├── membershipExpiry/   # Periodical checks on membership subscriptions
    │       │   │   └── index.ts
    │       │   └── streamProcessor/    # Processes DynamoDB streams for realtime updates
    │       │       └── index.ts
    │       ├── middleware/
    │       │   ├── auth.ts             # Authentication guard (JWT verification)
    │       │   ├── authorize.ts        # Role checks
    │       │   ├── errorHandler.ts     # Global express error handler
    │       │   ├── logging.ts          # Request logs with Winston
    │       │   ├── rateLimit.ts        # IP rate limiter configuration
    │       │   ├── rbac.ts             # Role-based access control mappings
    │       │   └── validation.ts       # Express schema validation middleware
    │       ├── models/
    │       │   ├── dynamodb/           # DynamoDB CRUD Operations & Commands
    │       │   │   ├── AuctionModel.ts
    │       │   │   ├── BidModel.ts
    │       │   │   ├── PropertyModel.ts
    │       │   │   ├── TransactionModel.ts
    │       │   │   └── UserModel.ts
    │       │   └── entities/           # TypeScript interfaces for entities
    │       │       ├── Auction.ts
    │       │       ├── Bid.ts
    │       │       ├── Property.ts
    │       │       ├── Transaction.ts
    │       │       └── User.ts
    │       ├── routes/
    │       │   └── v1/
    │       │       ├── admin.routes.ts
    │       │       ├── auction.routes.ts
    │       │       ├── auth.routes.ts
    │       │       ├── chat.routes.ts
    │       │       ├── membership.routes.ts
    │       │       ├── property.routes.ts
    │       │       └── user.routes.ts
    │       ├── services/               # Core Backend Services
    │       │   ├── auctionEngine.ts
    │       │   ├── chatService.ts
    │       │   ├── cognitoService.ts
    │       │   ├── dynamoService.ts
    │       │   ├── emailService.ts
    │       │   ├── locationService.ts
    │       │   ├── notificationService.ts
    │       │   └── s3Service.ts
    │       ├── utils/
    │       │   ├── constants.ts
    │       │   ├── helpers.ts
    │       │   ├── jwt.ts
    │       │   └── logger.ts
    │       ├── validators/
    │       │   ├── auction.validator.ts
    │       │   ├── auth.validator.ts
    │       │   ├── property.validator.ts
    │       │   └── user.validator.ts
    │       └── websocket/
    │           ├── server.ts           # Socket.io initialization & events
    │           ├── socketAuth.ts       # WebSocket handshake auth middleware
    │           └── handlers/
    │               ├── auctionHandler.ts # Bidding events
    │               ├── chatHandler.ts  # Room messages
    │               └── notificationHandler.ts # Notifications push
    │
    └── frontend/
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts
        ├── index.html
        └── src/
            ├── main.tsx                # App entrypoint
            ├── App.tsx                 # Router & provider setup
            ├── vite-env.d.ts
            ├── components/
            │   ├── auctions/
            │   │   ├── BidHistory.tsx
            │   │   ├── BidPanel.tsx
            │   │   ├── CountdownTimer.tsx
            │   │   └── Leaderboard.tsx
            │   ├── chat/
            │   │   ├── ChatInput.tsx
            │   │   ├── ChatWindow.tsx
            │   │   ├── MeetingRequest.tsx
            │   │   └── MessageBubble.tsx
            │   ├── common/
            │   │   ├── ErrorBoundary.tsx
            │   │   ├── Loader.tsx
            │   │   ├── PrivateRoute.tsx
            │   │   └── SplashScreen.tsx
            │   ├── layout/
            │   │   ├── Footer.tsx
            │   │   ├── MobileNav.tsx
            │   │   └── Navbar.tsx
            │   └── properties/
            │       ├── ImageGallery.tsx
            │       ├── PropertyCard.tsx
            │       ├── PropertyFilters.tsx
            │       ├── PropertyGrid.tsx
            │       └── PropertyMap.tsx
            ├── hooks/
            │   ├── useAuth.ts
            │   ├── useDebounce.ts
            │   ├── useGeolocation.ts
            │   ├── useMediaQuery.ts
            │   └── useSocket.ts
            ├── pages/
            │   ├── AdminDashboard.tsx
            │   ├── AuctionRoomPage.tsx
            │   ├── AuctionsListPage.tsx
            │   ├── BuyerDashboard.tsx
            │   ├── ChatPage.tsx
            │   ├── LandingPage.tsx
            │   ├── LoginPage.tsx
            │   ├── MembershipPage.tsx
            │   ├── ProfilePage.tsx
            │   ├── PropertyDetailPage.tsx
            │   ├── PropertyListPage.tsx
            │   ├── RegisterPage.tsx
            │   ├── SellerDashboard.tsx
            │   └── VerifyPage.tsx
            ├── services/               # Core Frontend Services
            │   ├── api.ts              # Custom Axios HTTP Client with JWT interceptors
            │   ├── auctionService.ts
            │   ├── authService.ts
            │   ├── chatService.ts
            │   ├── membershipService.ts
            │   ├── propertyService.ts
            │   └── userService.ts
            ├── store/                  # Zustand Global Stores
            │   ├── auctionStore.ts
            │   ├── authStore.ts
            │   ├── chatStore.ts
            │   └── filterStore.ts
            ├── styles/
            │   └── globals.css
            ├── types/
            │   ├── api.types.ts
            │   ├── auction.types.ts
            │   ├── chat.types.ts
            │   ├── property.types.ts
            │   └── user.types.ts
            └── utils/
                ├── constants.ts
                ├── formatters.ts
                ├── geohash.ts
                ├── socket.ts
                └── validators.ts
```

---

## ⚙️ Detailed Services Breakdown

Here are the operational details of every service module across the frontend and backend.

### 🔌 Backend Services

| Service File | Purpose | Implemented Functionality |
| :--- | :--- | :--- |
| **`auctionEngine.ts`** | Core Auction Logic | - Places bids (`placeBid`) using DynamoDB conditional write statements to prevent race conditions during high-volume bidding.<br>- Implements anti-sniping protection (`extendAuction`) to extend an auction end-time by a snippet window if a bid is placed near expiration.<br>- Establishes stubs for automatic bidding routines (`processAutoBids`, `setAutoBid`).<br>- Emits WebSocket events (`new_bid`, `auction_extended`) to broadcast updates. |
| **`chatService.ts`** | Room & Messaging Service | - Handles chat room creation (`createChatRoom`) mapping buyer, seller, and transaction IDs.<br>- Retrieves active rooms and handles messaging histories (`getUserRooms`, `getMessages`).<br>- Saves messages (`saveMessage`) to DynamoDB with a 90-day Time-To-Live (TTL) attribute to optimize storage cost. |
| **`cognitoService.ts`** | AWS Cognito Authentication | - Registers accounts (`signUp`) with custom attributes (email, name, phone, user role).<br>- Authenticates users (`signIn`), extracts permissions, and identifies user groups (`Buyer` vs `Seller`).<br>- Refreshes active sessions (`refreshSession`) via authentication tokens.<br>- Handles password retrieval routines (`forgotPassword`, `confirmForgotPassword`). |
| **`dynamoService.ts`** | Low-level Database Wrapper | - Wraps AWS DynamoDB client calls for standard CRUD utilities (`getItem`, `putItem`, `deleteItem`).<br>- Generates dynamic update expressions (`updateItem`) to safely update arbitrary attributes along with `updatedAt` timestamps.<br>- Runs indexed query parameters (`queryItems`) and scans (`scanItems`). |
| **`emailService.ts`** | AWS SES Email Wrapper | - Sends welcoming messages (`sendWelcomeEmail`).<br>- Sends outbid warning notices (`sendOutbidEmail`) formatted in Indian Rupees currency.<br>- Confirms auction success templates (`sendAuctionWinnerEmail`).<br>- Generates membership warnings (`sendMembershipExpiryEmail`). |
| **`locationService.ts`** | AWS Location Service wrapper | - Geocodes typed text addresses (`geocodeAddress`) returning bounding parameters and coordinates.<br>- Computes reverse-geocodes (`reverseGeocode`) to read physical addresses from coordinates.<br>- Searches nearby amenities and points of interest (`searchNearbyPlaces`) biased around a location. |
| **`notificationService.ts`**| Realtime Alerts service | - Saves instant in-app alerts (`createNotification`) containing metadata configurations with a 30-day DynamoDB TTL.<br>- Fetches users' pending alerts list (`getUserNotifications`). |
| **`s3Service.ts`** | File Storage Controller | - Generates secure S3 presigned URLs (`getMediaUploadUrl`, `getDocumentUploadUrl`) allowing the frontend to upload media files directly to private buckets.<br>- Obtains read-only S3 presigned URLs (`getDocumentReadUrl`) for document display under authorization checks. |

---

### 💻 Frontend Services

All frontend services connect to the backend server API via a shared Axios client.

| Service File | Purpose | Implemented Functionality |
| :--- | :--- | :--- |
| **`api.ts`** | Interceptor HTTP Client | - Instantiates a customized Axios client with baseURL configuration.<br>- Appends active JWT ID tokens to the HTTP Authorization headers using request interceptors.<br>- Integrates response interceptors to catch `401 Unauthorized` errors globally, trying to renew the session silently with the Cognito refresh token. Logs out the user if the refresh token expires. |
| **`auctionService.ts`** | Bidding Interface | - Integrates endpoints to list all active auctions (`getAuctions`), fetch auction details (`getAuction`), place bids (`placeBid`), view history logs (`getBidHistory`), and configure auto-bids (`setAutoBid`). |
| **`authService.ts`** | Authentication Client | - Manages logins (`login`), registrations (`register`), email validations (`verifyEmail`), SMS/OTP exchanges (`requestOtp`, `verifyOtp`), session renewals (`refreshToken`), and logout commands (`logout`). |
| **`chatService.ts`** | Realtime Messaging API | - Resolves routes to query rooms (`getRooms`), messages list (`getMessages`), dispatch chat text (`sendMessage`), and check indicators (`markRead`). |
| **`membershipService.ts`**| Membership Plans Client | - Lists and filters active membership plans (`getPlans`) according to user group, and processes purchases (`createSubscription`). |
| **`propertyService.ts`** | Properties & S3 Assets | - Lists properties with advanced filters (`getProperties`), gets details (`getProperty`), posts new houses (`createProperty`), logs interests (`expressInterest`), updates list parameters (`updateProperty`), favorites cards (`saveFavorite`), and requests upload presigned URLs (`getUploadUrl`). |
| **`userService.ts`** | Profile & Document Actions | - Updates client records (`getProfile`, `updateProfile`), pulls personal notifications (`getNotifications`), and obtains presigned links for identity files (`getDocumentUploadUrl`). |

---

## ⚡ Real-Time Socket.io Implementation

Real-time coordination is divided into logical handlers to maintain code readability:

1. **`server.ts`**: Mounts the socket server, validates client handshake tokens (`socketAuth.ts`), and maps incoming connections.
2. **`auctionHandler.ts`**: Joins clients to specific auction room channels (`auction_id`) to listen to live bid increments and anti-sniping time updates.
3. **`chatHandler.ts`**: Handles room joins and coordinates immediate chat deliveries across connected buyers and sellers.
4. **`notificationHandler.ts`**: Pushes operational alerts (like outbids, verifications, and approvals) to online users.
