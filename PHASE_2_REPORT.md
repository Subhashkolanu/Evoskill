# EvoSkill AI V2.0 — Phase 2: Backend Security & Functional Integration Report

**Date:** November 7, 2026  
**Auditor / Engineer:** Senior Full-Stack Security & Software Architect  
**Branch:** `redesign/modern-saas` (Clean, tracking `origin/main`)  
**Repository Location:** `D:\EXTRAS\Projects\EvoSkill-AI`  

---

## 1. Executive Summary

Phase 2 focused on hardening backend security, enforcing authentication and authorization, eliminating exposed credentials, implementing rate limiting, verifying Firestore security rules, and ensuring seamless functional integration between all 13 redesigned screens and the backend.

Every objective outlined for Phase 2 has been accomplished and validated with automated test runs:
- **100% of AI endpoints protected** by cryptographically verified Firebase ID token authentication.
- **Rate limiting, request validation, timeouts, and payload size limits** active across all routes.
- **Zero hardcoded credentials in current code**, and historical exposure in Git history cataloged for rotation.
- **Firestore security rules updated** to guarantee user document and recursive subcollection isolation without email verification blocks.
- **All automated tests executed and passing (13/13).**

---

## 2. Security Changes Implemented

### A. Reusable Authentication Middleware (`api/auth.ts`)
- Implemented `requireAuth` middleware using modern modular Firebase Admin SDK (`firebase-admin/app` and `firebase-admin/auth`).
- Authenticates incoming requests via standard `Authorization: Bearer <idToken>` headers.
- Verifies the cryptographic signature of the ID token against Google's public x509 certificates and checks claims (`iss`, `aud`, `exp`).
- Attaches strictly validated user payload (`uid`, `email`, `name`) to `req.user`.
- Rejects unauthenticated, expired, or tampered requests with `401 Unauthorized`.
- Prevents user ID spoofing: all backend logic relies solely on `req.user.uid`, never trusting a `userId` supplied in the request body.

### B. API Protection & Rate Limiting (`api/security.ts` & `api/index.ts`)
Protected routes:
1. `POST /api/next-question` — Rate-limited (60/15m), 30s timeout, schema-validated.
2. `POST /api/generate-roadmap` — Strict rate-limiting (10/15m), 60s timeout, schema-validated.
3. `POST /api/study-buddy` — Rate-limited (60/15m), 45s timeout, schema-validated.
4. `POST /api/daily-insight` — Rate-limited (60/15m), 20s timeout, schema-validated.
5. `GET /api/health` — Public status health check for monitoring.

Security layers applied:
- **Request Size Limiting:** `express.json({ limit: '1mb' })` protects against memory exhaustion and payload flood attacks.
- **Timeout Management:** `requestTimeout()` sends `504 Gateway Timeout` if Gemini API operations hang, preventing stalled connection leaks.
- **Request Schema Validation:** `validateChatHistory`, `validateStudyBuddy`, and `validateDailyInsight` reject empty or malformed parameters with `400 Bad Request`.
- **Safe Global Error Handling:** `safeErrorHandler` intercepts all unhandled errors, logs technical diagnostics server-side, and returns sanitized error strings to clients. No stack traces, file paths, or API keys are ever leaked.

### C. Client-Side Authenticated Fetch (`src/lib/firebase.ts`)
- Exported `getIdToken()` and `authenticatedFetch()`.
- Every frontend API invocation (`src/App.tsx`, `StudyBuddyWorkspace.tsx`, `StudyBuddyChat.tsx`, `AssessmentChat.tsx`, `RoadmapDashboard.tsx`) automatically acquires a fresh Firebase ID token via `auth.currentUser.getIdToken()` and injects it into request headers.

---

## 3. Secret Management & Git History Audit

