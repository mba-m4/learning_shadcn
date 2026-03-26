# Frontend Architecture Rules

This document defines the target frontend architecture while the backend API is still incomplete.

## Core Rules

- Source of truth for API contracts is zod schema, not handwritten TypeScript interfaces.
- Server state belongs to TanStack Query.
- Global UI state belongs to Zustand.
- Authentication state belongs to Zustand plus Query cache coordination.
- Views must not call axios directly.
- Views depend on query factories and mutation factories, not on raw endpoint details.

## Layer Boundaries

The dependency direction is one-way:

`view -> query/mutation hook -> service -> client/schema`

- `client`: axios instance, auth header injection, error normalization.
- `schema`: zod request/response definitions and derived types.
- `service`: endpoint functions that validate input/output.
- `query`: query keys, queryOptions factories, mutationOptions factories.
- `store`: Zustand stores for auth, filters, dialogs, drafts, optimistic UI hints.
- `view`: pages and components.

## What Stays in Zustand

- Access token and current user session state.
- Dialog open/close state.
- Page filter state that should survive route transitions.
- Editor draft state.
- Temporary UI coordination state.

## What Must Move Out of Zustand

- Lists returned by API.
- Detail payloads returned by API.
- Loading/error flags that are only for server requests.
- Manual request deduplication logic.
- Cache invalidation rules.

## Query Rules

- Every endpoint gets a stable query key factory.
- Query functions must return zod-parsed data.
- Mutations must define cache invalidation explicitly.
- Components can use `select`, but key and queryFn stay inside the factory.
- Empty states and error states are rendered in the page layer.

## API Contract Rules

- Backend availability does not decide frontend contract shape.
- If the frontend already depends on an endpoint, the contract is valid and must be modeled.
- Hardcoded enums and labels should move to `/config/*` endpoints.
- MSW is the reference implementation for missing backend endpoints until backend catches up.

## Mock Strategy

- MSW remains the local API boundary.
- faker is used for realistic names, timestamps, descriptions, and distribution.
- `@mswjs/data` manages relational mock data and seeded entities.
- Mock handlers must follow the same zod-backed contracts as runtime services.

## Review Checklist

- Does this page fetch server data through TanStack Query?
- Is the response parsed by zod before reaching the UI?
- Is Zustand holding only UI/auth/draft state?
- Are query keys and invalidation rules centralized?
- Could a hardcoded constant become a `/config/*` response instead?