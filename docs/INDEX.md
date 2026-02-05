## Documentation Index

This repo uses Markdown “living docs” stored alongside the code.

This directory contains **current architecture docs** and **intentional design docs** for TaskMaster.

### TaskMaster – Docs Map

#### Recommended start

- New to the repo: [README.md](../README.md) → [SETUP.md](SETUP.md)
- Want the “how it works” overview: [ARCHITECTURE.md](ARCHITECTURE.md)
- Debugging weird state/caches: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Want the MVP test script: [TESTER_SCRIPT.md](TESTER_SCRIPT.md)

These docs exist so work stays:
- correct (matches current implementation)
- planned (future work is intentional)
- consistent (shared patterns + boundaries)

#### 🧭 <u>Planning Docs</u>:

These documents define **what gets built, and when**.

- **[ROADMAP.md](ROADMAP.md)**: Overall direction and sequencing of work.
- **[MILESTONES.md](MILESTONES.md)**: Phase-based checkpoints (MVP → Post-MVP → Offline).

Start with these before diving into implementation details.

> If something feels “missing,” it’s probably deferred — not forgotten.

#### 📘 <u>Offline Mode (Planned)</u>:

**File:** `offline-mode-design.md`  
**Status:** Not implemented

Describes the complete offline-capable architecture, including:
- Zustand as client source of truth
- GraphQL as server source of truth
- IndexedDB caching
- Offline mutation queue
- Sync + conflict resolution
- UX expectations while offline

This document should be followed when offline mode is implemented.

#### <u>Philosophy</u>

- MVP favors **correctness and simplicity**
- Advanced features are **designed first, built later**
- Docs exist to reduce future cognitive load

If a feature feels “missing,” check here before assuming it was forgotten.

---

### Tutorials / onboarding
- Getting Started: [README.md](../README.md)
- Local setup: [SETUP.md](SETUP.md)
- Contributing: [CONTRIBUTING.md](../CONTRIBUTING.md)

### Testing / QA
- Manual MVP tester checklist: [TESTER_SCRIPT.md](TESTER_SCRIPT.md)
- E2E smoke + a11y (Playwright + axe): see [SETUP.md](SETUP.md)

### How-to guides
- Troubleshooting & resets: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Admin
- Admin console overview (current behavior + limitations): [ARCHITECTURE.md](ARCHITECTURE.md)

### Reference
- Data model: [DATA_MODEL.md](DATA_MODEL.md)
- Product spec (rules of the universe): [product-spec.md](product-spec.md)
- Glossary: [glossary.md](glossary.md)
- API reference (current + planned): [API.md](API.md)
- Style guide (UI + code patterns): [STYLE_GUIDE.md](STYLE_GUIDE.md)

### Explanations
- Architecture overview: [ARCHITECTURE.md](ARCHITECTURE.md)
- Offline mode design (planned): [offline-mode-design.md](offline-mode-design.md)
- License: [LICENSE](../LICENSE)

### Planning
- Roadmap: [ROADMAP.md](ROADMAP.md)
- Milestones: [MILESTONES.md](MILESTONES.md)
- PRD: [PRD.md](PRD.md)
- Risk register: [RISK_REGISTER.md](RISK_REGISTER.md)

### Checklists
- [LEGACY_DATA_CLEANUP](./LEGACY_DATA_CLEANUP.md)

- Security & legal: [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

