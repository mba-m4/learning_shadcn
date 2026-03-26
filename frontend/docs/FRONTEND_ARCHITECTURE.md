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

## Directory Layout

Use directories to express meaning, not implementation trivia.

`src/app`

- App bootstrap, router, providers.

`src/features/<domain>`

- Domain-facing entry points for pages, components, API query factories, and feature-local helpers.
- Example: `features/meetings/components`, `features/works/api`, `features/incidents/api`.

`src/shared/api`

- Cross-domain API infrastructure only.
- `client`, `queryClient`, `queryKeys` live here because they are transport/cache primitives shared by every feature.

`src/types/api`

- Split API-facing types by domain instead of keeping one monolithic file.
- Keep `src/types/api.ts` only as a compatibility barrel while imports migrate.

`src/components`

- Truly shared UI or cross-feature composition.
- If a component exists for one feature only, move it under `src/features/<domain>/components`.

`src/stores`

- UI/auth/draft state only.
- Do not place server lists, server detail payloads, or request loading flags here.

## Import Rules

- Views should import domain endpoints from `features/<domain>/api/*`.
- Views and stores should use `shared/api/*` only for cross-feature transport/cache infrastructure.
- Do not introduce a generic `lib/api` layer again; shared code belongs in `shared`, domain code belongs in `features`.

## Placement Rules

The table below defines what each top-level area is for.

| Location | Allowed | Not Allowed | Examples |
| --- | --- | --- | --- |
| `src/app` | app bootstrap, providers, router, route wiring | domain business logic, feature-only UI, raw endpoint functions | `App.tsx`, route definitions |
| `src/shared/api` | cross-feature API infrastructure | feature-specific services or schemas | `client.ts`, `queryClient.ts`, `queryKeys.ts` |
| `src/shared` | framework-agnostic helpers, auth guards, shared hooks, primitive types | feature business logic, page orchestration, domain endpoints | `utils.ts`, `auth/guards.tsx`, `hooks/useAuth.ts` |
| `src/shared/types` | minimal cross-domain primitive types | work-only or incident-only contracts | common primitives |
| `src/components/ui` | shadcn/ui primitives and generic design-system UI | business-aware feature components | `Button`, `Dialog`, `Input`, `Table` |
| `src/components/layout` | app-wide layout and shell components | feature-only sections | `AppShell`, `PageHeader` |
| `src/features/<domain>/api` | feature services, query factories, schemas, API-specific types | shared transport internals for all domains | works queries, incidents service |
| `src/features/<domain>/ui` | feature-specific UI components and sections | app-wide generic UI primitives | `MeetingTranscriptSection`, `WorkRiskSection` |
| `src/features/<domain>/model` | UI state, editor state, filter state, view helpers for one feature | server response cache, request loading flags for server state | editor store, filter store |
| `src/features/<domain>/pages` | route pages for one feature | generic shared components | `WorkDetailPage`, `MeetingDetailPage` |
| `src/stores` | auth state and temporary global UI state during migration | server lists, server detail payloads, request cache | auth store, dialog state |
| `src/pages` | thin routing entry points only, if retained | heavy page implementation, domain sections, API orchestration | route wrappers |
| `src/mocks` | MSW handlers, seeded DB, runtime mock helpers | production API code, reusable UI | `handlers.ts`, `db.ts` |
| `src/assets` | static files | code, config, schemas | images, icons, fonts |

## Feature Structure

Each feature should follow this shape when the domain is large enough.

| Path | Responsibility |
| --- | --- |
| `features/<domain>/api/service.ts` | endpoint functions built on top of the shared client |
| `features/<domain>/api/queries.ts` | `queryOptions` and `mutationOptions` factories |
| `features/<domain>/api/schemas.ts` | zod request and response schemas |
| `features/<domain>/api/types.ts` | feature-scoped API types when needed |
| `features/<domain>/ui` | feature-specific components |
| `features/<domain>/model` | UI state, draft state, filters |
| `features/<domain>/pages` | route pages for the feature |

