# API Normalization Plan

## Purpose

Before updating OpenAPI, the contract should be normalized first.

This document organizes the work in the following order:

1. Align frontend expectations and backend response models
2. Move frontend hardcoded business data into API/config resources
3. Remove duplicated request logic and duplicated enums/types
4. Update OpenAPI and external API documentation after the contract is stable

## Why This Should Come Before OpenAPI

The current frontend already assumes a wider API surface than the backend currently exposes.

If OpenAPI is updated before normalization:

- frontend-only assumptions will be documented as if they already exist
- backend simplifications and missing fields will be hidden
- duplicated concepts will be frozen into the schema

## Current Alignment Status

### Mostly aligned

- Auth
- Work groups
- Work creation
- Work items
- AI risk generation
- Manual risks
- Work risk summary
- Work list and date summary
- Work detail
- Work comments
- My works list/detail/assets
- Risk acknowledgment
- Risk registry
- Manuals
- Meetings basic list/detail/uploads

### Partially aligned

- Incidents
  - frontend expects `type`, `work_id`, `work_title`, `assignee_id`, `assignee_name`, `labels`, `created_at`, `updated_at`
  - backend currently exposes only `id`, `title`, `date`, `root_cause`, `corrective_actions`, `status`
  - frontend also calls comments, activities, assignment, and label endpoints that are not present in backend routes
- Meetings
  - backend exposes core meeting data
  - frontend meeting detail page still keeps transcript segments, agenda tags, bookmarks, material links, and AI match scores in local UI state

### Not aligned

- Notifications
  - frontend has a full API module and store
  - backend currently has no notification routes, schemas, domain model, or tables
- Group membership management
  - frontend group page stores member-to-group relationships only in local component state
  - no backend contract or persistence exists

## High Priority Normalization Work

### 1. Canonical Python schema ownership

The backend Pydantic models in `backend/app/presentation/schemas.py` should be treated as the canonical contract.

Frontend TypeScript types should be generated from, or at least aligned to, those models.

Recommended rule:

- backend owns transport schema
- frontend owns view model only when transformation is necessary

### 2. Normalize duplicated shapes

#### Comments

Current duplication:

- `Comment`
- `WorkComment`

These are structurally identical in the frontend.

Recommendation:

- keep one transport schema name in backend and frontend
- if both names are needed for readability, alias one to the other rather than redefining

#### Risks

Current duplication:

- `RiskAssessment`
- `ManualRisk`

These are nearly identical except for source semantics and timestamp field.

Recommendation:

- keep distinct persisted models if business meaning differs
- add a shared response base model in backend documentation
- provide a unified frontend display model only at the UI boundary

#### Roles and statuses

Current duplication:

- role labels are in UI
- work status labels are in multiple pages
- incident status labels are in multiple pages
- notification type labels/styles are duplicated across pages

Recommendation:

- move all business enums and labels into backend-owned configuration resources

### 3. Move direct request usage into API modules

Current exception:

- `frontend/src/stores/safetyStore.ts` calls `request()` directly

Recommendation:

- create `frontend/src/lib/api/safety.ts`
- keep stores focused on state and orchestration only

### 4. Resolve frontend/backend mismatch by domain

#### Incidents

Frontend expects a richer incident aggregate than the backend currently returns.

Recommended canonical response:

```py
class IncidentResponse(BaseModel):
    id: int
    title: str
    type: str
    date: date
    root_cause: str
    corrective_actions: list[str]
    status: str
    work_id: int | None = None
    work_title: str | None = None
    assignee_id: int | None = None
    assignee_name: str | None = None
    labels: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
```

Required supporting endpoints to satisfy current frontend behavior:

- `PATCH /incidents/{incident_id}/assignment`
- `POST /incidents/{incident_id}/labels`
- `DELETE /incidents/{incident_id}/labels/{label}`
- `GET /incidents/{incident_id}/comments`
- `POST /incidents/{incident_id}/comments`
- `PATCH /incidents/{incident_id}/comments/{comment_id}`
- `DELETE /incidents/{incident_id}/comments/{comment_id}`
- `GET /incidents/{incident_id}/activities`

