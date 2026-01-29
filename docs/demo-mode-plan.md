# TaskMaster — One-Click Demo Mode (Amplify Gen 1 + Cognito) Implementation Plan

## Problem / Solution

### Problem
Recruiters won’t create accounts + verify emails.

### Solution
A public “Try Demo (No Signup)” button that:
- calls a backend endpoint to create a unique demo Cognito user (no email sent)
- returns `{ username, password }`
- client signs in normally via Amplify Auth
- existing bootstrap+seed runs exactly as-is
- each click gets a fresh demo user (no shared demo account)

## Goal
Remove “account creation + email verification” friction for portfolio reviewers by adding a **Try Demo** button that:
- creates a **fresh, unique demo user** in Cognito (no emails sent)
- marks email as **verified**
- returns `{ username, password }` to the client
- client performs a normal sign-in via Amplify Auth (`aws-amplify/auth`)
- existing UI “seed-on-first-login” logic runs as-is
- avoids shared demo accounts (troll-proof)

---

## Current app routing posture (as implemented)

Public routes (no auth required):
- `/` (Home) — includes **Try Demo** CTA
- `/about` (About)
- `/login` (Login)

Protected routes:
- All other app pages require auth and redirect to `/login?redirect=<path>` when signed out.

Important UX goal:
- The shared layout (TopBar/Sidebar/Footer) remains visible even when signed out.

## Current Assumptions (based on existing system)
- Auth: **Amplify Gen 1** with **Cognito User Pool**
- You already have a **Post Confirmation Lambda** (`add-to-group.js`) for admin assignment
- Data: **GraphQL (AppSync)**, auth-protected by Cognito (standard)
- Demo data seeding happens **client-side after login** (versioned + idempotent via `UserProfile.seedVersion`)

---

## Guardrails
- Rate limit by IP (basic protection)
- Consider periodic cleanup of old demo accounts (optional)
- Ensure demo emails never match the admin-email auto-group rule

---

## High-Level Architecture
Public pages:
- `/` (Home) — includes **Try Demo** CTA
- `/login` (Login) — normal flow still available
- `/about` (About)

New backend endpoint:
- `POST /auth/demo` — **callable Lambda** (API Gateway OR Lambda Function URL OR Amplify REST API)
  - Creates and signs in a unique demo user
  - Returns `{ username, password }`

Client demo login:
- call endpoint → receive creds → `signIn({ username, password })` → redirect → existing seed logic

---

## Status: What’s already done (✅)

### Data models + auth (Amplify Gen 1 / AppSync)
- Models: TaskList, Task, UserProfile.
- Owner auth uses Cognito `sub` consistently:
  - `@auth(rules: [{ allow: owner, ownerField: "owner", identityClaim: "sub" }, { allow: groups, groups: ["Admin"] }])`
- Admins have an override via Cognito group `"Admin"` (AppSync auth rule).

### Key schema fields (current intent)
- TaskList: `isDemo`, `isFavorite`, `sortOrder`, optional `description`
- Task: `isDemo`, status/priority, sorting/indexes (`tasksByList`, `tasksByParent`)
- UserProfile:
  - `id = sub`
  - `owner = sub`
  - `email` stored in UserProfile (required in schema; legacy profiles may need healing)
  - versioning:
    - `seedVersion` + `seededAt`
    - `settingsVersion` + `settingsUpdatedAt`
    - `onboardingVersion` + `onboardingUpdatedAt`
  - enums: `PlanTier`, `DefaultVisibility`

### Codegen guardrails (repo hygiene)
- Generated ops live in `src/graphql/`.
- Custom minimal ops moved to `src/api/operationsMinimal.ts`.
- Guardrail script verifies `src/graphql` only contains expected codegen outputs.
- CI runs `npm run check` (lint + verify + build).

### User bootstrap + demo seeding (client-side)
- On authenticated app boot (once per session), app runs bootstrap:
  1) Resolve current user `sub` + email.
  2) Ensure UserProfile exists (id=sub, owner=sub, email set).
  3) Seed demo data versioned + idempotent:
     - `CURRENT_SEED_VERSION` is the “recipe version”.
     - If `profile.seedVersion < CURRENT_SEED_VERSION`, claim a seeding lock (seedVersion = -1) to prevent multi-tab duplication, seed lists/tasks, then finalize `seedVersion = CURRENT_SEED_VERSION` and `seededAt = now`.
  4) Self-heal: if an existing profile is missing email/null/empty, patch from Cognito email with conditional update (does NOT overwrite real emails).
- Demo seeding is ON by default for all new accounts (can be disabled via `?demo=0` or localStorage flag).

---

## Step 1 — Define the Demo User Strategy
### Demo user identity format
- Email/username: `demo+<uuid>@nickhanson.me`
  - Must NOT match your “admin email rule”