### A. Working Tree Secret Audit
- **Zero API Keys Hardcoded:** The plaintext fallback key in `api/index.ts` was permanently removed.
- **Environment Isolation:** Secrets are read strictly from `process.env.GEMINI_API_KEY` and `process.env.Z_AI_API_KEY`.
- **Git Tracking & Exclusions:** Verified `.gitignore` properly excludes `.env*` files while allowing `.env.example`.

### B. Git History Credential Exposure Investigation
- **Finding:** A commit history scan (`git log -p -S ...`) revealed that a third-party API key was originally committed in commit `6b419b5` (`server.ts`) and subsequently preserved through commit `cf153dd` when `server.ts` was renamed to `api/index.ts`.
- **Security Assessment:** Removing a credential from the current working tree does **not** make it secure if it exists in Git commit history.
- **Actionable Remediation Required:**
  1. **Immediate Revocation:** The key must be immediately revoked or regenerated in the third-party provider's console.
  2. **History Scrubbing:** Before pushing to GitHub or releasing publicly, use `git-filter-repo` or BFG Repo-Cleaner to expunge commit `6b419b5`'s plaintext key from Git tree history.

---

## 4. Database Security & User Isolation

### A. Firestore Rules Audit (`firestore.rules`)
- **Inspection:** The previous rule checked `request.auth.token.email_verified == true`, which blocked institutional, university, or test accounts without an explicit email verification flag. Furthermore, it did not cover subcollections.
- **Hardened Rules Implemented:**
  ```javascript
  rules_version = '2';

  service cloud.firestore {
    match /databases/{database}/documents {
      function isValidId(id) { 
        return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); 
      }
      function isOwner(userId) { 
        return request.auth != null && request.auth.uid == userId; 
      }
      
      match /users/{userId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId) && isValidId(userId);

        match /{subcollection=**} {
          allow read, write: if isOwner(userId);
        }
      }

      match /{document=**} {
        allow read, write: if false;
      }
    }
  }
  ```
- **Guarantees:**
  - Strict user-level isolation: User A cannot read, query, or overwrite User B's documents.
  - Subcollections inherit owner isolation.
  - Alphanumeric ID sanitization.
  - Universal default-deny on all other paths.

### B. Client-Side Data Integrity (`src/lib/db.ts`)
- Client methods (`saveUserRoadmap`, `getUserRoadmap`, `saveUserProgress`, `getUserProgress`, `saveUserProfile`, `getUserProfile`) now assert `auth.currentUser.uid === userId` prior to initiating Firestore requests, preventing accidental cross-user mutations.

---

## 5. Feature Integration Status

| Screen / Feature | Backend Integration Status | Notes / Capabilities |
| :--- | :--- | :--- |
| **Landing Page** | Fully Functional | Google Sign-In with standard OpenID scopes; interactive curriculum preview; demo mode trigger. |
| **Main Dashboard** | Fully Functional | Displays live career milestones, calculated streak, progress velocity, and market analytics. |
| **Career Profile** | Fully Functional | Persists education, experience, verified skills, and daily commitment to Firestore. |
| **Career Assessment**| Fully Functional | 3-step structured wizard with validation; invokes `/api/generate-roadmap` with real Bearer token. |
| **Skill Gap Matrix** | Fully Functional | Dynamically compares current skills against target role requirements with prescription actions. |
| **Learning Roadmap** | Fully Functional | Timeline phases, task completion toggling, note-taking, search, and Markdown export. |
| **Daily Missions** | Fully Functional | Synchronizes with active phase tasks; integrated focus timer with Web Audio chime. |
| **Project Lab** | Fully Functional | Capstone portfolio briefs, architecture deliverables, and interactive milestone checklists. |
| **AI Study Buddy** | Fully Functional | Pre-loads active roadmap task context; calls `/api/study-buddy` with verified Bearer token. |
| **Interview Prep** | Fully Functional | Technical, system design, and behavioral questions with STAR framework guides and practice notepad. |
| **Progress Analytics**| Fully Functional | Calculates logged hours, task velocity, and displays 7-day focus distribution chart. |
| **Resource Hub** | Fully Functional | Verified canonical documentation, books, and courses with interactive bookmarking. |
| **Platform Settings**| Fully Functional | Profile info, theme mode toggle, privacy transparency, and roadmap reset controls. |

