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
- Errors are normalized through [frontend/src/shared/api/client.ts](../src/shared/api/client.ts).

## API Layer

HTTP calls are split between shared transport infrastructure and feature API modules.

- Shared client: [frontend/src/shared/api/client.ts](../src/shared/api/client.ts)
- Query client: [frontend/src/shared/api/queryClient.ts](../src/shared/api/queryClient.ts)
- Query keys: [frontend/src/shared/api/queryKeys.ts](../src/shared/api/queryKeys.ts)
- Shared zod schemas: [frontend/src/shared/api/schemas](../src/shared/api/schemas)
- Auth API: [frontend/src/features/auth/api/service.ts](../src/features/auth/api/service.ts)
- Config API: [frontend/src/features/config/api](../src/features/config/api)
- Works API: [frontend/src/features/works/api](../src/features/works/api)
- Risks registry API: [frontend/src/features/risk-registry/api](../src/features/risk-registry/api)
- Incidents API: [frontend/src/features/incidents/api](../src/features/incidents/api)
- Manuals API: [frontend/src/features/manuals/api](../src/features/manuals/api)
- Meetings API: [frontend/src/features/meetings/api](../src/features/meetings/api)
- Notifications API: [frontend/src/features/notifications/api](../src/features/notifications/api)

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
2) Add or update a feature service under `frontend/src/features/<domain>/api` and use `frontend/src/shared/api` only if the concern is cross-feature infrastructure.
3) Add store methods only for UI/auth/draft state in `frontend/src/stores` or `frontend/src/features/<domain>/model`.
4) Create the page in `frontend/src/features/<domain>/pages`.
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
