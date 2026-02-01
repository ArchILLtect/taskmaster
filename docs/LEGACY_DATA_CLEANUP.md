# Legacy Data Cleanup (Post‑MVP)

This doc is a practical checklist for detecting and removing **legacy records** that violate newer schema assumptions (especially non-null fields like `isDemo`).

The app currently contains **safe fallbacks** that intentionally omit some fields from GraphQL selection sets when older records might break non-null constraints.
After MVP, the goal is to (1) detect whether any legacy data still exists, (2) fix or purge it, and then (3) remove the fallbacks so the app can always query the “full” shape.

---

## What “legacy data” means here

A record is “legacy” if it was created before a schema requirement was enforced and it can:
- return `null` for fields now treated as required/non-null, or
- break queries when the field is selected (e.g. AppSync error: `Cannot return null for non-nullable type ...`).

Common symptoms:
- Queries that include a now-required field hard-fail.
- The UI falls back to “safe mode” queries that omit the field.
- The UI can’t accurately display or filter on the field (example: demo badges or admin filters).

---

## Current known legacy-sensitive fields

### `Task.isDemo` and `TaskList.isDemo`
- The normal UI wants `isDemo` so it can label demo content.
- Some legacy items may be missing `isDemo`, which can hard-fail AppSync queries if `isDemo` is selected.
- For resilience, the API layer can fall back to “safe” minimal queries that omit `isDemo`.

### `UserProfile.email`
- Admin tooling already has a safe fallback for legacy `UserProfile` records missing required `email`.

---

## How to detect whether legacy records still exist

Use **at least two** signals before deciding you’re “clean.”

### 1) In-app Admin diagnostics (fastest)
- Visit the Admin page and look for the `isDemo` mode indicators:
  - **“isDemo full”**: queries are selecting `isDemo` successfully.
  - **“isDemo safe”**: the app had to fall back because selecting `isDemo` caused a non-null error.

If you see “safe”, you still have at least one legacy record *somewhere* (or you’re pointed at an environment that does).

### 2) Watch for GraphQL errors
Search logs (browser console, or any centralized log sink) for:
- `Cannot return null for non-nullable type`
- and the field name (e.g. `isDemo`, `email`)

If these occur in production/staging, you still have legacy rows (or inconsistent backfills).

### 3) Backend scan/query (most definitive)
Post-MVP, add/execute an admin-only scan process to identify and count problematic items:
- Scan all `Task` and `TaskList` records and check for missing/invalid `isDemo`.
- Scan all `UserProfile` records and check for missing/invalid `email`.

Notes:
- Prefer a controlled admin script (or Lambda) with explicit environment selection.
- Output counts + a small sample of ids to verify the scan is real.

---

## What to do if legacy records exist

### Option A (preferred): backfill missing fields
Goal: keep continuity for existing testers/data.

Recommended approach:
- Run a one-time backfill:
  - For any missing `isDemo`: set `isDemo = false`.
  - For any missing required `email` (if needed): set a safe placeholder or derive from identity if possible.
- Re-run detection steps until:
  - Admin shows `isDemo full` consistently.
  - No “Cannot return null…” errors show up.

Then cleanup:
- Remove the safe fallbacks (so the app always selects full fields).
- (Optional) remove any “safe mode” UI warnings.

### Option B (nuke/reset): purge data and recreate accounts
Goal: guarantee no legacy records remain.

This can be a legitimate “hard reset” strategy if you’re still pre-launch and don’t care about preserving test data.

High-level steps (document exact commands/procedure per env):
- Delete existing Cognito users (Admin + testers).
- Purge AppSync/DynamoDB data for the relevant models.
- Recreate Admin + testers.
- Ensure fresh-seeded demo data includes all required fields.

Safety guardrails:
- Triple-check environment: you must be 100% sure you’re operating on the intended Amplify env.
- Take a snapshot/export first if you want any chance of recovery.

---

## When it’s safe to remove fallbacks

Remove “safe query” fallbacks only when:
- Admin consistently shows “full” mode (no more safe mode), and
- a backend scan reports **zero** legacy violations, and
- you’ve had at least one full “test cycle” (sign-in, seed, list pages, tasks pages, admin) without any non-null errors.

---

## Quick decision rubric

If you want to preserve tester history → backfill.

If you want maximum certainty before launch and you’re ok losing all existing test data → purge/reset.