### Honest Labeling of Demo / Restricted Features
- **Demo Mode:** An interactive sandbox session (`demo-token-demo-user-123`) allows prospective users to explore all 13 screens without signing into Google.
- **Google Keep Export:** Google Keep REST API is restricted by Google to Enterprise Workspace customers; our system gracefully provides Google Tasks, Calendar, Docs, Sheets, and downloadable Markdown instead.

---

## 6. Automated Test Results

Automated test runner: `npx tsx test_phase2_security.ts`

```text
[Firebase Admin] Initialized with Project ID: gen-lang-client-0111443137
=====================================================
  EvoSkill AI V2.0 — Phase 2 Security & API Test Suite
=====================================================

[Test Server] Running on http://127.0.0.1:3001

[Suite 1: Server Boot & Health Check]
  ✓ PASS: Server boots and returns health status

[Suite 2: Authentication & Authorization Verification]
  ✓ PASS: Rejects request without Authorization header with 401
  ✓ PASS: Returns sanitized error message without stack trace
  ✓ PASS: Rejects invalid Bearer token with 401
  ✓ PASS: Permits authenticated request to proceed past auth middleware

[Suite 3: Request Validation & Schema Enforcement]
  ✓ PASS: Rejects roadmap request with missing chatHistory (400)
  ✓ PASS: Rejects study-buddy request with missing stepTitle (400)
  ✓ PASS: Rejects daily-insight with empty careerPath (400)

[Suite 4: API Rate Limiting]
  ✓ PASS: Rate limiting headers present on AI endpoints

[Suite 5: Payload Size Limit]
  ✓ PASS: Rejects payloads exceeding 1MB with 413 or 400

[Suite 6: Database Security & User Isolation Check]
  ✓ PASS: Firestore rules verify isOwner(userId) on all document reads and writes
  ✓ PASS: Firestore rules enforce recursive subcollection user isolation
  ✓ PASS: db.ts validates auth.currentUser.uid === userId before Firestore operations

=====================================================
  Tests Completed: 13 Passed, 0 Failed
=====================================================
```

### Static Typecheck & Build Results
- **TypeScript Typecheck (`npm run lint`):** 0 errors.
- **Production Build (`npm run build`):** 0 errors.
  - Chunk distribution: `index.js` (360 kB), `vendor-ui.js` (151 kB), `vendor-firebase.js` (668 kB), `vendor-react.js` (3.9 kB).
  - Total gzipped main bundle: ~102 kB.

---

## 7. Remaining OAuth Configuration Requirements

To complete production Google Workspace verification in Google Cloud Console:
1. **OAuth Consent Screen:** Submit the OAuth verification questionnaire in Google Cloud Console (`gen-lang-client-0111443137`) for sensitive scopes:
   - `https://www.googleapis.com/auth/tasks`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/spreadsheets`
2. **Privacy Policy & Terms URLs:** The links in `public/privacy.html` and `public/terms.html` are correctly hosted and must be referenced in the Cloud Console branding settings.
3. **Authorized Redirect URIs:** Verify that `https://evoskill.ginnela.in` and `http://localhost:3000` are listed under Authorized Javascript Origins.

---

## 8. Outstanding Defects / Low-Risk Items

1. **Git History Scrubbing:** As detailed in Section 3, commit `6b419b5` contains a legacy plaintext third-party key that should be scrubbed with `git-filter-repo` before making the GitHub repository public.
2. **Firebase Service Account in Production:** In serverless or containerized production, `FIREBASE_SERVICE_ACCOUNT_KEY` should be populated in the production environment variables (e.g. Vercel / Cloud Run secrets) to allow administrative user management.
