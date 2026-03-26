# Frontend/Backend Tech Stack Guide

This document explains the project architecture, tech stack, and how to extend key parts (routing, sidebar, APIs, and state).

## Frontend Overview

- Framework: React 19 + TypeScript
- Build tool: Vite
- Routing: React Router
- Server state: TanStack Query
- Global UI state: Zustand
- UI: shadcn/ui (Radix UI primitives)
- Styling: Tailwind CSS + tailwindcss-animate
- Icons: lucide-react
- Dates: date-fns
- Notifications: sonner
- HTTP client: axios
- API validation: zod
- Mock API: MSW + faker + @mswjs/data

Key dependencies live in [frontend/package.json](../package.json).

## Layout and Routing

All authenticated pages are wrapped by a shared layout. The layout renders a shadcn sidebar and a top header for the content area.

- Routes: [frontend/src/app/routes.tsx](../src/app/routes.tsx)
- Layout: [frontend/src/components/layout/AppShell.tsx](../src/components/layout/AppShell.tsx)

Routing flow:

1) `/login` renders the login page.
2) All other routes go through `RequireAuth` and render inside `AppShell`.
3) `AppShell` provides the sidebar + header and renders the route content via `Outlet`.

## Sidebar (shadcn/ui)

The sidebar is implemented using the shadcn `Sidebar` component:

- Component: [frontend/src/components/ui/sidebar.tsx](../src/components/ui/sidebar.tsx)
- Usage in layout: [frontend/src/components/layout/AppShell.tsx](../src/components/layout/AppShell.tsx)

### How it works

- Desktop: Sidebar is always visible (offcanvas collapse is supported).
- Mobile: Sidebar becomes a slide-in sheet.
- Trigger: `SidebarTrigger` toggles open/closed state.

### Add a new sidebar item

Edit the `navItems` array in [frontend/src/components/layout/AppShell.tsx](../src/components/layout/AppShell.tsx).
Each item defines:

- `to`: route path
- `label`: display name
- `icon`: lucide-react icon
- `roles`: which roles can see it

Example:

```tsx
{
  to: '/reports',
  label: 'レポート',
  icon: BarChart3,
  roles: ['leader', 'safety_manager'],
}
```

Then create the page component and add the route in [frontend/src/app/routes.tsx](../src/app/routes.tsx).

## State Management

The target split is:

- TanStack Query for API-backed server state
- Zustand for auth, drafts, and cross-page UI state

Examples:

- Auth state: [frontend/src/stores/authStore.ts](../src/stores/authStore.ts)
- Work data: [frontend/src/stores/workStore.ts](../src/stores/workStore.ts)
- Risk registry: [frontend/src/stores/riskRegistryStore.ts](../src/stores/riskRegistryStore.ts)
- Incidents: [frontend/src/stores/incidentStore.ts](../src/stores/incidentStore.ts)
- Work explorer UI filters: [frontend/src/stores/workExplorerStore.ts](../src/stores/workExplorerStore.ts)

Pattern:

- Query factories own `queryKey` and `queryFn`.
- Mutation factories own invalidation rules.
- Zustand should not be the long-term owner of server response caches.
- Errors are normalized through [frontend/src/lib/api/client.ts](../src/lib/api/client.ts).

## API Layer

HTTP calls live under `frontend/src/lib/api`.

- Base client: [frontend/src/lib/api/client.ts](../src/lib/api/client.ts)
- Query client: [frontend/src/lib/api/queryClient.ts](../src/lib/api/queryClient.ts)
- Query keys: [frontend/src/lib/api/queryKeys.ts](../src/lib/api/queryKeys.ts)
- Zod schemas: [frontend/src/lib/api/schemas](../src/lib/api/schemas)
- Query factories: [frontend/src/lib/api/queries](../src/lib/api/queries)
- Auth: [frontend/src/lib/api/auth.ts](../src/lib/api/auth.ts)
- Works: [frontend/src/lib/api/works.ts](../src/lib/api/works.ts)
- Risks (registry): [frontend/src/lib/api/riskRegistry.ts](../src/lib/api/riskRegistry.ts)
- Incidents: [frontend/src/lib/api/incidents.ts](../src/lib/api/incidents.ts)
- Manuals: [frontend/src/lib/api/manuals.ts](../src/lib/api/manuals.ts)
- Meetings: [frontend/src/lib/api/meetings.ts](../src/lib/api/meetings.ts)
- My Works: [frontend/src/lib/api/myWorks.ts](../src/lib/api/myWorks.ts)

Env:

- `VITE_API_BASE_URL` (defaults to `http://localhost:8000`)

## Frontend Architecture Rules

See [frontend/docs/FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) for the current target rules:

- `zod` is the contract source of truth
- `axios` is the only HTTP transport
- `TanStack Query` owns server state
- `Zustand` owns UI/auth/editor state
- missing backend APIs are implemented in MSW first when required by the frontend

## Styling

- Tailwind CSS configured in [frontend/tailwind.config.js](../tailwind.config.js)
- Global styles: [frontend/src/index.css](../src/index.css)
- shadcn components: [frontend/src/components/ui](../src/components/ui)

## Backend Overview

- Framework: FastAPI
- ORM: SQLModel (SQLAlchemy)
- DB: SQLite (local)
- Auth: JWT (python-jose)
- Password hashing: passlib

Dependencies are defined in [backend/pyproject.toml](../../backend/pyproject.toml).

### Server entry

- [backend/main.py](../../backend/main.py)
- [backend/app/main.py](../../backend/app/main.py)

### DB and seed data

- DB engine + init: [backend/app/infrastructure/db.py](../../backend/app/infrastructure/db.py)
- Seed data: [backend/app/infrastructure/repositories.py](../../backend/app/infrastructure/repositories.py)

The DB is re-created on startup (seed data is inserted each run).

## How to add a new page end-to-end

1) Create API endpoint in FastAPI routes.
2) Add client function in `frontend/src/lib/api`.
3) Add store methods in `frontend/src/stores`.
4) Create page in `frontend/src/pages`.
5) Register route in [frontend/src/app/routes.tsx](../src/app/routes.tsx).
6) Add sidebar item in [frontend/src/components/layout/AppShell.tsx](../src/components/layout/AppShell.tsx).

## Dev Commands

Frontend:

```bash
cd frontend
pnpm dev
```

Backend:

```bash
cd backend
uv run python main.py
```
