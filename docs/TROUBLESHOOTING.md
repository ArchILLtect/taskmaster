# Troubleshooting / FAQ

## The app looks “stuck” after I change data
TaskMaster uses persisted Zustand stores for fast reloads, and a TTL-based cache for tasks/lists. If something looks stale, it’s usually one of:

- You’re seeing cached task data (it will refresh automatically when stale).
- A local persisted UX setting is hiding content (e.g., Inbox dismissals).

## I clicked “Remove sample data” — can I undo it?
Not from within the app.

“Remove sample data” deletes demo-marked lists/tasks and disables future auto-seeding in the current browser/profile.
If you still want data that *behaves like demo data*, the recommended approach is to create your own temporary lists/tasks and prefix them with a clear tag like `Demo:` (for example, `Demo: Fake task`).

## React “Maximum update depth exceeded” / `getSnapshot` warning (Zustand)
If the app loads and then immediately freezes or white-screens, and the console shows something like:

- `The result of getSnapshot should be cached to avoid an infinite loop`
- `Uncaught Error: Maximum update depth exceeded`

…the most common cause is a Zustand selector that returns a **new object/array literal** every render.

Bad (unstable snapshot):
- `useStore((s) => ({ a: s.a }))`

Good:
- `useStore((s) => s.a)` (primitive)
- `useStore((s) => s.setA)` (function)

If you truly need multiple fields:
- Prefer a dedicated “view hook” that returns cached references (see the patterns in `src/store/taskStore.ts` / `src/store/inboxStore.ts`).
- Or use `zustand/shallow` with a stable selector.

## Reset local state (recommended during development)
TaskMaster persists a small amount of state in `localStorage`.

Most keys are **scoped per signed-in user** (to avoid cross-user cache flashes on shared browsers).

Common keys you’ll see:
- `taskmaster:authScope` (current auth scope marker used for scoping)
- `taskmaster:u:<scope>:zustand:taskmaster:taskStore` (tasks/lists cache with TTL)
- `taskmaster:u:<scope>:zustand:taskmaster:inbox` (Inbox triage dismissal state)
- `taskmaster:u:<scope>:zustand:taskmaster:updates` (Updates event feed + read markers)
- `taskmaster:u:<scope>:zustand:taskmaster:user` (cached user display info)
- `taskmaster:u:<scope>:zustand:taskmaster:localSettings` (sidebar width + default routes + due-soon window)
- `taskmaster:u:<scope>:inboxListId` (system Inbox list id mapping)

Other UX keys:
- `taskmaster:storageDisclosureAck:v1` (storage disclosure banner dismissal)
- `taskmaster:u:<scope>:tip:*` (dismissed tips)

To reset:
1. Open browser devtools → Application/Storage → Local Storage.
2. Remove keys by prefix (recommended): `taskmaster:u:`.
3. Refresh the page.

Tip: If you only want to reset tasks/lists cache (but keep UX state), clear only `taskmaster:u:<scope>:zustand:taskmaster:taskStore`.

## `npm run dev` exits immediately
If `npm run dev` exits with code 1:

1. Re-run `npm run dev` and read the *first* error line (it’s usually the real root cause).
2. If it’s a TypeScript error, try `npm run build` to get the full typecheck output.
3. If it’s a dependency/Vite error, delete `node_modules` and reinstall: `npm install`.

## Playwright E2E report keeps the process running

If you run Playwright with the HTML reporter, it can start a report server (often on `http://localhost:9323`) and keep the process alive.

Recommended workflow:
- Run smoke in the terminal (exits when done): `npm run test:e2e`
- If you want the HTML report:
	- `npm run test:e2e:html`
	- `npm run test:e2e:report`

## I can’t access the Admin console (`/admin`)
The Admin console is intentionally restricted.

Expected behavior:
- The Admin link appears in the TopBar only when your user role resolves to `Admin`.
- Navigating to `/admin` as a non-admin should not load admin data.

