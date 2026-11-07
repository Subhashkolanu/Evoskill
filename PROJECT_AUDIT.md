# EvoSkill AI V2.0 — Comprehensive Project Audit Report

**Date:** November 7, 2026  
**Auditor:** Senior Full-Stack Engineer & SaaS Product Architect  
**Target Repository:** `D:\EXTRAS\Projects\EvoSkill-AI`  
**Git Branch:** `redesign/modern-saas` (Verified clean, tracking `origin/main`)  
**Deployment Target:** https://evoskill.ginnela.in  

---

## Executive Summary

EvoSkill AI was originally prototyped in Google AI Studio as an AI-powered career roadmap generator. While the core AI prompting and integration concepts (Gemini API, Google Workspace exports, Firebase Authentication, and Firestore) are present, the application currently suffers from significant architectural, stability, security, UX, and bundling issues:

1. **Development Server Broken:** `package.json` references `server.ts` which was renamed to `api/index.ts` during Vercel deployment refactoring, breaking local `npm run dev` and `npm start`.
2. **Auth Persistence Flaw:** The auth state listener in `src/lib/firebase.ts` forcefully kicks users out on browser refresh because it relies on an ephemeral in-memory OAuth token variable.
3. **Over-Scoped Google OAuth:** The application requests full read/write access to Google Drive, Calendar, Docs, Forms, Sheets, and Tasks at first login, triggering Google's unverified app security warning.
4. **Exposed Credentials:** A third-party fallback API key is hardcoded directly into the backend source code (`api/index.ts`).
5. **No Backend Authorization or Rate Limiting:** All API endpoints (`/api/generate-roadmap`, `/api/study-buddy`, etc.) are unprotected and publicly callable by anyone on the internet.
6. **Generic AI Aesthetics & Monolithic UX:** The UI currently relies on heavy cyan/blue gradient fills, dark glowing cards, and lacks the editorial SaaS aesthetic and modular multi-screen platform capabilities outlined in the V2.0 product vision.
7. **Bundle Bloat:** A single un-split JavaScript chunk of **1.52 MB (429 kB gzipped)** is generated on build.

---

## Detailed Investigation of Audit Items

### 1. Missing `server.ts` and Incorrect Development Scripts
- **Finding:** In commit `cf153dd91b849344848efff01501616c229119a9` ("Refactor server initialization and export app"), `server.ts` was moved and renamed to `api/index.ts` to accommodate Vercel serverless functions (`vercel.json`).
- **Impact:** `package.json` scripts (`"dev": "tsx server.ts"` and `"start": "node dist/server.cjs"`) fail immediately when run locally because `server.ts` does not exist at root.
- **Remediation:** 
  - Provide a clean root `server.ts` that boots Express, attaches the `api/index.ts` router, and runs Vite in middleware mode during development or serves `dist/` in production.
  - Update npm scripts so `npm run dev` and `npm run build` work seamlessly both locally and in serverless deployments.

### 2. Firebase Login Persistence After Page Refresh
- **Finding:** In `src/lib/firebase.ts` (lines 28–42), `initAuth` receives the restored Firebase Auth user from IndexedDB on page load. However, because `cachedAccessToken` was stored in a module-level variable (in memory only), `cachedAccessToken` is `null` after a refresh. Line 36 explicitly calls `if (onAuthFailure) onAuthFailure();` which causes `App.tsx` to set `user = null` and `needsAuth = true`.
- **Impact:** Any user refreshing the page is immediately logged out and sent back to the landing screen, discarding active UI state.
- **Remediation:**
  - Decouple Firebase User authentication from third-party Google Workspace OAuth access tokens.
  - When `onAuthStateChanged` emits a valid Firebase user, preserve the user session and allow full access to roadmaps, analytics, profile, and study buddy.
  - Store OAuth access tokens securely in `sessionStorage` or request incremental re-authorization only when an export action to Google Workspace is triggered.

### 3. Google OAuth Unverified-App Warning
- **Finding:** In `src/lib/firebase.ts` (lines 14–19), six high-privilege scopes (`tasks`, `calendar`, `documents`, `forms.body`, `drive`, `spreadsheets`) are added unconditionally to `GoogleAuthProvider` before the user even completes basic sign-in.
- **Impact:** Unverified Google Cloud OAuth client IDs requesting restricted Drive and Spreadsheet scopes trigger Google's alarming "Google hasn’t verified this app" warning screen, degrading user trust.
- **Remediation:**
  - Base authentication must only request standard OpenID scopes: `email`, `profile`, `openid`.
  - Implement incremental consent: only prompt for Google Tasks, Calendar, Docs, or Sheets permissions when the user explicitly triggers an export action from the Export modal or settings.