## Page and Component Placement

Use reuse scope to decide where code belongs.

| Code Kind | Where It Belongs |
| --- | --- |
| route page opened directly by routing | `features/<domain>/pages` |
| component used by one page only | `features/<domain>/ui` next to that feature |
| component reused by multiple pages in one feature | `features/<domain>/ui` |
| component reused across multiple features | `src/components` |
| shadcn primitive | `src/components/ui` |
| app shell or page header | `src/components/layout` |

## Naming Rules

| Target | Rule | Examples |
| --- | --- | --- |
| feature directories | kebab-case | `risk-registry` |
| component files | PascalCase | `MeetingTranscriptSection.tsx` |
| page files | PascalCase ending with `Page` | `WorkDetailPage.tsx` |
| store files | camelCase ending with `Store` | `workEditorStore.ts` |
| query factory | `createXxxQueryOptions` | `createWorkDetailQueryOptions` |
| mutation factory | `createXxxMutationOptions` | `createIncidentStatusMutationOptions` |
| service function | verb-first | `fetchWorkDetail`, `createIncident`, `updateRiskStatus` |
| zod schema | `xxxSchema` | `workOverviewSchema` |
| TypeScript types/interfaces | PascalCase | `WorkOverview`, `RiskRecord` |
| constant values | `UPPER_SNAKE_CASE` | `STORAGE_KEY` |
| booleans | `is`, `has`, or `can` prefix | `isLoading`, `hasError`, `canEdit` |
| handlers | `handleXxx` | `handleSubmit` |
| id variables | suffix with `Id` or `IdNumber` | `workId`, `meetingIdNumber` |

## Coding Rules

1. Pages stay thin.
	A page may read route params, call queries and mutations, render page-level loading or error states, and compose sections. It must not accumulate unrelated UI sections and server orchestration in one file indefinitely.
2. Server state belongs to TanStack Query.
	API-backed lists, details, loading flags, and cache invalidation rules must not live in Zustand.
3. Zustand is for UI state only.
	Dialog state, filters, editor drafts, and temporary selections are valid. Server payloads are not.
4. UI never calls axios directly.
	Pages and components must depend on feature services and query factories.
5. Query setup is centralized.
	Query keys and query functions belong in query factories, not inline in page files.
6. Validate API contracts at the boundary.
	Request payloads and response payloads are parsed with zod in the service layer.
7. Shared code must stay domain-agnostic.
	If the code contains business vocabulary from one domain, it belongs in a feature.
8. shadcn primitives remain in `components/ui`.
	Feature-specific compositions built from shadcn primitives belong under the feature.
9. One file should have one primary responsibility.
	Service files manage endpoints, query files manage query factories, pages orchestrate UI.
10. Large pages must be decomposed.
	If a page exceeds roughly 400 lines or mixes multiple sections and forms, split it into feature components and helper hooks.
11. Prefer feature entry points over implementation-detail imports.
	New page-level imports should come from `features/<domain>/api/*` or `shared/api/*`.
12. Compatibility barrels are temporary.
	Re-export files are allowed during migration, but new code should import from the target structure.
13. Separate API contracts from UI display models when necessary.
	Derived view models should not be mixed blindly with raw API contracts.
14. Mock implementations must honor the same contract as runtime services.
	MSW responses should satisfy the same zod-backed contract expected by the frontend.

## Anti-Patterns

Avoid introducing these patterns in new code.

1. Reintroducing a catch-all `src/lib` directory for mixed shared and feature code.
2. Growing a single `types/api.ts` file with every domain contract.
3. Storing API responses and request loading flags inside Zustand.
4. Putting page-only components under `src/components`.
5. Building 500-line page files that mix API calls, forms, dialogs, and multiple business sections.
6. Importing raw transport utilities into view code when a feature entry point exists.

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