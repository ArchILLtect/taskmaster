<!-- {root}/docs/README.md -->

# TaskMaster – Design & Architecture Docs

This directory contains **intentional design documents** for TaskMaster.

These docs exist so future work is:
- planned
- consistent
- not rediscovered through trial-and-error

If you’re reading this months later: start here.

---

## 🧭 Planning Docs

These documents define **what gets built, and when**.

- **ROADMAP.md**  
  Overall direction and sequencing of work.

- **MILESTONES.md**  
  Phase-based checkpoints (MVP → Post-MVP → Offline).

Start with these before diving into implementation details.

> If something feels “missing,” it’s probably deferred — not forgotten.

## 📘 Offline Mode (Planned)

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

---

## Philosophy

- MVP favors **correctness and simplicity**
- Advanced features are **designed first, built later**
- Docs exist to reduce future cognitive load

If a feature feels “missing,” check here before assuming it was forgotten.