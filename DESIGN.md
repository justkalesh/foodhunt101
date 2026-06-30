# Food-Hunt — Design Document

> **Find Food. Find Friends.**
> Design system, UI architecture, and visual language for the Food-Hunt campus dining platform.

---

## 1. Design Philosophy

Food-Hunt follows a **modern campus aesthetic** — clean, vibrant, and mobile-first. The design prioritizes:

- **Glassmorphism**: Frosted-glass cards and overlays for depth
- **Micro-animations**: Staggered fade-ins, shimmer loaders, smooth page transitions
- **Premium feel**: Curated color palette, Google Fonts typography, gradient mesh backgrounds
- **Accessibility**: Dark/light/system theme support, high-contrast text, responsive layouts

---

## 2. Color System

### Brand Colors

| Token | Light Mode | Dark Mode | Usage |
| --- | --- | --- | --- |
| **Primary (Orange)** | `#f97316` | `#f97316` | CTAs, links, brand accents |
| **Accent (Sky Blue)** | `#0ea5e9` | `#0ea5e9` | Secondary actions, info states |
| **Lime** | `rgba(163, 230, 53)` | `rgba(163, 230, 53)` | Background mesh gradient |

### Semantic Colors

| State | Color | Usage |
| --- | --- | --- |
| Success | Green | Review submitted, split joined |
| Warning | Amber/Yellow | Rate limits, expiring splits |
| Error | Red | Form validation, failed actions |
| Info | Blue | Tooltips, help text |

### Theme Colors (Tailwind Extended)

```javascript
// Configured via Tailwind CDN in index.html
colors: {
  primary:  { DEFAULT: '#f97316', light: '#fdba74', dark: '#c2410c' },
  accent:   { DEFAULT: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8' },
  surface:  {
    light:  '#ffffff',
    dark:   '#0f172a',      // slate-900
    muted:  '#f1f5f9',      // slate-100
    'muted-dark': '#1e293b' // slate-800
  }
}
```

### Background Mesh Gradient

The app uses a static GPU-friendly radial gradient mesh (replaces earlier blur-heavy blobs for performance):

```css
background:
  radial-gradient(ellipse 80% 50% at 20% 10%, rgba(249, 115, 22, 0.12), transparent 50%),
  radial-gradient(ellipse 60% 40% at 85% 20%, rgba(14, 165, 233, 0.08), transparent 50%),
  radial-gradient(ellipse 50% 50% at 10% 60%, rgba(163, 230, 53, 0.08), transparent 50%),
  radial-gradient(ellipse 70% 40% at 80% 80%, rgba(249, 115, 22, 0.08), transparent 50%);
```

---

## 3. Typography

- **Font Family**: System defaults via Tailwind (`ui-sans-serif, system-ui, -apple-system, ...`)
- **Heading Scale**: Tailwind utilities (`text-2xl`, `text-3xl`, `text-4xl`)
- **Body Text**: `text-base` (16px) for readability
- **Dark Mode Text**: `text-gray-100` on `bg-slate-950`
- **Light Mode Text**: `text-gray-900` on `bg-gray-50`

---

## 4. Theme System

