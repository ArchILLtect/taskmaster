# Git hooks (optional)

This repo includes a small, optional pre-commit hook to prevent accidental commits of handwritten files under `src/graphql/` (which is treated as codegen-owned output).

## Enable

Run once (per clone):

```bash
git config core.hooksPath .githooks
```

Now `git commit` will run:

- `npm run verify:codegen-graphql`
- a safety check that fails if `src/amplifyconfiguration.json` contains `aws_appsync_apiKey`

## Disable

```bash
git config --unset core.hooksPath
```

## Why optional?

Git does not version-control hooks by default. Using `core.hooksPath` makes hooks shareable and keeps CI as the final backstop.
