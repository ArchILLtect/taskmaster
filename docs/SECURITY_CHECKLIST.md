# Security Checklist

TaskMaster uses AWS Amplify (Gen 1) with Cognito Auth and AppSync GraphQL. This checklist focuses on practical safeguards for an MVP/prototype that already persists real user data.

---

## 1) Supply chain & build hygiene

- [ ] Keep dependencies current and review security advisories:
	- `npm audit` (and/or GitHub Dependabot)
- [ ] Avoid introducing packages that require broad runtime privileges.
- [ ] Ensure CI (or at least local) runs:
	- `npm run lint`
	- `npm run build`

---

## 2) Secrets & configuration

- [ ] No secrets in the frontend bundle.
	- The frontend is public code; treat anything shipped to the browser as discoverable.
- [ ] Verify generated Amplify exports (`src/aws-exports.js`) contain configuration only (endpoints/ids), not credentials.
- [ ] Ensure any `.env*` files containing secrets are not committed.

---

## 3) Authentication (Cognito)

- [ ] Auth is enforced in the UI via Amplify UI Authenticator (see [src/App.tsx](../src/App.tsx)).
- [ ] User display info is derived via the centralized mapping + caching layer:
	- [src/services/authService.ts](../src/services/authService.ts)
- [ ] Verify sign-out clears cached user display info (to avoid cross-user leakage on shared devices).
- [ ] Document and enforce Cognito group names used by authorization rules (e.g. `Admin`).

Recommended hardening (post-MVP):
- [ ] Decide on MFA requirements and password policy.
- [ ] Confirm whether self-signup is allowed and aligns with expectations.

---

## 4) Authorization (AppSync GraphQL + DynamoDB)

Schema reference:
- [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)

Checklist:
- [ ] Validate owner-based access actually prevents cross-user reads/writes.
- [ ] Validate Admin group can read/write across users (if enabled for the environment).
- [ ] Confirm clients cannot change ownership via mutation payloads.
	- Amplify’s default behavior may allow reassignment unless explicitly prevented.
	- If this is a concern, harden with field-level auth and/or remove the `owner` field from client-writable inputs.

Operational verification:
- [ ] Create two users and confirm User A cannot access User B’s lists/tasks.
- [ ] If Admin is enabled, confirm an Admin user can access both.
- [ ] Confirm non-admin users cannot access the Admin console route (`/admin`) or see the Admin link.

---

## 5) Client-side persistence & data handling

The app persists some state in localStorage for UX (faster reload / cached views). Treat localStorage as readable by anyone with access to the device/browser profile.

- [ ] Do not store access tokens or sensitive secrets in localStorage.
- [ ] Sanity-check what’s persisted under TaskMaster keys.
	- Most persisted keys are scoped per signed-in user:
		- `taskmaster:authScope`
		- `taskmaster:u:<scope>:zustand:taskmaster:taskStore`
		- `taskmaster:u:<scope>:zustand:taskmaster:inbox`
		- `taskmaster:u:<scope>:zustand:taskmaster:updates`
		- `taskmaster:u:<scope>:zustand:taskmaster:user`
		- `taskmaster:u:<scope>:zustand:taskmaster:localSettings`
		- `taskmaster:u:<scope>:inboxListId`
	- Non-scoped UX keys:
		- `taskmaster:storageDisclosureAck:v1` (storage disclosure banner dismissal)
- [ ] Ensure persisted state is validated/migrated defensively (corrupted JSON should not break startup).

---

## 6) Hosting & browser protections

When deploying the SPA, prefer enabling standard security headers at the host/CDN:

- [ ] HTTPS only + HSTS (production)
- [ ] `Content-Security-Policy` (at minimum, block `object-src`, restrict script sources)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy` appropriate to the product
- [ ] `Permissions-Policy` to disable unused capabilities

---

## 7) Logging, telemetry, and privacy

- [ ] Avoid logging user content (task titles/descriptions) to third-party services.
- [ ] If error reporting is added later (Sentry/etc.), scrub PII and auth tokens.
- [ ] Provide a basic privacy policy once the app is exposed to real users.
- [x] Storage disclosure banner exists (localStorage caches and auth storage).
