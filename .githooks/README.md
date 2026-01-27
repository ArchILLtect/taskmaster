# Git hooks (optional)

This repo includes a small, optional pre-commit hook to prevent common workflow footguns.

## Enable

Run once (per clone):

```bash
git config core.hooksPath .githooks
```

Now `git commit` will run:

- `npm run verify:codegen-graphql`
- a safety check that fails if `src/amplifyconfiguration.json` contains `aws_appsync_apiKey`

The intent is to keep `src/graphql/` codegen-owned and avoid accidentally committing AppSync API keys.

## Disable

```bash
git config --unset core.hooksPath
```

## Why optional?

Git does not version-control hooks by default. Using `core.hooksPath` makes hooks shareable and keeps CI as the final backstop.