Managed by [ThemeContext.tsx](file:///c:/Important/Code/Food-hunt-master/contexts/ThemeContext.tsx):

| Mode | Behavior |
| --- | --- |
| **Light** | Clean white/gray surfaces, orange accents |
| **Dark** | Slate-950 base, glassmorphic cards with opacity |
| **System** | Follows OS `prefers-color-scheme` media query |

Implementation: Tailwind `darkMode: 'class'` — toggles `.dark` class on `<html>`.

### Theme Transitions

All theme-related properties transition smoothly (200ms ease-out):
```css
transition-property: background-color, border-color, color, fill, stroke, box-shadow;
```

---

## 5. Animation System

### CSS Keyframes (defined in [index.css](file:///c:/Important/Code/Food-hunt-master/public/index.css))

| Animation | Effect | Usage |
| --- | --- | --- |
| `staggerFadeIn` | Translate Y (24px) + opacity | Card entry animations |
| `shimmer` | Horizontal gradient sweep | Skeleton loading states |
| `progressFill` | Stroke-dashoffset animation | Circular progress indicators |

### Page Transitions (Framer Motion)

[PageTransition.tsx](file:///c:/Important/Code/Food-hunt-master/components/PageTransition.tsx) wraps every route:
- **Enter**: Fade in + slide up
- **Exit**: Fade out
- **Mode**: `AnimatePresence mode="wait"` — waits for exit before enter

### Interaction Animations

- **Hover effects**: Scale transforms, color shifts on cards and buttons
- **Loading states**: Shimmer skeletons, spinning loaders
- **Toast notifications**: Slide-in via `react-hot-toast`
- **Cookie banner**: Slide-up entry animation

---

## 6. Component Design System

### 6.1 UI Component Library (`components/ui/`)

All reusable primitives are in the [ui/](file:///c:/Important/Code/Food-hunt-master/components/ui) directory with a barrel export:

| Component | Description | Key Props |
| --- | --- | --- |
| [Button](file:///c:/Important/Code/Food-hunt-master/components/ui/Button.tsx) | Multi-variant button | `variant`, `size`, `isLoading`, `disabled` |
| [Card](file:///c:/Important/Code/Food-hunt-master/components/ui/Card.tsx) | Container with glassmorphism | `className`, `onClick`, hover effects |
| [Input](file:///c:/Important/Code/Food-hunt-master/components/ui/Input.tsx) | Form input with icon support | `label`, `error`, `icon`, validation |
| [Select](file:///c:/Important/Code/Food-hunt-master/components/ui/Select.tsx) | Custom dropdown select | `options`, `value`, `onChange` |
| [ImageUpload](file:///c:/Important/Code/Food-hunt-master/components/ui/ImageUpload.tsx) | Drag-and-drop with preview | `onImageSelect`, compression, progress |
| [ConfirmationModal](file:///c:/Important/Code/Food-hunt-master/components/ui/ConfirmationModal.tsx) | Action confirmation dialog | `title`, `message`, `onConfirm`, `onCancel` |
| [LoadingSpinner](file:///c:/Important/Code/Food-hunt-master/components/ui/LoadingSpinner.tsx) | Animated loading indicator | `size`, `className` |

### 6.2 Layout Components

| Component | Scope | Behavior |
| --- | --- | --- |
| [Navbar](file:///c:/Important/Code/Food-hunt-master/components/Navbar.tsx) | Global | Fixed top, responsive, theme toggle, auth-aware nav |
| [MegaFooter](file:///c:/Important/Code/Food-hunt-master/components/MegaFooter.tsx) | Home only | Rich footer with navigation links, social, branding |
| [OfflineBanner](file:///c:/Important/Code/Food-hunt-master/components/OfflineBanner.tsx) | Global | Top banner shown when network is unavailable |
| [ScrollToTop](file:///c:/Important/Code/Food-hunt-master/components/ScrollToTop.tsx) | Global | Resets scroll position on route change |
| [CookieBanner](file:///c:/Important/Code/Food-hunt-master/components/CookieBanner.tsx) | Global | GDPR cookie consent with dismiss |

### 6.3 Feature Components

| Component | Purpose |
| --- | --- |
| [Chatbot](file:///c:/Important/Code/Food-hunt-master/components/Chatbot.tsx) | Floating AI assistant widget (FoodieBot) |
| [AadhaarVerification](file:///c:/Important/Code/Food-hunt-master/components/AadhaarVerification.tsx) | Identity verification flow with OTP |
| [LocationSelector](file:///c:/Important/Code/Food-hunt-master/components/LocationSelector.tsx) | Campus location picker with map integration |

---

## 7. Page Layout Architecture

### Provider Tree (Render Order)

```
ThemeProvider
  └── AuthProvider
        └── BrowserRouter
              └── LocationProvider
                    └── ScrollToTop
                    └── AppContent
                          ├── OfflineBanner (always)
                          ├── Navbar (always)
                          ├── AnimatePresence
                          │     └── PageTransition > [Route Component]
                          ├── Chatbot (hidden on /inbox, /complete-profile)
                          ├── MegaFooter (home page only)
                          └── CookieBanner (always)
```

### Page Inventory (22 Routes)

#### Public Pages
| Route | Page | Description |
| --- | --- | --- |
| `/` | [Home](file:///c:/Important/Code/Food-hunt-master/pages/Home.tsx) | Landing page with hero, features, vendor highlights |
| `/login` | [Login](file:///c:/Important/Code/Food-hunt-master/pages/Login.tsx) | Email/password + Google OAuth login |
| `/register` | [Register](file:///c:/Important/Code/Food-hunt-master/pages/Register.tsx) | Registration with validation |
| `/reset-password` | [ResetPassword](file:///c:/Important/Code/Food-hunt-master/pages/ResetPassword.tsx) | Password recovery flow |
| `/terms` | [TermsAndConditions](file:///c:/Important/Code/Food-hunt-master/pages/TermsAndConditions.tsx) | Terms of service |
| `/privacy` | [PrivacyPolicy](file:///c:/Important/Code/Food-hunt-master/pages/PrivacyPolicy.tsx) | Full privacy policy |
| `/about` | [AboutUs](file:///c:/Important/Code/Food-hunt-master/pages/AboutUs.tsx) | Developer info + social links |
| `/team` | [OurTeam](file:///c:/Important/Code/Food-hunt-master/pages/OurTeam.tsx) | Team placeholder |
| `/careers` | [Careers](file:///c:/Important/Code/Food-hunt-master/pages/Careers.tsx) | Careers placeholder |
| `/faq` | [FAQ](file:///c:/Important/Code/Food-hunt-master/pages/FAQ.tsx) | Frequently asked questions |
| `/features` | [Features](file:///c:/Important/Code/Food-hunt-master/pages/Features.tsx) | Platform features showcase |

#### Authenticated Pages
| Route | Page | Description |
| --- | --- | --- |
| `/complete-profile` | [CompleteProfile](file:///c:/Important/Code/Food-hunt-master/pages/CompleteProfile.tsx) | Post-OAuth profile setup |
| `/vendors` | [VendorList](file:///c:/Important/Code/Food-hunt-master/pages/VendorList.tsx) | Browse/filter/sort vendors |
| `/vendors/:id` | [VendorDetail](file:///c:/Important/Code/Food-hunt-master/pages/VendorDetail.tsx) | Vendor page + menu + reviews |
| `/splits` | [MealSplits](file:///c:/Important/Code/Food-hunt-master/pages/MealSplits.tsx) | Meal splitting feed + creation |
| `/profile` | [Profile](file:///c:/Important/Code/Food-hunt-master/pages/Profile.tsx) | Own profile + activity |
| `/profile/:userId` | [Profile](file:///c:/Important/Code/Food-hunt-master/pages/Profile.tsx) | View other user's profile |
| `/inbox` | [Inbox](file:///c:/Important/Code/Food-hunt-master/pages/Inbox.tsx) | Real-time chat system |
| `/help` | [HelpCenter](file:///c:/Important/Code/Food-hunt-master/pages/HelpCenter.tsx) | Admin chat support |

#### Admin Pages
| Route | Page | Description |
| --- | --- | --- |
| `/admin` | [AdminDashboard](file:///c:/Important/Code/Food-hunt-master/pages/AdminDashboard.tsx) | Platform statistics |
| `/admin/vendors` | [AdminVendors](file:///c:/Important/Code/Food-hunt-master/pages/AdminVendors.tsx) | Vendor CRUD + menu + AI scan |
| `/admin/users` | [AdminUsers](file:///c:/Important/Code/Food-hunt-master/pages/AdminUsers.tsx) | User management |

---

## 8. Data Flow Architecture

### 8.1 State Management Strategy

```
┌───────────────────────────────────────────────────┐
│                  React Component                   │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ useAuth()   │  │ useVendors() │  │ useState() │ │
│  │ (Context)   │  │ (TanStack)   │  │ (Local)    │ │
│  └──────┬──────┘  └──────┬───────┘  └───────────┘ │
│         │                │                          │
└─────────┼────────────────┼──────────────────────────┘
          │                │
          ▼                ▼
  ┌───────────────┐ ┌──────────────┐
  │ AuthContext    │ │ QueryClient  │
  │ (user, auth)  │ │ (cache, SW)  │
  └───────┬───────┘ └──────┬───────┘
          │                │
          ▼                ▼
  ┌────────────────────────────────┐
  │     mockDatabase.ts (api.*)     │
  │  GenericResponse<T> pattern     │
  └───────────────┬────────────────┘
                  │
                  ▼
  ┌────────────────────────────────┐
  │     Supabase Client            │
  │  (PostgreSQL + RLS + Realtime) │
  └────────────────────────────────┘
```

### 8.2 Server State (TanStack Query)

| Category | Query Hooks | Mutation Hooks |
| --- | --- | --- |
| **Vendors** | `useVendors()`, `useVendor(id)`, `useVendorReviews(id)`, `useMenuItems(id)` | `useAddReview()` |
| **Splits** | `useSplits()`, `useMyRequests()` | `useCreateSplit()`, `useRequestJoin()` |
| **Profile** | `useProfile()`, `useActivity()` | `useUpdateProfile()` |
| **Admin** | `useAdminStats()` | — |

**Query Client Configuration** ([queryClient.ts](file:///c:/Important/Code/Food-hunt-master/hooks/queryClient.ts)):
- Stale time: 5 minutes
- Cache lifetime (GC): 30 minutes
- Retry: 1 attempt
- Network mode: `offlineFirst`
- Refetch on window focus: enabled

### 8.3 Context State

| Context | State | Scope |
| --- | --- | --- |
| [AuthContext](file:///c:/Important/Code/Food-hunt-master/contexts/AuthContext.tsx) | `user`, `isAuthenticated`, `isLoading`, `needsCompletion` | Global |
| [ThemeContext](file:///c:/Important/Code/Food-hunt-master/contexts/ThemeContext.tsx) | `theme` (light/dark/system) | Global |
| [LocationContext](file:///c:/Important/Code/Food-hunt-master/contexts/LocationContext.tsx) | `selectedLocation`, campus locations | Global |

---

## 9. Core Feature UI Designs

### 9.1 Vendor Discovery ([VendorList](file:///c:/Important/Code/Food-hunt-master/pages/VendorList.tsx))

- **Filter Bar**: Origin tags (North/South/West/Chinese/Indo-Chinese), rush level indicators
- **Sort Options**: Rating, price, popularity
- **Vendor Cards**: Logo, name, cuisine tag, rating stars, price range, rush level badge
- **Search**: Real-time text search across vendor names

### 9.2 Vendor Detail ([VendorDetail](file:///c:/Important/Code/Food-hunt-master/pages/VendorDetail.tsx))

- **Hero Section**: Vendor logo, name, location, cuisine, contact
- **Dynamic Menu**: Category sections, size variants (S/M/L/XL pricing), recommended badge
- **Menu Images**: Carousel of uploaded menu photos
- **Reviews Section**: Star rating input (1-5), text review, existing reviews list
- **Map Link**: Google Maps integration via `maps_url`

### 9.3 Meal Splits ([MealSplits](file:///c:/Important/Code/Food-hunt-master/pages/MealSplits.tsx))

- **Split Feed**: Active splits with vendor, dish, price/person, time, participants
- **Create Form**: Vendor selector, dish name, total price, people needed, time picker
- **Join Flow**: Request → automated message → creator accepts/declines → chat created
- **Business Rules UI**: Rate-limit warnings, time conflict alerts, expiry labels

### 9.4 Inbox/Chat ([Inbox](file:///c:/Important/Code/Food-hunt-master/pages/Inbox.tsx))

- **Conversation List**: Avatars, last message preview, unread badges, timestamps
- **Chat View**: Message bubbles (sent/received), inline Accept/Reject for split requests
- **User Search**: Search by 6-digit UID
- **Vendor Mention**: `@` autocomplete for vendor names in messages
- **Realtime**: Supabase Realtime subscriptions for live updates

### 9.5 AI Chatbot ([Chatbot](file:///c:/Important/Code/Food-hunt-master/components/Chatbot.tsx))

- **Floating Widget**: Bottom-right FAB with chat icon
- **Chat Interface**: Expandable panel with message history
- **Context-Aware**: Sends vendor data, menus, reviews, active splits to Gemini
- **Smart Responses**: Vendor recommendations with clickable links

### 9.6 Admin Panel

Three dedicated admin pages:

| Page | Key UI Elements |
| --- | --- |
| [AdminDashboard](file:///c:/Important/Code/Food-hunt-master/pages/AdminDashboard.tsx) | Stat cards (users, vendors, reviews), sync ratings button |
| [AdminVendors](file:///c:/Important/Code/Food-hunt-master/pages/AdminVendors.tsx) | Vendor form (add/edit), drag-drop image upload, menu editor, AI scan button |
| [AdminUsers](file:///c:/Important/Code/Food-hunt-master/pages/AdminUsers.tsx) | User table, role dropdown, disable toggle, multi-column sort |

---

## 10. Image Handling Pipeline

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ User selects  │───▶│ compressImage() │───▶│  uploadImage()   │
│ file / drops  │    │ Canvas API      │    │  Supabase Storage│
│ into dropzone │    │ → JPEG resize   │    │  → public URL    │
└──────────────┘    └─────────────────┘    └──────────────────┘
```

- [compressImage.ts](file:///c:/Important/Code/Food-hunt-master/utils/compressImage.ts): Canvas API resize + JPEG conversion
- [uploadImage.ts](file:///c:/Important/Code/Food-hunt-master/utils/uploadImage.ts): Supabase Storage upload with unique filenames + old image cleanup
- [ImageUpload.tsx](file:///c:/Important/Code/Food-hunt-master/components/ui/ImageUpload.tsx): Drag-and-drop zone with preview, progress bar, file type validation

---

## 11. Input Validation & Sanitization

All user inputs are sanitized via [sanitize.ts](file:///c:/Important/Code/Food-hunt-master/utils/sanitize.ts) before database operations:

| Function | Max Length | Applied To |
| --- | --- | --- |
| `sanitizeReviewText()` | 500 chars | Review submissions |
| `sanitizeMessageContent()` | 1000 chars | Chat messages |
| `sanitizeDishName()` | — | Menu item names |
| `sanitizeName()` | 100 chars | User/vendor names |
| `sanitizeString()` | — | Generic text inputs |

---

## 12. PWA & Mobile Design

### Progressive Web App

- **Service Worker**: Auto-update via `vite-plugin-pwa` with `skipWaiting` + `clientsClaim`
- **Manifest**: Standalone display, orange theme (`#f97316`), app icons (192px, 512px)
- **Caching**: Google Fonts cached (CacheFirst, 1-year TTL), Firebase messaging scripts imported
- **Preloader**: HTML-based preloader with fade-out transition when React hydrates

### Android (Capacitor)

- **App ID**: `com.foodhunt.app`
- **Scheme**: HTTPS (via `androidScheme: 'https'`)
- **Mixed Content**: Allowed for development
- **Debug**: `webContentsDebuggingEnabled: true`
- **Build**: Set `CAPACITOR_BUILD=true` env to use relative paths (`base: ''`)

---

## 13. SEO Implementation

Implemented in [index.html](file:///c:/Important/Code/Food-hunt-master/index.html):

- **Meta Tags**: Title, description, theme-color, viewport, Open Graph, Twitter Card
- **Structured Data (JSON-LD)**: WebSite schema (with SearchAction), Organization schema
- **SEO Files**: `robots.txt`, `sitemap.xml` in `public/`
- **Dynamic Titles**: [usePageMeta](file:///c:/Important/Code/Food-hunt-master/hooks/usePageMeta.ts) hook updates `<title>` per route
- **SPA Routing**: `_redirects` file for Cloudflare Pages, Firebase hosting rewrites

---

## 14. Responsive Breakpoints

Following Tailwind CSS default breakpoints:

| Breakpoint | Min Width | Target |
| --- | --- | --- |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

**Mobile-first approach**: Base styles target mobile, breakpoints add desktop enhancements.

---

## 15. Security Design

### Row-Level Security (Supabase RLS)

| Table | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `users` | Public | Own ID | Own ID | — |
| `vendors` | Public | Admin | Admin | Admin |
| `reviews` | Public | Authenticated | Own | Own + Admin |
| `menu_items` | Public | Admin | Admin | Admin |
| `meal_splits` | Authenticated | Authenticated | Authenticated | Creator |
| `conversations` | Participant | Authenticated | Participant | — |
| `messages` | Sender/Receiver | Sender | — | — |
| `split_join_requests` | Requester/Creator | Requester | Creator | Requester |
| `split_participants` | Authenticated | Authenticated | — | Own |

### Firestore Rules (Legacy)

Parallel Firestore rules in [firestore.rules](file:///c:/Important/Code/Food-hunt-master/firestore.rules) with helper functions:
- `isAuthenticated()`, `isOwner(userId)`, `isAdmin()` (role check from users doc)

### Client-Side Security

- Input sanitization on all user-submitted content
- `VITE_` prefix for client-safe env vars only
- Service role keys restricted to server-side API routes

---

## 16. Design Tokens Summary

```css
/* Core Brand */
--color-primary:        #f97316;  /* Orange-500 */
--color-primary-light:  #fdba74;  /* Orange-300 */
--color-primary-dark:   #c2410c;  /* Orange-700 */

/* Surfaces */
--surface-light:        #ffffff;
--surface-dark:         #0f172a;  /* Slate-950 */
--surface-muted:        #f1f5f9;  /* Slate-100 */
--surface-muted-dark:   #1e293b;  /* Slate-800 */

/* Text */
--text-light:           #111827;  /* Gray-900 */
--text-dark:            #f3f4f6;  /* Gray-100 */

/* Transitions */
--theme-transition:     200ms ease-out;

/* Animations */
--stagger-delay:        0.05s per item;
--page-transition:      framer-motion (fade + slide);
```

---

*Last updated: June 30, 2026*
