# Contributing

Thanks for contributing to TaskMaster.

## Quick start
```bash
npm install
npm run dev
```

## Project conventions (high signal)
- Chakra UI is the UI primitive library; prefer Chakra components over raw HTML.
- Use `RouterLink` (wrapper around React Router `NavLink`) for navigation elements that need active-state styling.
  - See [src/components/RouterLink.tsx](src/components/RouterLink.tsx)
- Keep list/task navigation compatible with the “pane stack” route design.
  - See [src/pages/ListDetailsPage.tsx](src/pages/ListDetailsPage.tsx)

## Code quality
Run before opening a PR:
```bash
npm run lint
npm run build
```

## Working with Amplify
- `amplify/` contains Amplify CLI output. Avoid hand-editing generated files under `amplify/backend/` unless you’re intentionally making Amplify-driven changes.

## Comments
Prefer comments that explain *why* something exists (tradeoffs, constraints, invariants), not comments that restate the code.

## Pull requests
> TODO: Add branch naming + PR process once the repo is collaborative.
