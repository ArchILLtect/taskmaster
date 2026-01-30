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
- The shared layout (TopBar/Sidebar/Footer) remains visible when signed out.
- Sidebar behavior:
  - Signed out: show PublicSidebar (only Home / About / Login).
  - Signed in: show the full Sidebar.

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
- Ensure the demo-creation Lambda never assigns Admin

---

## High-Level Architecture
Public pages:
- `/` (Home) — includes **Try Demo** CTA
- `/login` (Login) — normal flow still available
- `/about` (About)

New backend endpoint:
- `POST /auth/demo` — **callable Lambda** (API Gateway OR Lambda Function URL OR Amplify REST API)
  - Creates a unique demo user
  - Returns `{ username, password }`

Client demo login:
- call endpoint → receive creds → `signIn({ username, password })` → redirect → existing seed logic

Note: the app’s authenticated bootstrap now forces a network refresh on sign-in/user-switch so lists/tasks update immediately (no “Expire + refresh now” needed).

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
- Email/username: `demo+<uuid>@taskmaster.me`
  - Must NOT match your “admin email rule” (it does not).
- Password: random strong password (generated server-side)

### Operator prerequisites (one-time)
- Ensure the Cognito User Pool has a group named `Demo`.
  - This can be created in the Cognito console (Groups → Create group).
  - The demo-creation Lambda will add new demo users to this group.
- Confirm your “admin auto-group” rule is written such that it cannot match the demo email format.

Recommended: mark demo users via a Cognito group
- Add the user to `GroupName: "Demo"` during demo-account creation.
- Why this is the default: the app already uses Cognito groups for Admin (`cognito:groups` claim) and this keeps the mental model consistent.
- Token timing note: groups appear in tokens when the user authenticates. Account creation itself does not mint tokens.
  - If you add the user to the Demo group *before* returning creds, the first normal client sign-in will often include `cognito:groups: ["Demo", ...]`.
  - Gotcha: the first token may still omit `cognito:groups` due to propagation/timing quirks.
    - Action: do NOT make `cognito:groups` a hard dependency for the first session.
    - Use group-based demo UX when/if the claim appears, but treat the session as demo based on a client-side “created via `/auth/demo`” signal.
  - If you add the group *after* the user is already signed in, they won’t see it until tokens refresh / re-auth.

Optional alternative: custom attribute
- Set a User Pool custom attribute `custom:isDemo = "true"`.
- This requires adding the custom attribute to the User Pool schema (infra change), but avoids managing an extra group.

Why a demo marker is still required
- Today, all accounts are seeded with demo-ish data (until onboarding exists), so `UserProfile.seedVersion` cannot distinguish demo vs non-demo users.
- If you want behavior that targets ONLY demo users (UI badges, stricter limits, cleanup), you need a dedicated marker.
- The recommended marker is the Demo group because groups are already used successfully for Admin.

---

## Operator Setup — What you do on your end
These steps are the parts you’ll typically do personally (Amplify CLI / AWS console), even if I implement the app + Lambda code.

Amplify CLI (in this repo)
- Add the REST API + Lambda (creates API Gateway + function wiring):
  - `amplify add api` → choose `REST`
  - Path: `/auth/demo`
  - Method: `POST`
  - Create a new Lambda function (or attach an existing one)
  - Configure as public/no auth (no authorizer)
- Deploy: `amplify push`

Cognito / Auth configuration
- Ensure App Client has `USER_PASSWORD_AUTH` enabled.
- Create the `Demo` group (if it doesn’t exist).

Lambda permissions
- Grant the demo Lambda execution role permissions for:
  - `cognito-idp:AdminCreateUser`
  - `cognito-idp:AdminSetUserPassword`
  - `cognito-idp:AdminAddUserToGroup`
  - Scope the resources to your User Pool where possible.

