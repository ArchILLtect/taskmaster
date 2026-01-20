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

## Debugging
- This is a client-only Vite app; use browser devtools for React component inspection and network/storage.
- Local state is persisted in `localStorage` (see “Reset local state” in [TROUBLESHOOTING.md](TROUBLESHOOTING.md)).

## Known repo-state issues (as of today)
> TODO: These are current issues in the repo; either fix them or update this list when resolved.

- `npm run build` fails due to an invalid type re-export in [src/types/index.ts](../src/types/index.ts).
- `npm run lint` can fail due to:
  - generated Amplify typings under `amplify/backend/types/*`
  - a minor `prefer-const` issue in [src/mocks/currentUser.ts](../src/mocks/currentUser.ts)

Additional issues observed during doc work:
- `npm run build` fails in [src/API.ts](../src/API.ts) with `TS1294` when `erasableSyntaxOnly` is enabled (enums are not allowed).
- `npm run build` fails in [src/dev/GraphQLSmokeTest.tsx](../src/dev/GraphQLSmokeTest.tsx) due to a deep type comparison error.
- `npm run lint` fails on `no-explicit-any` in Amplify-generated artifacts (example: [src/aws-exports.d.ts](../src/aws-exports.d.ts), [src/dev/GraphQLSmokeTest.tsx](../src/dev/GraphQLSmokeTest.tsx)).
