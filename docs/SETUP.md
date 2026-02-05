# Setup & Local Development

This guide gets you from zero knowledge to running TaskMaster locally.

## Prerequisites
- Node.js + npm (this repo includes a `package-lock.json`, so npm is the default)
- Git

## Install
```bash
npm install
```

## Run the app
```bash
npm run dev
```
- Vite will print the local URL (typically `http://localhost:5173`).

## Quality checks
```bash
npm run lint
npm run build
```

## E2E smoke tests (Playwright)

The repo includes minimal automated smoke coverage (desktop + mobile) and an axe-based a11y scan.

```bash
# first time only
npm run test:e2e:install

# run tests (terminal output; exits when complete)
npm run test:e2e

# optional: HTML report
npm run test:e2e:html
npm run test:e2e:report
```

Notes:
- E2E runs start a local Vite dev server automatically.
- The smoke suite uses a test-only auth bypass so it can run without live AWS connectivity.

## Debugging
- This is a client-only Vite app; use browser devtools for React component inspection and network/storage.
- Local state is persisted in `localStorage` (see “Reset local state” in [TROUBLESHOOTING.md](TROUBLESHOOTING.md)).

### Reset local state (localStorage)

If the UI looks “stuck” (stale cached tasks, odd inbox dismissals, etc.), clear the persisted keys in browser devtools → Application → Local Storage:

TaskMaster scopes most persisted keys per signed-in user to prevent cross-user cache flashes.

Recommended reset options:

1) **Full local reset (dev-friendly):** remove all keys with prefix `taskmaster:u:`.
2) **Targeted reset:** remove only the current user’s scoped Zustand keys, for example:
	- `taskmaster:u:<scope>:zustand:taskmaster:taskStore`
	- `taskmaster:u:<scope>:zustand:taskmaster:inbox`
	- `taskmaster:u:<scope>:zustand:taskmaster:updates`
	- `taskmaster:u:<scope>:zustand:taskmaster:user`
	- `taskmaster:u:<scope>:zustand:taskmaster:localSettings`

Other useful keys:
- `taskmaster:authScope` (current storage scope identity)
- `taskmaster:storageDisclosureAck:v1` (storage disclosure banner dismissal)
- `taskmaster:u:<scope>:inboxListId` (system inbox list id mapping)

## Notes

- `npm run build` runs TypeScript project references (`tsc -b`) and then `vite build`.
- If `npm run dev` exits unexpectedly, re-run it and check the first error printed in the terminal (it’s often the most actionable signal).

### Amplify/codegen workflow

- `src/graphql/` is treated as codegen-owned output.
- Handwritten GraphQL documents live outside it (see `src/api/operationsMinimal.ts`).
- After any schema/codegen changes, run `npm run verify:codegen-graphql`.