#### Notifications

The frontend already depends on:

- `GET /notifications`
- `POST /notifications`
- `PATCH /notifications/{notification_id}/read`

These should be formally added to backend first.

Recommended canonical response:

```py
class NotificationResponse(BaseModel):
    id: int
    title: str
    content: str
    type: str
    created_at: datetime
    is_read: bool = False
    link: str | None = None
    display_until: datetime | None = None
    pinned: bool = False
```

#### Groups and memberships

`GroupsPage` currently persists only the group entity. Membership is local UI state.

Required backend additions:

- `GET /groups/{group_id}/members`
- `POST /groups/{group_id}/members`
- `DELETE /groups/{group_id}/members/{user_id}`
- optionally `GET /users/{user_id}/groups`

### 5. Convert hardcoded business data into API/config resources

The following items are currently hardcoded in the frontend and should move to backend-owned resources.

#### Incident labels

Current frontend hardcoding:

- predefined labels in incident sidebar
- predefined labels in incident create dialog
- label color mapping in incident detail page

Recommendation:

- `GET /config/incident-labels`

Example schema:

```py
class IncidentLabelConfigResponse(BaseModel):
    id: str
    name: str
    color: str
    description: str | None = None
```

#### Incident types

Current frontend hardcoding:

- `incident`
- `near_miss`

Recommendation:

- `GET /config/incident-types`

#### Incident statuses

Current frontend hardcoding:

- `open`
- `resolved`

Recommendation:

- `GET /config/incident-statuses`

#### Risk severities and statuses

Current frontend hardcoding:

- severities: `low`, `medium`, `high`
- statuses: `open`, `in_review`, `closed`

Recommendation:

- `GET /config/risk-severities`
- `GET /config/risk-statuses`

#### Work statuses

Current frontend hardcoding:

- `draft`
- `confirmed`

Recommendation:

- `GET /config/work-statuses`

#### Notification types

Current frontend hardcoding:

- `info`
- `warning`
- `urgent`
- `success`

Recommendation:

- `GET /config/notification-types`

#### Roles and permissions

Current frontend hardcoding:

- role labels in app shell
- visible navigation by role
- comment permission role list in work detail

Recommendation:

- keep identity and assigned role in `/auth/me`
- add `permissions: list[str]` to `/auth/me` or expose `GET /auth/permissions`
- add `GET /config/roles` only if the system needs role metadata beyond permission checks

#### Meeting detail companion data

Current frontend hardcoding in meeting detail page:

- agenda tags
- transcript segments
- bookmarks
- material links
- AI candidate scores

Recommendation:

- define whether these are persisted domain data or temporary UI helpers
- if persisted, add meeting companion endpoints rather than keeping them local

Possible endpoints:

- `GET /meetings/{meeting_id}/bookmarks`
- `POST /meetings/{meeting_id}/bookmarks`
- `GET /meetings/{meeting_id}/materials`
- `POST /meetings/{meeting_id}/materials`
- `GET /meetings/{meeting_id}/transcript-segments`

## Recommended Normalization Order

### Phase 1: contract cleanup

1. Canonicalize backend request/response models
2. Align frontend incident and notification types to backend reality or extend backend to match frontend
3. Move safety endpoints into a dedicated API module
4. Eliminate duplicated transport types in frontend

### Phase 2: business configuration APIs

1. Incident labels
2. Incident/work/risk/notification enum config endpoints
3. Role and permission metadata
4. Group membership APIs

### Phase 3: OpenAPI refresh

1. regenerate OpenAPI from backend routes/schemas
2. replace the hand-maintained frontend list with generated docs where possible
3. keep the implementation inventory as a traceability document, not as the main contract source

## Result Expected After Normalization

After this work, the API contract should have these properties:

- one canonical owner for request/response schema: backend Pydantic
- no business-critical enum labels hardcoded in frontend pages
- no domain data stored only in component state when persistence is expected
- no frontend endpoint assumptions that are missing in backend routes
- OpenAPI can be updated once, based on a stable contract