WAF (rate limiting)
- Attach AWS WAF to the API Gateway stage and add a rate-based rule keyed by source IP.
  - This is usually done in AWS Console (WAF) and then associating the Web ACL with the API Gateway stage.
  - If you later want this fully codified, it can be moved into IaC (Amplify overrides / CloudFormation), but manual attach is fine for MVP.
  - Shipping note: WAF is strongly preferred, but it should not block shipping. If it becomes a time sink, ship without WAF and add it immediately after.

CORS
- Ensure API Gateway is configured to respond to `OPTIONS` and include the CORS headers described in Step 2.
  - If you implement headers in Lambda, confirm they pass through API Gateway.

Admin safety (optional but recommended)
- Update the admin assignment Lambda (`add-to-group.js`) to explicitly refuse assigning Admin for demo-style identities.

---

## Step 2 — Cognito App Client Configuration
Ensure your Cognito App Client supports password auth:

For this plan (client signs in with username/password via Amplify):
- Enable `USER_PASSWORD_AUTH` on the app client.

Also ensure **sign-in alias** supports your chosen username (email is typical).

---

## Step 3 — Create a Callable Lambda Endpoint
Decision: Amplify REST API (API Gateway + Lambda)
- Implement `POST /auth/demo` as an Amplify REST API endpoint.
- Provision via Amplify CLI (REST API backed by Lambda) so deployment stays inside the existing Amplify workflow.

Minimum requirement:
- Frontend must be able to call it without being logged in
- Endpoint must implement CORS for your site origin

Implementation notes
- Endpoint should be public (no authorizer), then protected via rate limiting.

### CORS (implementation guidance)
Because this is an API Gateway REST endpoint called from the browser, CORS must be configured explicitly.

Recommended behavior:
- Allow origins:
  - Local dev (e.g., `http://localhost:5173` / `http://localhost:5174`)
  - Production origin(s) (your deployed site domain)
- Allow methods: `POST,OPTIONS`
- Allow headers: at minimum `Content-Type`
- Do NOT set `Access-Control-Allow-Credentials: true` (not needed for this endpoint)