If you believe you *should* be an admin:
1. Confirm your Cognito user is in the `Admin` group for the current environment.
2. Sign out and sign back in (group membership changes may not reflect until a fresh session).
3. Clear the cached user display/role key and refresh:
	- `taskmaster:u:<scope>:zustand:taskmaster:user`

Notes:
- The Admin console is currently **read-only** (inspection/debug only). Editing/deleting items from `/admin` is intentionally deferred.

## Admin console shows “Safe mode” for accounts
If the Admin page shows a “Safe mode” badge while listing accounts, it usually means some legacy `UserProfile` rows don’t match the latest schema (for example, missing a now-required `email`).

What to do:
- This is expected for legacy data; safe mode keeps the Admin view usable.
- Have the affected user sign in once: the bootstrap flow opportunistically self-heals missing `UserProfile.email` / `displayName` when possible.

## I updated a task but Updates didn’t change
Updates events are appended after successful task mutations (create/update/delete). If you don’t see an expected event:

- Confirm the mutation succeeded (check network tab and UI toast).
- Clear `taskmaster:u:<scope>:zustand:taskmaster:updates` to reset the feed.
- Note: some updates may be categorized as “task_updated” vs “task_completed/reopened” depending on what fields changed.

## Time zones / due dates
The Add Task form uses the user’s local timezone when computing the minimum date.
- See [src/components/AddTaskForm.tsx](../src/components/AddTaskForm.tsx)

Time-handling is centralized under [src/services/dateTime.ts](../src/services/dateTime.ts) (timezone detection + day-key helpers) to keep overdue/due-today logic consistent.

## Amplify CLI on Windows: `amplify push` “does nothing”
Symptom:
- You run `amplify push` and it appears to hang / instantly returns with no meaningful output.

One known cause (seen March 2026) is Windows security blocking the Amplify CLI’s downloaded helper executable.

What to check:
- Amplify CLI uses a wrapper that can download an `amplify.exe` under your user profile (for example under `~/.amplify/bin/`).
- On some Windows 11 configurations, Smart App Control / Application Control can block running that downloaded binary.

Fix:
- If you’re blocked by Windows security, allow the binary (or temporarily disable the feature) and retry.
- After it’s unblocked, `amplify status` and `amplify push` should behave normally again.

Notes:
- This is an OS policy issue, not an Amplify backend issue.
- If you want higher confidence, run `amplify --version` and ensure it prints normally.

## `amplify push` exits with “User pool client does not exist” (Cognito drift)

### What happened (March 2026 incident)
`amplify push` successfully deployed resources, but then exited non-zero with an error like:
- `User pool client does not exist`

Root cause:
- The Amplify Auth nested stack outputs included two Cognito app client ids:
	- `AppClientIDWeb` (used by the web app)
	- `AppClientID` (a non-web app client)
- The non-web client referenced by `AppClientID` had been deleted in the Cognito User Pool.
- The web client still existed, so the running web app continued to work.
- The Amplify CLI, however, tried to validate/describe both clients during the push workflow and failed when it hit the missing one.

This is classic “drift”: CloudFormation outputs / local Amplify metadata pointed at a resource that no longer exists.

### Diagnose
Use PowerShell (avoid `cmd /c` for these commands; quoting can get mangled and you’ll see `Unknown options: arn:aws:cloudformation:...`).

1) Identify the root stack name and region:
- Root stack is typically `amplify-<app>-<env>-<hash>`.

2) Find the nested auth stack ARN (example query):
```powershell
$region='us-east-2'
$rootStack='amplify-taskmaster-dev-eadfe'

$authStackArn = aws cloudformation list-stack-resources --region $region --stack-name $rootStack --query "StackResourceSummaries[?LogicalResourceId=='authtaskmaster776070dd'].PhysicalResourceId | [0]" --output text
$authStackArn
```

