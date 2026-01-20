# Security & Legal Checklist

This is a lightweight checklist appropriate for a client-first prototype that plans to adopt Cognito + AppSync.

## App security (frontend)
- [ ] No secrets in the frontend bundle (API keys, private credentials).
- [ ] Dependencies kept up to date (`npm audit` periodically).
- [ ] Avoid storing sensitive user data in `localStorage`.

## Auth (planned)
- [ ] Cognito User Pool sign-in/out wired in the UI.
- [ ] Claims → app user mapping goes through [src/auth/mapUserFromClaims.ts](../src/auth/mapUserFromClaims.ts).
- [ ] Cognito group names are documented and consistent (e.g. `Admin`).

## GraphQL auth rules (planned)
Schema currently indicates owner + Admin group access:
- [amplify/backend/api/taskmaster/schema.graphql](../amplify/backend/api/taskmaster/schema.graphql)

- [ ] Ensure owners cannot reassign `owner` via mutation payloads.
- [ ] Ensure Admin group behavior is tested.

## Privacy / legal
- [ ] Add a privacy policy once user data is persisted remotely.
- [ ] Add cookie/storage disclosure if needed.

> TODO: Expand this checklist when the app moves beyond prototype status.
