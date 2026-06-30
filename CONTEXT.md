# Food-Hunt — Project Context

> **Find Food. Find Friends.**
> Campus food discovery and social dining platform built for LPU (Lovely Professional University) students.

---

## Project Overview

Food-Hunt is a full-stack web application (with Android hybrid support via Capacitor) that helps university students discover campus food vendors, share meals through a splitting system, chat in real-time, and get AI-powered food recommendations. The platform is production-ready and deployed on Cloudflare Pages at `https://food-hunt.app`.

**Current Status:** Production Ready (all 4 code review phases complete — see [CODE_REVIEW_STATUS.md](file:///c:/Important/Code/Food-hunt-master/CODE_REVIEW_STATUS.md))

---

## Tech Stack

| Layer                  | Technology                          | Purpose                                  |
| ---------------------- | ----------------------------------- | ---------------------------------------- |
| **Frontend**           | React 19 + TypeScript               | UI framework with hooks                  |
| **Build Tool**         | Vite 6                               | Fast HMR dev server + production builds  |
| **Routing**            | React Router DOM 7                   | Client-side SPA routing                  |
| **State/Cache**        | TanStack Query v5                    | Server-state caching + offline-first     |
| **Animations**         | Framer Motion 12                     | Page transitions + micro-animations      |
| **Backend (BaaS)**     | Supabase (PostgreSQL + Auth + Realtime + Storage) | Primary database, auth, realtime subscriptions, file storage |
| **AI/ML**              | Google Gemini API (`@google/generative-ai` + `@google/genai`) | AI chatbot + Menu OCR scanning           |
| **Push Notifications** | Firebase Cloud Messaging + Firebase Admin | Real-time push notifications             |
| **Image Handling**     | Canvas API + Supabase Storage        | Client-side compression + upload         |
| **Icons**              | Lucide React                         | Icon library                             |
| **Toasts**             | react-hot-toast                      | User feedback notifications              |
| **Mobile**             | Capacitor 8 (Android)                | Hybrid Android app wrapper               |
| **PWA**                | vite-plugin-pwa                      | Service worker, manifest, offline support|
| **Deployment**         | Cloudflare Pages + Wrangler          | Static hosting + serverless functions    |
| **Testing**            | Vitest                               | Unit testing framework                   |
| **Styling**            | Tailwind CSS (CDN) + Custom CSS      | Utility-first styling + design system    |

---

## Project Structure

```
Food-Hunt/
├── api/                        # Local dev serverless API handlers
│   ├── aadhaar-mock-engine.js  # Aadhaar verification mock engine
│   ├── aadhaar-send-otp.js     # Aadhaar OTP sender
│   ├── aadhaar-verify-otp.js   # Aadhaar OTP verifier
│   ├── chat.js                 # AI chatbot endpoint (Gemini)
│   ├── scan-menu.js            # Menu image OCR (Gemini Vision)
│   └── send-push.js            # Push notification sender (FCM)
│
├── functions/                  # Cloudflare Pages Functions (production)
│   ├── _routes.json            # CF Pages routing config
│   └── api/
│       ├── chat.js             # Production chatbot endpoint
│       ├── scan-menu.js        # Production menu OCR endpoint
│       └── send-push.js        # Production push notification endpoint
│
├── components/                 # React components
│   ├── AadhaarVerification.tsx # Aadhaar identity verification flow
│   ├── Chatbot.tsx             # AI FoodieBot widget
│   ├── ConfirmationModal.tsx   # Generic confirmation dialog
│   ├── CookieBanner.tsx        # GDPR cookie consent banner
│   ├── LocationSelector.tsx    # Campus location picker
│   ├── MegaFooter.tsx          # Rich footer (home page only)
│   ├── Navbar.tsx              # Top navigation bar
│   ├── OfflineBanner.tsx       # Offline status indicator
│   ├── PageTransition.tsx      # Framer-motion page wrapper
│   ├── ScrollToTop.tsx         # Route-change scroll reset
│   └── ui/                     # Reusable UI component library
│       ├── Button.tsx          # Styled button variants
│       ├── Card.tsx            # Card container
│       ├── ConfirmationModal.tsx # Advanced confirmation modal
│       ├── ImageUpload.tsx     # Drag-and-drop image upload + compression
│       ├── Input.tsx           # Form input with validation
│       ├── LoadingSpinner.tsx  # Loading indicator
│       ├── Select.tsx          # Custom select dropdown
│       └── index.ts            # Barrel export
│
├── contexts/                   # React context providers
│   ├── AuthContext.tsx         # Auth state, login/signup/OAuth, UID generation
│   ├── LocationContext.tsx     # User location state + campus locations
│   └── ThemeContext.tsx        # Dark/light/system theme toggle
│
├── hooks/                      # Custom React hooks
│   ├── queryClient.ts         # TanStack Query client configuration
│   ├── useAdmin.ts            # Admin role check hook
│   ├── usePageMeta.ts         # Dynamic page title/meta management
│   ├── useProfile.ts          # User profile query + mutation hooks
│   ├── usePushNotifications.ts # FCM token registration + notification handling
│   ├── useSplits.ts           # Meal splits query + mutation hooks
│   ├── useUserLocation.ts    # Geolocation + address management hook
│   ├── useVendorRealtime.ts   # Supabase realtime vendor subscriptions
│   └── useVendors.ts          # Vendor list/detail query hooks
│
├── pages/                      # Page-level components (22 pages)
│   ├── AboutUs.tsx             # Developer info + social links
│   ├── AdminDashboard.tsx      # Admin statistics overview
│   ├── AdminUsers.tsx          # User management (roles, disable, sort)
│   ├── AdminVendors.tsx        # Vendor CRUD + menu management + AI scan
│   ├── Careers.tsx             # Careers placeholder page
│   ├── CompleteProfile.tsx     # Post-OAuth profile completion
│   ├── FAQ.tsx                 # Frequently asked questions
│   ├── Features.tsx            # Platform features showcase
│   ├── HelpCenter.tsx          # Direct admin chat support
│   ├── Home.tsx                # Landing page
│   ├── Inbox.tsx               # Real-time chat system
│   ├── Login.tsx               # Email/password + Google OAuth login
│   ├── MealSplits.tsx          # Meal splitting feed + creation
│   ├── OurTeam.tsx             # Team placeholder page
│   ├── PrivacyPolicy.tsx       # Full privacy policy
│   ├── Profile.tsx             # User profile + activity stats
│   ├── Register.tsx            # Registration with validation
│   ├── ResetPassword.tsx       # Password reset flow
│   ├── TermsAndConditions.tsx  # Terms of service
│   ├── VendorDashboard.tsx     # Vendor-role dashboard
│   ├── VendorDetail.tsx        # Vendor page + menu + reviews
│   └── VendorList.tsx          # Browse/filter/sort vendors
│
├── services/                   # Backend service layer
│   ├── firebase.ts             # Firebase app/auth/messaging init
│   ├── geminiService.ts        # Gemini AI client wrapper
│   ├── mockDatabase.ts         # Central API layer (64KB, 1400+ lines)
│   ├── seeder.ts               # Database seed data
│   └── supabase.ts             # Supabase client initialization
│
├── utils/                      # Utility modules
│   ├── compressImage.ts        # Canvas API image compression (JPEG)
│   ├── location.ts             # Geolocation + distance calculations
│   ├── sanitize.ts             # Input validation & sanitization
│   ├── uploadImage.ts          # Supabase Storage upload helper
│   └── vendorStatus.ts         # Vendor traffic/status utilities
│
├── tests/                      # Test files
│   └── split_limit.test.ts     # Meal split rate-limit tests
│
├── migrations/                 # SQL migration files (9 migrations)
│   ├── 001_phase1_security_fixes.sql
│   ├── 002_phase2_scalability.sql
│   ├── 002a_create_split_participants.sql
│   ├── 002b_migrate_participants_data.sql
│   ├── 002c_drop_array_column.sql
│   ├── 002d_uuid_migration.sql
│   ├── 003_add_maps_url.sql
│   ├── 004_vendor_status.sql
│   └── 005_location_support.sql
│
├── android/                    # Capacitor Android project
├── dataconnect/                # Firebase Data Connect config
├── public/                     # Static assets (icons, CSS, SW, SEO files)
│
├── App.tsx                     # Main router + provider tree
├── index.tsx                   # React DOM entry point
├── index.html                  # HTML shell (SEO, preloader, structured data)
├── types.ts                    # TypeScript interfaces & enums
├── capacitor.config.ts         # Capacitor Android config
├── vite.config.ts              # Vite build + PWA + API middleware config
├── firebase.json               # Firebase hosting/firestore config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore index definitions
├── supabase_schema.sql         # Original database schema (v1)
├── supabase_schema_v2.sql      # Consolidated schema (v2, current)
├── wrangler.toml               # Cloudflare Wrangler config
├── metadata.json               # App metadata (geolocation permissions)
├── tsconfig.json               # TypeScript compiler configuration
└── package.json                # Dependencies & scripts
```

---

## Environment Variables

The project requires the following environment variables (defined in `.env`):

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (client-side) |
| `VITE_SUPABASE_KEY` | Supabase anon/public key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini API key (server-side API routes) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_VAPID_KEY` | FCM VAPID key for web push |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin SDK service account (JSON) |

> **Note:** `VITE_` prefixed variables are exposed to the client bundle. Non-prefixed variables are server-side only (API routes).

---

## Development Commands

```bash
npm run dev        # Start Vite dev server (port 3000)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run deploy     # Build + deploy to Cloudflare Pages via Wrangler
```

### Android (Capacitor)

```bash
npx cap sync android   # Sync web assets to Android project
npx cap open android   # Open in Android Studio
npx cap run android    # Build and run on device/emulator
```

---

## Key Architectural Decisions

### 1. Flat Source Layout (No `src/` Directory)
All source files live in the project root. The `@` alias maps to the project root via `tsconfig.json` paths and `vite.config.ts` resolve alias.

### 2. Dual API Layer (Dev vs Production)
- **Development**: Vite custom middleware plugin proxies `/api/*` routes to handlers in `api/` directory, shimming Express-like `req.body`, `res.status()`, `res.json()`.
- **Production**: Cloudflare Pages Functions in `functions/api/` handle the same routes natively.

### 3. Supabase as Primary Backend
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Auth**: Email/password + Google OAuth (via Supabase Auth, not Firebase Auth for persistence)
- **Realtime**: Supabase Realtime subscriptions for chat, vendor updates
- **Storage**: Image uploads (vendor logos, menu photos, profile pictures)

### 4. Firebase for Notifications Only
Firebase is used solely for Cloud Messaging (push notifications). Auth and Firestore rules exist as legacy config but the app uses Supabase for all data operations.

### 5. Offline-First with TanStack Query
- `networkMode: 'offlineFirst'` serves cached data when offline
- 5-minute stale time, 30-minute garbage collection
- `OfflineBanner` component shows connectivity status
- Shared vendor cache across 5+ components eliminates redundant API calls

### 6. Central API Service (`mockDatabase.ts`)
Despite its name, this is the **real** production API layer — a 64KB module containing all Supabase queries organized by domain:
- `api.users.*`, `api.vendors.*`, `api.splits.*`, `api.messages.*`, `api.admin.*`
- All methods return `GenericResponse<T>` with `{success, message, data?}`
- Includes input sanitization, cascading updates, and business logic enforcement

### 7. Provider Hierarchy
```
React.StrictMode
  └── QueryClientProvider (TanStack Query)
        └── ThemeProvider (dark/light/system)
              └── AuthProvider (Supabase Auth + user state)
                    └── BrowserRouter
                          └── LocationProvider (geolocation)
                                └── ScrollToTop + AppContent
```

---

## User Roles

| Role | Access |
| --- | --- |
| `student` | Default. Browse vendors, create/join splits, chat, review |
| `admin` | Full platform access. Manage vendors, users, view stats |
| `vendor` | Vendor dashboard access (WIP) |

---

## Database Schema Version

The current production schema is **v2** ([supabase_schema_v2.sql](file:///c:/Important/Code/Food-hunt-master/supabase_schema_v2.sql)):
- `users.id` is UUID (migrated from text)
- `split_participants` join table (replaced `people_joined_ids` array)
- Full RLS policies with `DROP POLICY IF EXISTS` for idempotent deployment
- 9 migration files in `migrations/` directory track schema evolution

---

## Deployment Architecture

```
                    ┌─────────────────────────┐
                    │   Cloudflare Pages       │
                    │  (food-hunt.app)         │
                    ├─────────────────────────┤
                    │  Static: dist/           │
                    │  Functions: functions/api/│
                    └──────────┬──────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
     │   Supabase     │ │ Google Gemini│ │   Firebase   │
     │ (PostgreSQL +  │ │  (AI/Vision) │ │   (FCM)      │
     │  Auth + RT +   │ │              │ │              │
     │  Storage)      │ │              │ │              │
     └───────────────┘ └──────────────┘ └──────────────┘
```

---

## Code Review Phases (All Complete)

| Phase | Area | Key Changes |
| --- | --- | --- |
| 1 | Security | RLS policies, `public_profiles` view, `is_admin()` function |
| 2 | Scalability | `split_participants` table, UUID migration, API refactor |
| 3 | Performance | Static gradient mesh (replaces blur), framer-motion transitions |
| 4 | Offline | TanStack Query, offline-first mode, OfflineBanner, query/mutation hooks |

---

## Contact

- **Email**: foodhunt101lpu@gmail.com
- **Domain**: https://food-hunt.app
- **App ID** (Android): `com.foodhunt.app`
