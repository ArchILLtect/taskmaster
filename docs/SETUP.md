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

### Reset local state (localStorage)

If the UI looks “stuck” (stale cached tasks, odd inbox dismissals, etc.), clear the persisted keys in browser devtools → Application → Local Storage:

- `taskmaster:taskStore` (tasks/lists cache with TTL)
- `taskmaster:inbox` (inbox preferences/dismissals)
- `taskmaster:updates` (updates event feed + read markers)

## Notes

- `npm run build` runs TypeScript project references (`tsc -b`) and then `vite build`.
- If `npm run dev` exits unexpectedly, re-run it and check the first error printed in the terminal (it’s often the most actionable signal).
