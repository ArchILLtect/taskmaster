# Deployment Checklist

TaskMaster consists of:
- A Vite + React SPA frontend
- An AWS Amplify (Gen 1) backend: Cognito Auth + AppSync GraphQL + DynamoDB

This checklist is intentionally host-agnostic (Amplify Hosting, Vercel, Netlify, S3/CloudFront, etc.).

---

## 1) Pre-flight (local)

- [ ] Install dependencies: `npm install`
- [ ] Lint + build:
	- `npm run lint`
	- `npm run build` (runs `tsc -b` then `vite build`)
- [ ] Smoke test the production bundle locally: `npm run preview`
- [ ] Confirm the app bootstraps Amplify config via [src/amplifyConfig.ts](../src/amplifyConfig.ts).

---

## 2) Backend (Amplify)

If you changed the GraphQL schema, auth rules, or any Amplify resources:

- [ ] Ensure Amplify CLI is installed and you are authenticated in AWS.
- [ ] Confirm which environment you are deploying:
	- `amplify env list`
	- `amplify env checkout <env>` (if needed)
- [ ] Review pending changes: `amplify status`
- [ ] Deploy backend changes: `amplify push`
- [ ] Verify AppSync schema/auth rules in the deployed environment match:
	- [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)

Optional but recommended:
- [ ] Run the dev-only GraphQL smoke test page after deploy (route: `/dev`).

---

## 3) Frontend hosting

### A) Amplify Hosting (recommended)

- [ ] Connect the repo/branch in Amplify Hosting.
- [ ] Set build settings:
	- Install: `npm ci` (or `npm install`)
	- Build: `npm run build`
	- Output: `dist`
- [ ] Ensure SPA routing rewrite is enabled (all routes → `/index.html`).

### B) Other static hosting (Vercel/Netlify/S3+CloudFront)

- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Configure SPA fallback:
	- All non-asset routes should serve `index.html` (React Router v7).

### Config / environments

- [ ] Ensure the deployed bundle has the correct Amplify environment configuration.
	- The app loads Amplify config from generated exports (`src/aws-exports.js`).
	- If switching environments, run `amplify pull` before building so exports match.

---

## 4) Environment matrix (dev / staging / prod)

Keep these expectations explicit so deployments are repeatable and debugging is faster.

For each environment, record:

- [ ] Amplify env name: `amplify env list` → `amplify env checkout <env>`
- [ ] Frontend host URL (and custom domain, if any)
- [ ] Auth posture:
	- [ ] Self-signup enabled/disabled
	- [ ] MFA policy (off / optional / required)
	- [ ] Admin group exists and is assigned intentionally (`Admin`)
- [ ] Data posture:
	- [ ] This environment contains real user data? (yes/no)
	- [ ] If no, confirm it’s safe to reset/seed by recreating the Amplify env

Suggested defaults:

- **dev**
	- Fast iteration; may allow self-signup
	- Can be reset freely (treat as disposable)
	- Dev-only routes are allowed (e.g. `/dev`)
- **staging**
	- Mirrors production configuration as closely as possible
	- Used for release candidate testing
	- Optional: restrict self-signup
- **prod**
	- No experimental flags
	- Strongest auth policy you’re comfortable with (consider MFA)
	- Monitoring/alerting enabled (if applicable)
	- Dev-only routes should be disabled by convention

---

## 5) Post-deploy verification

### Core flows
- [ ] Sign in/out works (Authenticator shell loads and session persists as expected).
- [ ] Lists load and render.
- [ ] Create a task, update it, mark it Done/Open; refresh the page and confirm data persists.
- [ ] Deep link a list/task route and hard-refresh:
	- `/lists/:listId/tasks/*` continues to work with host fallback rules.
- [ ] If Admin is enabled, confirm `/admin` loads for an Admin user and does not load for non-admin users.

### Client cache sanity

The app uses persisted local caches (for faster reload) and will rebuild derived indexes on hydration.

- [ ] If you made breaking changes to persisted store shapes, bump the persist version(s) in:
	- [src/store/taskStore.ts](../src/store/taskStore.ts)
- [ ] If you see “stuck” UI after deploy, validate that clearing these keys resolves it:
	- `taskmaster:taskStore`
	- `taskmaster:inbox`
	- `taskmaster:updates`

---

## 6) Rollback & recovery

- [ ] Frontend rollback: redeploy the previous commit/build artifact.
- [ ] Backend rollback: prefer forward-fixes; if a rollback is required, coordinate via Amplify environments and schema migrations.
- [ ] If a rollback changes client cache formats, communicate that users may need to clear persisted localStorage keys.