3) Inspect auth stack outputs (this is where `AppClientID` / `AppClientIDWeb` come from):
```powershell
aws cloudformation describe-stacks --region $region --stack-name $authStackArn --query 'Stacks[0].Outputs' --output table
```

4) Verify whether the `AppClientID` client exists in the user pool:
```powershell
$userPoolId = aws cloudformation describe-stacks --region $region --stack-name $authStackArn --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue | [0]" --output text
$appClientId = aws cloudformation describe-stacks --region $region --stack-name $authStackArn --query "Stacks[0].Outputs[?OutputKey=='AppClientID'].OutputValue | [0]" --output text

aws cognito-idp describe-user-pool-client --region $region --user-pool-id $userPoolId --client-id $appClientId
```

If the last command throws `ResourceNotFoundException`, you’ve confirmed the drift.

### Fix (surgical cloud repair used in this incident)
This is a targeted fix intended to get `amplify push` back to clean exits without changing the web client.

High-level idea:
- Update the deployed auth stack template to create a replacement app client.
- Repoint the auth stack output `AppClientID` to that new client.
- Update the nested auth stack so the new output value is real.

Important:
- This approach modifies the **deployed** CloudFormation template in the Amplify deployment bucket, then runs a stack update.
- Treat it as an “emergency repair” procedure; it’s effective but more manual than a normal `amplify update auth` flow.

Steps:

1) Determine the deployment bucket name.
- It’s usually visible in the root stack resources as `DeploymentBucket`.
- You can also look in `amplify/team-provider-info.json` for the env’s `DeploymentBucketName`.

2) Download the deployed auth template from the deployment bucket.
The key is typically:
- `amplify-cfn-templates/auth/<authResourceName>-cloudformation-template.json`

3) Patch the template:
- Add a new `AWS::Cognito::UserPoolClient` resource (for example `UserPoolClientFixed`) cloned from the existing client config.
- Ensure the new client has a distinct `ClientName` (append `_fixed`).
- Update `Outputs.AppClientID` to `Ref: UserPoolClientFixed`.

4) Upload the patched template back to the same S3 key.

5) Run a CloudFormation update on the nested auth stack using the template URL.
```powershell
$templateUrl = "https://<deployment-bucket>.s3.<region>.amazonaws.com/amplify-cfn-templates/auth/<auth>-cloudformation-template.json"

# Reuse all existing stack parameters
$paramKeysText = aws cloudformation describe-stacks --region $region --stack-name $authStackArn --query "Stacks[0].Parameters[].ParameterKey" --output text
$paramArgs = @(); foreach ($k in ($paramKeysText -split "\s+")) { if ($k) { $paramArgs += "ParameterKey=$k,UsePreviousValue=true" } }

aws cloudformation update-stack --region $region --stack-name $authStackArn --template-url $templateUrl --capabilities CAPABILITY_NAMED_IAM --parameters $paramArgs
aws cloudformation wait stack-update-complete --region $region --stack-name $authStackArn
```

6) Verify outputs and the new client exists:
```powershell
aws cloudformation describe-stacks --region $region --stack-name $authStackArn --query 'Stacks[0].Outputs' --output table

$newAppClientId = aws cloudformation describe-stacks --region $region --stack-name $authStackArn --query "Stacks[0].Outputs[?OutputKey=='AppClientID'].OutputValue | [0]" --output text
aws cognito-idp describe-user-pool-client --region $region --user-pool-id $userPoolId --client-id $newAppClientId --query 'UserPoolClient.ClientName' --output text
```

7) Re-run `amplify push`.
- In the incident, this removed the CLI error and `amplify push --yes` completed normally.

### Why the web app kept working
The frontend uses the web client id (`AppClientIDWeb`, exported as `aws_user_pools_web_client_id`). As long as that client exists, normal web sign-in flows continue to work.

The CLI failure was coming from the missing non-web `AppClientID`, not from the web client.
