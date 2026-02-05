# Tester Script / QA Checklist (MVP)

This checklist is designed for (a) your own pre-showcase regression sweeps and (b) external testers who may not know the codebase.

## How to use

- Pick a **role** (Demo user vs normal user vs Admin user) and a **device profile** (desktop vs mobile viewport).
- Work top-to-bottom and check items as you go.
- When you find a bug, please file it using the template at the end.

## Environment / setup

- Browser: Chrome (preferred) on Windows.
- Optional browsers: Edge, Firefox.
- Accessibility tools (optional but great):
  - Keyboard-only navigation (no mouse)
  - Windows: NVDA (free) “quick sniff” for control names
  - Chrome DevTools: Lighthouse (Accessibility), Issues panel

**Before you start**
- [ ] Confirm you can sign in.
- [ ] Open DevTools Console → confirm no obvious red errors on first load.
- [ ] (Optional) Use `Dev` page → “Clear all user caches” to test a clean-ish session.

---

## MVP-critical manual validation (3 demo-critical flows)

### Flow 1: Sign in → Inbox triage → edit task

**Goal:** verify the primary triage/edit loop is solid and keyboard-accessible.

- [ ] Sign in (or start demo).
- [ ] Navigate to **Inbox**.
- [ ] Confirm page loads with no broken layout.

**Keyboard-only checks**
- [ ] You can reach the primary controls via Tab in a sensible order.
- [ ] Focus is always visible (you never “lose” the cursor).
- [ ] Enter/Space activates buttons; Esc closes dialogs (if open).
- [ ] No focus traps (Tab/Shift+Tab always move).

**Edit loop**
- [ ] Open a task’s edit UI (wherever edit is surfaced).
- [ ] Change title and save.
- [ ] Change due date and save.
- [ ] Mark complete and verify UI updates.

**A11y name sniff test (screen reader optional)**
- [ ] Icon-only buttons announce a sensible name (or show a tooltip that matches the action).
- [ ] Collapsible sections announce a sensible label.

**Mobile viewport spot-check**
- [ ] Set viewport to ~390x844 (iPhone-ish) or similar.
- [ ] No horizontal scrolling.
- [ ] Primary actions remain reachable.


### Flow 2: Lists → open pane stack → navigate stack

**Goal:** validate the “pane stack” route pattern works and is usable.

- [ ] Navigate to **Lists**.
- [ ] Open a list.
- [ ] Click a task to open its details in the right-hand pane.
- [ ] Open a subtask (or open multiple tasks so the stack has depth).

**Keyboard-only checks**
- [ ] Task rows are reachable by keyboard.
- [ ] Opening panes doesn’t trap focus.
- [ ] Close/back behavior feels predictable (no sudden jumps).

**URL behavior**
- [ ] Refresh the page while a pane stack is open.
- [ ] Confirm the stack restores from the URL.

**Responsive checks**
- [ ] At narrow widths, panes remain usable (no unreadable overflow).


### Flow 3: Settings

**Goal:** validate key preferences are operable and properly labeled.

- [ ] Navigate to **Settings**.

**Keyboard-only checks**
- [ ] All switches/selects can be operated from the keyboard.
- [ ] Focus ring is visible and consistent.
- [ ] No missing labels (every control has a clear name).

**Autofill/name sanity**
- [ ] Inputs/selects have stable labels and names (DevTools “Issues” should not report missing label-for / missing name/id for primary fields).

---

## Core app regression (non-a11y)

### Auth / routing
- [ ] Deep-link to a protected route (e.g. `/tasks`) while signed out → you’re redirected to login.
- [ ] After login, you land where expected (redirect or default landing route).
- [ ] Sign out returns to a safe public route; no redirect loops.

### Tasks CRUD
- [ ] Create a task.
- [ ] Edit the task (title/description/due date/priority/status).
- [ ] Mark complete, then reopen.
- [ ] Delete a task.

### Lists CRUD
- [ ] Create a list.
- [ ] Rename list.
- [ ] Toggle favorite.
- [ ] Delete list (non-system list).

### Inbox triage
- [ ] Send a task to Inbox.
- [ ] Verify Inbox counts/sections update.
- [ ] Dismiss/ignore a notification if present; verify it stays dismissed.

### Updates feed
- [ ] Perform an action that generates an update (complete/reopen/edit/delete).
- [ ] Visit Updates and confirm an event appears.
- [ ] Use “Mark all read”.
- [ ] Use “Clear read”.

### Demo mode (if available)
- [ ] Start demo mode from Home/Login.
- [ ] Confirm demo seed completes and core pages render.
- [ ] Reset demo data (if surfaced) and confirm it restores.
- [ ] Remove sample/demo data from Settings (if you choose to test this): confirm it’s clearly irreversible.

### Admin (admin users only)
- [ ] Navigate to Admin.
- [ ] Load accounts.
- [ ] Select an account, load lists, load tasks.
- [ ] Confirm filtering/searching doesn’t break.

---

## Accessibility quick checks (WCAG-style “sniff tests”)

These are not a full audit, but they catch most high-impact problems quickly.

### Keyboard
- [ ] You can reach all interactive controls via Tab.
- [ ] Focus is always visible.
- [ ] No keyboard traps.
- [ ] Dialogs: focus stays within the dialog while open; Esc closes.

### Labels / names
- [ ] Form inputs have visible labels or a clear accessible name.
- [ ] Icon-only buttons have an accessible name.
- [ ] Controls that look disabled are actually disabled (and vice versa).

### Headings / structure
- [ ] Pages have a clear H1-like heading (visually).
- [ ] Sections have meaningful headings.

### Visual
- [ ] Text is readable at 100% zoom.
- [ ] At 200% zoom, you can still operate primary flows without layout breakage.

---

## Loading / error / empty-state consistency

Try at least one “bad network” scenario.

- [ ] With normal network: pages show loading spinners only briefly.
- [ ] With network disabled (DevTools → Network → Offline): core pages show a friendly error message and a Retry path.
- [ ] Empty states are understandable and provide next steps (where relevant).

---

## Bug report template (copy/paste)

**Title:**

**Environment:**
- Browser + version:
- OS:
- Account type: demo / normal / admin
- Viewport: desktop / mobile (include size)

**Steps to reproduce:**
1.
2.
3.

**Expected:**

**Actual:**

**URL at time of bug:**

**Console errors (if any):**

**Screenshots/video:**

**Notes:**