- Password: random strong password (generated server-side)
- Set Cognito attribute: `custom:isDemo = "true"` (recommended)
- Or store a flag elsewhere; not required if UI seeds on empty data

---

## Step 2 — Create a Callable Lambda Endpoint
Choose one:
- **API Gateway (REST)**: `POST /auth/demo`
- **Lambda Function URL** (fast to ship)
- **Amplify REST API** (if you already use it)

Minimum requirement:
- Frontend must be able to call it without being logged in
- Endpoint must implement CORS for your site origin

---

## Step 3 — IAM Permissions for the Demo Lambda
Attach an IAM policy to the Lambda execution role allowing:
- `cognito-idp:AdminCreateUser`
- `cognito-idp:AdminSetUserPassword`
- `cognito-idp:AdminInitiateAuth`

Scope these to your user pool + app client where possible.

---

## Step 4 — Cognito App Client Configuration
Ensure your Cognito App Client supports password auth:
- Enable auth flow:
  - `ADMIN_USER_PASSWORD_AUTH` (preferred for AdminInitiateAuth)
  - or `USER_PASSWORD_AUTH` if you use that flow

Also ensure **sign-in alias** supports your chosen username (email is typical).

---

## Step 5 — Implement `POST /auth/demo` Lambda
### Responsibilities
1) Generate `username/email` and `password`
2) `AdminCreateUser` with:
   - `MessageAction: "SUPPRESS"` (no invitation email)
   - `UserAttributes`: `email`, `email_verified=true`, optionally `custom:isDemo=true`
3) `AdminSetUserPassword` with:
   - `Permanent: true`
4) (Optional) Add to a “demo” group
5) Return `{ username, password }`

### Notes
- You do NOT need to call AppSync/GraphQL from Lambda since UI seeds after login.
- Handle the case where `AdminCreateUser` fails because user exists (shouldn’t with UUID, but retry once with a new UUID).

---

## Step 6 — Add “Try Demo” to Public UI
On Home page:
- Button: **Try Demo (No Account Required)**

Client handler:
1) `POST /auth/demo`
2) Parse JSON: `{ username, password }`
3) `await signIn({ username, password })`
4) Redirect to `/today` (or to a `redirect` query param if present)
5) Existing “post-login seed if empty” logic executes normally

Add UI feedback:
- Loading state (“Creating demo account…”)
- Friendly error message if endpoint fails

---

## Step 7 — Ensure UI Seeding Runs Exactly Once (Per User)
Your current seed logic should be something like:
- On login:
  - query user’s lists/tasks
  - if empty → seed demo dataset
  - else → do nothing

Important:
- Avoid seeding every time the user signs in
- Use an “exists check” (0 lists) as the gate

Optional improvement:
- If `custom:isDemo` is true, seed a richer dataset
- If not demo, seed minimal onboarding data

---

## Step 8 — Add Abuse/Cost Guardrails
### Rate limiting (recommended)
- Limit `/auth/demo` requests by IP (e.g., 5/minute)
- Optionally add a basic bot check (not required for v1)

### Cleanup (nice-to-have)
- Scheduled job to delete demo users older than X days
  - Or just leave them if volume is low (portfolio likely fine)

### Session lifetime
- Keep Cognito token TTL defaults, or shorten refresh token window for demo if desired

---

## Step 9 — Verify End-to-End
Test cases:
1) Click “Try Demo” → lands in app authenticated
2) No email is sent
3) AppSync/GraphQL calls succeed normally
4) UI seeding runs and populates data
5) Reload app → user still authenticated as demo user
6) Normal signup/login still works
7) Demo email cannot be promoted to admin group by existing post-confirm logic

---

## Step 10 — Portfolio UX Copy
Homepage:
- “Try Demo (no signup)” primary button
- “Login / Create account” secondary

Inside app:
- Small badge “Demo mode” (optional)
- Optional “Reset demo” button (only affects that demo user)

---

## Deliverables Checklist
- [ ] Public Home page with Try Demo CTA
- [ ] New `POST /auth/demo` Lambda endpoint
- [ ] IAM policy on Lambda role for Cognito admin APIs
- [ ] Cognito app client auth flow enabled (ADMIN_USER_PASSWORD_AUTH or USER_PASSWORD_AUTH)
- [ ] Client integration: call endpoint + `Auth.signIn(...)`
- [ ] UI seed-on-empty verified
- [ ] Basic rate limiting (optional but recommended)

---

## Notes / Implementation Choices
- Returning `{ username, password }` is chosen because it lets Amplify Gen 1 perform a standard sign-in, keeping the rest of the app unchanged.
- Returning tokens directly is possible but typically brittle with Amplify Gen 1 session injection and not worth it for a portfolio demo.
