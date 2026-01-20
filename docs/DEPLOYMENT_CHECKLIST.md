# Deployment Checklist

This project currently builds as a static frontend (Vite) and has Amplify backend scaffolding.

## Frontend (Vite SPA)
- [ ] Run `npm run build` and confirm `dist/` is produced.
- [ ] Verify routes work with your host (client-side routing needs fallback to `index.html`).
- [ ] Run `npm run preview` to validate the production build locally.

## Backend (Amplify)
- [ ] Ensure Amplify CLI is installed and configured.
- [ ] Review Amplify environment settings under `amplify/`.
- [ ] Run `amplify push` for backend changes.

> TODO: Document the exact hosting target (Amplify Hosting vs Vercel/Netlify/etc.) and required environment variables.