How to implement (API Gateway REST):
- Ensure an `OPTIONS` preflight response exists for `/auth/demo`.
- Include these headers in BOTH the `OPTIONS` response and the `POST` response:
  - `Access-Control-Allow-Origin` (ideally echo from an allowlist)
  - `Access-Control-Allow-Methods: POST,OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
  - `Vary: Origin`

If you implement the CORS headers in Lambda, ensure API Gateway is not stripping them.

---

## Step 4 — IAM Permissions for the Demo Lambda
Attach an IAM policy to the Lambda execution role allowing:
- `cognito-idp:AdminCreateUser`
- `cognito-idp:AdminSetUserPassword`
- `cognito-idp:AdminAddUserToGroup` (recommended if using the Demo group)

Scope these to your user pool + app client where possible.

---

## Step 5 — Implement `POST /auth/demo` Lambda
### Responsibilities
1) Generate `username/email` and `password`
2) `AdminCreateUser` with:
   - `MessageAction: "SUPPRESS"` (no invitation email)
  - `UserAttributes`: `email`, `email_verified=true`, optionally `custom:isDemo=true`
3) `AdminSetUserPassword` with:
   - `Permanent: true`

4) Add to the Demo group (recommended)
  - `AdminAddUserToGroup({ GroupName: "Demo" })`
  - Do this before returning creds so the first sign-in token is more likely to include `cognito:groups`.
  - Do not assume the group claim is present on the first session.

5) Return `{ username, password }`

### Notes
- You do NOT need to call AppSync/GraphQL from Lambda since UI seeds after login.
- Handle the case where `AdminCreateUser` fails because user exists (shouldn’t with UUID, but retry once with a new UUID).

### Demo/Admin mixing (safety guarantees)
This plan intentionally avoids mixing demo users with Admin assignment.

Why it’s already very safe:
- Demo users are created via Cognito admin APIs (`AdminCreateUser` + `AdminSetUserPassword`), not the normal sign-up/confirm flow.
- The existing Post Confirmation trigger used for Admin assignment is not part of the demo account creation flow.
- Demo emails are deliberately formatted to never match the Admin assignment rule.

Easy additional “belt + suspenders” guards:
- In the demo-creation Lambda: never add users to the Admin group (only add Demo).
- In the Admin assignment Lambda (`add-to-group.js`): add an explicit deny rule such as “if username/email starts with `demo+` or contains `@taskmaster.me`, never assign Admin”.

Together, these make accidental Demo→Admin promotion extremely unlikely.

---

## Step 6 — Verify backend endpoint FIRST (saves time)

---

## Step 7 — Add “Try Demo” to Public UI
On Home page:
- Button: **Try Demo (No Account Required)**

Current state:
- The CTA exists and routes into the login flow as a placeholder (`/login?intent=demo`) until the backend endpoint is implemented.

Client handler:
1) `POST /auth/demo`
2) Parse JSON: `{ username, password }`
3) `await signIn({ username, password })`
4) Set a local “demo session” flag on success (so demo UX doesn’t depend on the first token’s `cognito:groups` claim)
  - Example: localStorage `taskmaster:isDemoSession = "1"` (and clear it on sign-out)
4) Redirect to `?redirect=` if present; otherwise default to `/today`
5) Existing “post-login seed if empty” logic executes normally

Endpoint wiring note
- The client should use the deployed REST endpoint URL (from Amplify API output / config). Treat this as environment/config-driven, not hard-coded.

Add UI feedback:
- Loading state (“Creating demo account…”) and <Spinner />
- Friendly error message if endpoint fails

---

### Step 8 — Demo marker “timing” guardrail (important UX detail)

---

## Step 9 — Ensure UI Seeding Runs Exactly Once (Per User)
Current approach (as implemented):
- Seeding is versioned + idempotent via `UserProfile.seedVersion`.
- On authenticated boot:
  - ensure `UserProfile` exists (and self-heal required fields like `email` if missing)
  - if `seedVersion < CURRENT_SEED_VERSION`, claim a lock (`seedVersion = -1`), seed, then set `seedVersion = CURRENT_SEED_VERSION`.

Important:
- Avoid seeding on every sign-in.
- Prefer `seedVersion` over “0 lists” checks (more robust when you later change the seed dataset)
- If `cognito:groups` includes `"Demo"`, allow demo-only UX (badge, reset) and/or seed a richer dataset.
  - Gotcha: do not block demo UX on this claim for the first session; it may be missing initially.
  - For the first session, treat the user as demo based on the local “demo session” flag set after a successful `/auth/demo` call.
- If not demo, seed minimal onboarding data.

---

## Step 10 — Add Abuse/Cost Guardrails
### Rate limiting (recommended)
- Limit `/auth/demo` requests by IP (e.g., 5/minute)

How to implement (recommended path)
- Attach AWS WAF to the API Gateway stage and add a rate-based rule:
  - Aggregate key: source IP
  - Rate: ~5 requests per 5 minutes (tune as desired)
  - Action: block (or challenge, if you later add bot checks)
- This is effective because it stops abuse before Lambda executes (cost control).

Implementation notes
- Expect some false-positives for shared IPs (office/NAT). That’s acceptable for a portfolio demo; tune the threshold if needed.
- Add lightweight logging/metrics (count calls, count blocked) so you can detect abuse.
- Shipping note: WAF is recommended, but it should not block shipping.
  - Fallback if WAF friction is high: implement a basic in-Lambda throttle (simple IP rate limit) as a temporary guardrail, then replace with WAF later.

---

## Optional / Stretch goals

### Bot checks
- Add a basic bot check (e.g., CAPTCHA/Turnstile) to reduce scripted abuse of `/auth/demo`.

### Cleanup old demo accounts
- Scheduled job (EventBridge → Lambda) to delete Demo users older than X days.

---

## Step 11 — Verify End-to-End
Test cases:
1) Click “Try Demo” → lands in app authenticated
2) No email is sent
3) AppSync/GraphQL calls succeed normally
4) UI seeding runs and populates data
5) Reload app → user still authenticated as demo user
6) Normal signup/login still works
7) Demo email cannot be promoted to admin group by existing post-confirm logic

---

## Step 12 — Portfolio UX Copy
Homepage:
- “Try Demo (no signup)” primary button
- “Login / Create account” secondary

Inside app (demo-mode only):
- Small badge “Demo mode”
- “Reset demo” button (only affects that demo user)

---

## Step-by-step Working Checklist (sequential)
Use this checklist while you implement. The Deliverables Checklist below remains the final “definition of done”.

### Already done (as of now)
- [x] Build Public Home page
- [x] Build Login page
- [x] Build Public Sidebar (Home / About / Login)

### Step 1 — Define the Demo User Strategy (prep first)
- [ ] Confirm demo identity format: `demo+<uuid>@taskmaster.me`
- [ ] Confirm demo marker choice: Cognito group `Demo`
- [ ] Create the `Demo` group in the Cognito User Pool (console)
- [ ] Confirm admin auto-group logic cannot match demo identities
- [ ] (Recommended) Add a deny condition in `add-to-group.js` so demo identities can never be assigned Admin

### Step 2 — Cognito App Client Configuration (avoid auth-flow surprises)
- [ ] Enable `USER_PASSWORD_AUTH` on the Cognito App Client
- [ ] Confirm sign-in alias supports the chosen username format (email)

### Step 3 — Create the Callable Lambda Endpoint (Amplify REST) (get the hook in place)
- [ ] Run `amplify add api` and choose `REST`
- [ ] Configure route: `POST /auth/demo`
- [ ] Configure endpoint as public (no auth/authorizer)
- [ ] Create/attach the demo Lambda function
- [ ] Configure CORS for dev + prod origins
- [ ] Deploy with `amplify push`

### Step 4 — IAM Permissions for the Demo Lambda (unblock implementation)
- [ ] Grant Lambda role: `cognito-idp:AdminCreateUser`
- [ ] Grant Lambda role: `cognito-idp:AdminSetUserPassword`
- [ ] Grant Lambda role: `cognito-idp:AdminAddUserToGroup`
- [ ] Scope permissions to the correct User Pool resources where possible

### Step 5 — Implement `POST /auth/demo` Lambda (core behavior)
- [ ] Generate unique username/email and strong password
- [ ] Call `AdminCreateUser` with `MessageAction: "SUPPRESS"`
- [ ] Set `email_verified=true`
- [ ] Call `AdminSetUserPassword` with `Permanent: true`
- [ ] Add user to `Demo` group before returning creds
- [ ] Return `{ username, password }` JSON
- [ ] Handle collisions/retries (very unlikely; retry once with a new uuid)
- [ ] Add minimal logging (success/failure counts, but do not log passwords)

### Step 6 — Verify backend endpoint FIRST (saves time)
- [ ] Call `POST /auth/demo` directly (curl/Postman or browser dev test) and confirm:
  - [ ] Returns `{ username, password }`
  - [ ] No email is sent
  - [ ] CORS works from localhost origin

### Step 7 — Wire “Try Demo” to the real endpoint (frontend integration)
- [ ] Replace placeholder `/login?intent=demo` flow with a real call to `POST /auth/demo`
- [ ] Add loading UI (spinner / disabled button) while creating demo account
- [ ] Add friendly error UI for failed demo creation
- [ ] On success: client signs in via Amplify Auth (`signIn({ username, password })`)
- [ ] Redirect: respect `?redirect=` else go to `/today`

### Step 8 — Demo marker “timing” guardrail (important UX detail)
- [ ] Do NOT assume the `Demo` group will be present in the first token.
- [ ] If demo-only UI is needed immediately, set a local “demo-session” flag after `/auth/demo` succeeds.
- [ ] (Optional) Still gate longer-term demo UX using `cognito:groups` once available.

### Step 9 — Ensure UI Seeding Runs Exactly Once (Per User)
- [ ] Verify `seedVersion` lock path works for demo sign-in
- [ ] Confirm refresh-on-sign-in/user-switch behavior still updates lists/tasks immediately
- [ ] (Optional) Gate demo-only UX by `cognito:groups` containing `Demo` (best effort) OR local demo-session flag

### Step 10 — Add Abuse/Cost Guardrails (WAF preferred; don’t let friction block shipping)
- [ ] Create/choose an AWS WAF Web ACL
- [ ] Attach WAF Web ACL to the API Gateway stage
- [ ] Add a rate-based rule keyed by source IP (~5 per 5 minutes)
- [ ] Validate the rule blocks bursts and doesn’t break normal use
- [ ] If WAF setup is too painful right now:
  - [ ] Add a temporary in-Lambda IP throttle, and come back to WAF post-ship

### Step 11 — Verify End-to-End
- [ ] Click Try Demo → lands authenticated
- [ ] No email is sent
- [ ] AppSync/GraphQL calls succeed
- [ ] Seeding runs and data appears
- [ ] Reload: demo session persists
- [ ] Normal login/signup still works
- [ ] Demo identities cannot be assigned Admin

### Step 12 — Portfolio UX Copy
- [ ] Homepage copy matches intent (“Try Demo (no signup)” primary)
- [ ] In-app demo affordances are clear (badge/reset if you choose to include them)

---

## Deliverables Checklist
This is the full “GTG” checklist for implementing one-click demo mode.

- [x] Build Public Home page
- [x] Build Login page
- [x] Build Public Sidebar (Home / About / Login)

Backend (Amplify + AWS)
- [ ] REST API created via Amplify: `POST /auth/demo` routes to a Lambda
- [ ] CORS configured for `/auth/demo` (`OPTIONS` + `POST` responses include required headers)
- [ ] Demo Lambda has IAM permissions: `AdminCreateUser`, `AdminSetUserPassword`, `AdminAddUserToGroup`
- [ ] Cognito User Pool has group `Demo`
- [ ] Cognito App Client allows `USER_PASSWORD_AUTH`
- [ ] Demo Lambda adds user to `Demo` group before returning creds
- [ ] WAF Web ACL attached to API Gateway stage
- [ ] WAF rate-based rule enabled (source IP, ~5/5min) and validated

Frontend (app)
- [ ] Home page “Try Demo” CTA calls `/auth/demo` and shows loading + error states
- [ ] On success: client signs in via Amplify Auth (`signIn({ username, password })`)
- [ ] Redirect behavior: respect `?redirect=` else go to `/today`

Seeding / UX
- [ ] Demo user sign-in triggers existing bootstrap+seed flow exactly once per user (via `seedVersion`)
- [ ] Demo-only UX hooks are gated by `cognito:groups` containing `Demo` (optional for MVP)

Safety
- [ ] Demo Lambda never assigns Admin group
- [ ] Admin assignment Lambda denies Admin for demo identity patterns (recommended)

Verification
- [ ] Manual test: click Try Demo → authenticated → seed data appears
- [ ] Manual test: repeated clicks create distinct accounts
- [ ] Manual test: CORS works in both local dev and prod origin
- [ ] Manual test: rate limiting blocks bursts as expected

---


## Notes / Implementation Choices
- Returning `{ username, password }` is chosen because it lets Amplify Gen 1 perform a standard sign-in, keeping the rest of the app unchanged.
- Returning tokens directly is possible but typically brittle with Amplify Gen 1 session injection and not worth it for a portfolio demo.

Condition: no server-side sign-in
- This plan does NOT use `cognito-idp:AdminInitiateAuth`.
- The backend only creates the demo user and sets a password.
- The client signs in normally using Amplify (`signIn({ username, password })`), which keeps app auth/session behavior consistent.