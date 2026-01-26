<!-- {root}/README.md -->

<p align="center">
  <img src="docs/assets/readme-banner.svg" alt="TaskMaster" width="100%" />
</p>

<p align="center">
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white"></a>
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-19.x-087EA4?logo=react&logoColor=white"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white"></a>
  <a href="https://chakra-ui.com/"><img alt="Chakra UI" src="https://img.shields.io/badge/Chakra%20UI-3.x-319795?logo=chakraui&logoColor=white"></a>
  <a href="https://zustand-demo.pmnd.rs/"><img alt="Zustand" src="https://img.shields.io/badge/Zustand-5.x-000000"></a>
  <a href="https://docs.amplify.aws/"><img alt="AWS Amplify" src="https://img.shields.io/badge/AWS%20Amplify-Gen%201-FF9900?logo=amazonaws&logoColor=white"></a>
</p>

# TaskMaster

TaskMaster is a task app prototype built with **Vite + React 19 + TypeScript + Chakra UI**, backed by **AWS Amplify** (**Cognito Auth + AppSync GraphQL + DynamoDB**) and a **Zustand** state architecture.

The UI is **store-driven**:
- Reads go through Zustand hooks/selectors
- Writes go through store actions → `taskmasterApi` → GraphQL
- A persisted local cache (with TTL refresh) makes reloads fast

---

## ✨ Features

- Authenticated app shell (sidebar + top bar)
- Task lists + tasks (GraphQL-backed)
- Task details “pane stack” navigation (deep-linkable)
- Updates feed + read markers (local/persisted UX state)
- Dev-only GraphQL smoke testing route (`/dev`)

---

## 📸 Screenshots

<p align="center">
  <img src="docs/assets/inbox-page-screenshot.png" alt="Inbox page" width="48%" />
  <img src="docs/assets/tasks-page-screenshot.png" alt="Tasks page" width="48%" />
</p>

---

## 🧱 Tech stack

- React 19 + TypeScript + Vite
- Chakra UI (UI primitives)
- React Router v7 (`react-router-dom`)
- Zustand (client state + persisted caches)
- AWS Amplify Gen 1
  - Cognito (Auth)
  - AppSync GraphQL + DynamoDB (`@model`)

---

## 🚀 Quickstart

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

---

## 🧭 Key implementation locations

- App bootstrapping: [src/main.tsx](src/main.tsx)
- Route table: [src/App.tsx](src/App.tsx)
- Shared layout shell: [src/layout/AppShell.tsx](src/layout/AppShell.tsx)
- Tasks/lists store (cache + actions): [src/store/taskStore.ts](src/store/taskStore.ts)
- Pane-stack list details UI: [src/pages/ListDetailsPage.tsx](src/pages/ListDetailsPage.tsx)
- GraphQL API wrapper boundary: [src/api/taskmasterApi.ts](src/api/taskmasterApi.ts)

---

## 🧠 Why this architecture?

This repo optimizes for **predictable data flow** and **fast UI iteration**:

- **UI stays simple**: pages/components read via hooks/selectors and don’t import the API wrapper directly.
- **One write path**: UI → store actions → `taskmasterApi` → GraphQL.
- **Fast reloads**: persisted caches + TTL mean the app can render instantly and refresh in the background.
- **Fewer re-render footguns**: stable selector snapshots reduce unnecessary renders and play nicely with React’s external store semantics.

Mini-diagram:

```mermaid
flowchart LR
  UI[React UI\n(pages/components)] -->|read via hooks/selectors| Store[Zustand stores\n(taskStore, inbox, updates)]
  UI -->|mutations via actions| Store

  Store --> API[taskmasterApi\n(GraphQL wrapper)]
  API --> AppSync[AppSync GraphQL]
  AppSync --> DB[(DynamoDB)]

  Store <--> Cache[(localStorage\nTTL cache)]
```

## 🧩 Routing model (pane stack)

The list details view supports an “infinite pane stack” encoded in the URL:

- Base list views: `/lists` and `/lists/:listId`
- Pane stack route: `/lists/:listId/tasks/*`
  - The `*` splat encodes a stack of selected task IDs as path segments.
  - Example: `/lists/inbox/tasks/t1/t3`

---

## 💾 Local persistence (client cache)

Some state is cached in `localStorage` to make reloads fast and UX smoother.

Reset keys (useful when debugging “stuck” UI):
- `taskmaster:taskStore`
- `taskmaster:inbox`
- `taskmaster:updates`

---

## 📚 Documentation

Start here:
- Docs index: [docs/INDEX.md](docs/INDEX.md)

Common entry points:
- Local setup: [docs/SETUP.md](docs/SETUP.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Glossary: [docs/glossary.md](docs/glossary.md)
- Product spec: [docs/product-spec.md](docs/product-spec.md)
- Troubleshooting: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Deployment: [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)
- Security: [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md)
- Offline mode design (planned): [docs/offline-mode-design.md](docs/offline-mode-design.md)

---

## 🗺️ Planning

- Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)
- Milestones: [docs/MILESTONES.md](docs/MILESTONES.md)

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

See [LICENSE](LICENSE).