### 4. Google Access-Token Lifecycle
- **Finding:** Access tokens returned by `GoogleAuthProvider.credentialFromResult` are short-lived Bearer tokens (valid for 3600 seconds). The client caches this token indefinitely without checking token expiry or handling `401 Unauthorized` responses from Google REST APIs.
- **Impact:** If a user remains in a session for more than an hour and attempts to export a roadmap to Google Calendar or Tasks, the API calls fail with 401 errors.
- **Remediation:**
  - Add token expiry tracking and error interception on all `fetch` calls in `src/lib/workspace.ts`.
  - When a 401 or expired token is encountered, prompt an in-app incremental re-authorization popup to obtain a fresh token without logging the user out of Firebase.

### 5. Exposed API Credentials
- **Finding:** In `api/index.ts` line 113, a fallback API key (`zApiKey`) is hardcoded as a plaintext string fallback:
  ```ts
  const zApiKey = process.env.Z_AI_API_KEY || "[REDACTED_FALLBACK_KEY]";
  ```
- **Impact:** Hardcoded credentials in source control present a direct security risk and can lead to unauthorized usage and quota theft.
- **Remediation:**
  - Remove all plaintext fallback keys from code.
  - Validate that `process.env.Z_AI_API_KEY` and `process.env.GEMINI_API_KEY` are read exclusively from environment variables.
  - Add security linting and pre-commit checks.

### 6. Missing Backend Authorization & Rate Limiting
- **Finding:** All Express API routes in `api/index.ts` (`/api/next-question`, `/api/generate-roadmap`, `/api/study-buddy`, `/api/daily-insight`) accept arbitrary POST requests without checking Firebase ID tokens (`Bearer <firebase_id_token>`) or enforcing IP/user rate limiting.
- **Impact:** Malicious actors or automated scrapers can exhaust the Gemini API quota and drive up cloud costs by flooding `/api/generate-roadmap`.
- **Remediation:**
  - Implement a Firebase Admin / JWT verification middleware to authenticate requests.
  - Implement IP and user-level rate limiting (e.g., using express-rate-limit) to prevent abuse.

### 7. AI Assessment & Roadmap Generation Architecture
- **Finding:**
  - The assessment was an unstructured free-form chatbot with no explicit step progression (interests, education, experience, target timeline, daily commitment). Users had to guess when to click "Generate My Path".
  - The roadmap generator in `api/index.ts` calls `gemini-3.1-pro-preview` with an elaborate prompt, then performs raw string manipulation to locate `{` and `}`. If JSON parsing fails, it falls back to a static stub or fails with 500.
- **Remediation:**
  - Provide a structured, multi-step assessment workflow (or conversational stepper) that collects verified user profile attributes: education, experience, interests, target roles, and available hours/day.
  - Implement schema-enforced structured JSON output with fallback model routing (`gemini-2.5-pro` / `gemini-2.5-flash` / `gemini-1.5-pro`).

### 8. Firestore Data Persistence & Security Rules
- **Finding:**
  - `src/lib/db.ts` stores everything in a single document `users/{userId}` with `{ roadmap, progress, updatedAt }`.
  - `firestore.rules` enforces `request.auth.token.email_verified == true`. If a Google account lacks an explicit email verification flag in Firebase Auth, all reads and writes fail silently.
  - No subcollections exist for saved notes, project submissions, interview sessions, or historical roadmaps.
- **Remediation:**
  - Refactor Firestore schema to support modular collections:
    - `users/{userId}/profile` (career profile, preferences)
    - `users/{userId}/roadmaps/{roadmapId}` (active and archived roadmaps)
    - `users/{userId}/progress/{roadmapId}` (completed steps, streaks, daily logs)
    - `users/{userId}/projects` (project lab submissions)
    - `users/{userId}/interviews` (mock interview records)
  - Adjust `firestore.rules` to check `request.auth != null && request.auth.uid == userId`.

### 9. AI Study Buddy
- **Finding:** The Study Buddy was implemented as a simple modal popup tied only to individual step titles, lacking persistent history, code execution assistance, or interactive learning challenges.
- **Remediation:**
  - Elevate Study Buddy to both an embedded context-aware mentor inside tasks and a standalone workspace screen.
  - Support syntax-highlighted code explanations, interactive comprehension quizzes, and pedagogical breakdowns.

### 10. Google Workspace Integrations (Tasks, Calendar, Docs, Sheets)
- **Finding:**
  - Export functions in `src/lib/workspace.ts` fire sequential unbatched `fetch` requests with manual `delay(300)` timeouts.
  - If any request fails or rate-limits, partial exports are left behind with no rollback or visual feedback.
  - Google Keep is stubbed to throw an immediate error stating it is restricted to Enterprise Workspace.
- **Remediation:**
  - Use batch requests where supported (Google Docs `batchUpdate`, Google Sheets `append`, Google Tasks batching).
  - Add comprehensive in-app status indicators with progress bars during export.
  - Clearly label restricted features and provide downloadable Markdown/CSV alternatives.

