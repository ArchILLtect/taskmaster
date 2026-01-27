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
Run before opening a PR (or before pushing to `main`):
```bash
npm run check
```

## Working with Amplify
- `amplify/` contains Amplify CLI output. Avoid hand-editing generated files under `amplify/backend/` unless you’re intentionally making Amplify-driven changes.

### Codegen note: `src/graphql/` is codegen-owned

Amplify codegen may overwrite files under `src/graphql/`.

- Do not hand-edit or add custom files under `src/graphql/`.
- Keep handwritten GraphQL documents outside the codegen folder (see `src/api/operationsMinimal.ts`).
- If you run Amplify/codegen or update the schema, run:

```bash
npm run verify:codegen-graphql
```

That check fails if `src/graphql/` has unexpected files, which is intentional (it prevents runtime regressions when codegen wipes the folder).

### Optional: pre-commit hook (extra safety)

If you want an extra local guardrail, enable the repo’s shared git hooks:

```bash
git config core.hooksPath .githooks
```

This runs `npm run verify:codegen-graphql` on commit.

It also blocks commits if `src/amplifyconfiguration.json` contains `aws_appsync_apiKey` (to avoid accidentally committing AppSync API keys).

## Comments
Prefer comments that explain *why* something exists (tradeoffs, constraints, invariants), not comments that restate the code.

## Pull requests
> TODO: Add branch naming + PR process once the repo is collaborative.