### 11. Focus Timer & Progress Tracking
- **Finding:** The focus timer in `FocusTimer.tsx` had basic start/stop/reset logic without persisting completed focus sessions to Firestore or correlating focus time with specific roadmap milestones.
- **Remediation:**
  - Link focus sessions directly to active roadmap tasks.
  - Log focus intervals into user analytics to display realistic learning hours, weekly heatmaps, and streak tracking.

### 12. Incomplete Buttons & Placeholder Features
- **Finding:**
  - Buttons like "New Career" and "Redesign Path" triggered immediate `onStartOver` without user confirmation or backing up existing progress.
  - Legal links in the footer routed to `/` instead of `/privacy.html` and `/terms.html`.
  - Missing all core navigation destinations promised in the product vision: Career Profile, Skill Gap Analysis, Project Lab, Interview Preparation, Analytics, and Settings.
- **Remediation:**
  - Implement full top-level navigation with distinct screens for all product pillars.
  - Provide proper confirmation dialogs for destructive actions.
  - Connect all legal and help links to dedicated, accessible views.

### 13. Responsive Design & Accessibility (a11y)
- **Finding:**
  - Heavy reliance on dark mode only (`bg-slate-950`), glowing borders (`shadow-[0_0_20px_rgba(34,211,238,0.2)]`), and low-contrast muted text (`text-slate-600` on dark backgrounds failing WCAG AA).
  - Fixed-height containers (`h-[100dvh] overflow-hidden`) causing content clipping on smaller tablet and mobile screens.
  - Missing semantic HTML headings (`<main>`, `<nav>`, `<header>`), missing ARIA labels on icon buttons, and non-focusable interactive elements.
- **Remediation:**
  - Implement the mandated Warm Ivory (`#F4F0E6`), Forest Ink (`#263A32`), Terracotta (`#C66E4E`), Harvest Gold (`#D6AE57`), Sage (`#829A91`), and Slate (`#343D50`) palette.
  - Ensure contrast ratios exceed WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text).
  - Provide clean, fluid responsive layouts across mobile, tablet, and desktop.

### 14. Dependency Vulnerabilities & Production Bundle Optimization
- **Finding:**
  - Production build outputs a single monolithic JavaScript bundle: `dist/assets/index-DMfnPptI.js` weighing **1,517.73 kB (1.52 MB)**.
  - Libraries like `recharts`, `motion`, `firebase`, `react-markdown`, and `canvas-confetti` are all loaded upfront on initial page render, severely impairing First Contentful Paint (FCP) and Time to Interactive (TTI).
- **Remediation:**
  - Implement `React.lazy()` and `Suspense` for heavy dashboard screens and charts.
  - Configure Rollup `manualChunks` in `vite.config.ts` to separate vendor libraries (`vendor-react`, `vendor-firebase`, `vendor-charts`, `vendor-ui`).
  - Target bundle size < 300 kB per chunk.

---

## Action Plan & Roadmap

1. **Phase 2 — Design System Foundations:**
   - Establish CSS tokens for Warm Ivory, Forest Ink, Terracotta, Harvest Gold, Sage, and Slate.
   - Configure typography hierarchy (editorial Serif/Display headings with clean Sans body).
   - Build reusable design system components: `Button`, `Input`, `Card`, `Badge`, `Modal`, `Tabs`, `ProgressBar`, `ThemeToggle`, `Navbar`, and `Sidebar`.

2. **Phase 3 — Landing Page & Main Dashboard Redesign:**
   - Redesign public Landing Page with premium editorial aesthetics, value proposition, feature showcase, and non-blocking Google Sign-in.
   - Redesign Main Dashboard featuring personalized greeting, active career goal card, progress summary, daily missions, weekly activity chart, and quick mentor access.

3. **Phase 4 — Career Profile, Assessment & Roadmap Screens:**
   - Build comprehensive Career Profile view (education, experience, target roles, hours).
   - Build Structured Career Assessment wizard with progress tracking and validation.
   - Redesign Learning Roadmap with phase milestones, daily tasks, resource links, and completion states.
   - Implement Skill Gap Analysis matrix.

4. **Phase 5 — Project Lab, AI Study Buddy, Interview Prep & Remaining Screens:**
   - Build Project Lab with curated real-world projects, difficulty ratings, and milestones.
   - Build enhanced AI Study Buddy with contextual explanations and comprehension challenges.
   - Build Interview Preparation hub with technical and HR questions.
   - Build Progress Analytics and Resource Hub.
   - Build Settings screen (account, appearance, privacy).

5. **Phase 6 & 7 — Auth, Persistence & Backend Security:**
   - Fix session persistence on refresh in `src/lib/firebase.ts`.
   - Implement root `server.ts` for clean local development.
   - Remove hardcoded credentials.

6. **Phase 8 & 9 — Verification, Performance & Build Optimization:**
   - Code splitting with Rollup chunking in `vite.config.ts`.
   - Full TypeScript verification and production build audit.
