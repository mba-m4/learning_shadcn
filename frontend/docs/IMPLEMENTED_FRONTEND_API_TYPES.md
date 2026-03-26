# Frontend Implementation API Request/Response Inventory

## Related Documents

- `../docs/API_NORMALIZATION_PLAN.md`
- `../docs/API_BACKEND_DEFINITION_DRAFT.md`
- `../docs/DB_SCHEMA_DEFINITION.md`

## Purpose

This document inventories the API surface that the current frontend implementation actually depends on.

- Source of truth: frontend implementation under `src/lib/api`, `src/stores`, and direct `request()` usage.
- Goal: document request and response types required by the frontend, not just what is currently present in `openapi.json`.
- Scope: endpoints currently called by the frontend.

## Base Rules

- Base URL: `import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'`
- Shared client: `src/lib/api/client.ts`
- Default headers:
  - `Accept: application/json`
  - `Content-Type: application/json` when `body` exists and is not `FormData`
- Auth: Bearer token is attached automatically by `request<T>()` unless `withAuth = false`
- 204 responses are treated as `null`

## Shared Response Types

These shared TypeScript types are defined in `src/types/api.ts` and reused across multiple endpoints.

```ts
export type Role = 'leader' | 'worker' | 'safety_manager'
export type WorkStatus = 'draft' | 'confirmed'
export type RiskLevel = 'low' | 'medium' | 'high'
export type RiskSource = 'ai' | 'manual'

export interface User {
  id: number
  name: string
  role: Role
  is_active: boolean
  contact?: string | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface WorkGroup {
  id: number
  name: string
}

export interface Work {
  id: number
  title: string
  description: string
  group_id: number
  work_date: string
  status: WorkStatus
}

export interface WorkItem {
  id: number
  work_id: number
  name: string
  description: string
}

export interface RiskAssessment {
  id: number
  work_item_id: number
  content: string
  action?: string | null
  generated_at: string
}

export interface ManualRisk {
  id: number
  work_item_id: number
  content: string
  action?: string | null
  created_at: string
}

export interface WorkComment {
  id: number
  work_id: number
  user_id: number
  content: string
  created_at: string
}

export interface RiskSummary {
  work_id: number
  level: RiskLevel
  score: number
  reasons?: string[]
  updated_at?: string
}

export interface WorkItemWithRisks {
  item: WorkItem
  risks: RiskAssessment[]
}

export interface WorkOverview {
  work: Work
  items: WorkItemWithRisks[]
}

export interface WorkListItem {
  work: Work
  items: WorkItem[]
  risk_count: number
}

export interface WorkListResponse {
  items: WorkListItem[]
  total: number
  limit: number
  offset: number
}

export interface WorkDateSummary {
  work_date: string
  count: number
}

export interface Comment {
  id: number
  work_id: number
  user_id: number
  content: string
  created_at: string
}

export interface Coordinates {
  x: number
  y: number
  width?: number
  height?: number
}

export interface RiskRecord {
  id: number
  title: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'in_review' | 'closed'
  work_id?: number | null
  work_title?: string | null
  summary: string
  actions: string[]
  location_coordinates?: Coordinates | null
}

export interface Incident {
  id: number
  title: string
  type: 'incident' | 'near_miss'
  date: string
  root_cause: string
  corrective_actions: string[]
  status: 'open' | 'resolved'
  work_id?: number | null
  work_title?: string | null
  assignee_id?: number | null
  assignee_name?: string | null
  labels: string[]
  created_at: string
  updated_at: string
}

export interface IncidentComment {
  id: number
  incident_id: number
  user_id: number
  user_name: string
  content: string
  created_at: string
  updated_at?: string
}

export interface IncidentActivity {
  id: number
  incident_id: number
  user_id: number
  user_name: string
  action_type:
    | 'created'
    | 'comment'
    | 'status_change'
    | 'corrective_action'
    | 'assignment'
    | 'label_added'
    | 'label_removed'
  content?: string
  old_value?: string
  new_value?: string
  created_at: string
}

export interface Manual {
  id: number
  title: string
  category: string
  updated_at: string
  summary: string
}

export interface Meeting {
  id: number
  title: string
  date: string
  participants: string[]
  transcript: string
  extracted_risks: RiskRecord[]
  sync_state: string
}

export interface MeetingUpload {
  id: number
  meeting_id?: number | null
  filename: string
  created_at: string
}

export interface MyWorkLocation {
  id: number
  work_id: number
  name: string
  map_type: 'image' | '3d'
  map_file_path: string
  coordinates: Coordinates
  description?: string | null
}

export interface MyWorkItem {
  id: number
  work_id: number
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  steps: string[]
  hazards: string[]
  tools: string[]
}

export interface MyWork {
  id: number
  title: string
  description: string
  work_date: string
  group: string
  status: 'pending' | 'in_progress' | 'completed'
  risk_score: number
  items: MyWorkItem[]
  related_risks: RiskRecord[]
  incidents: string[]
  location?: MyWorkLocation | null
}

export interface MyWorkListResponse {
  items: MyWork[]
  total: number
  limit: number
  offset: number
}

export interface WorkAsset {
  photos: string[]
  audios: string[]
  notes: string[]
}

export interface WorkRiskAcknowledgment {
  id: number
  work_id: number
  user_id: number
  acknowledged_at: string
  signature_base64: string | null
  acknowledged_risk_ids: number[]
  acknowledged_risks: Array<{
    id: number
    source: 'ai' | 'manual'
    content: string
    action?: string | null
    item_name?: string | null
  }>
}

export interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent' | 'success'
  created_at: string
  is_read?: boolean
  link?: string
  display_until?: string | null
  pinned?: boolean
}
```

## Endpoint Inventory

### 1. Auth

#### `POST /auth/login`

- Implementation: `src/lib/api/auth.ts`
- Auth required: no
- Content-Type: `application/x-www-form-urlencoded`
- Request type:

```ts
type LoginRequest = {
  username: string
  password: string
}
```

- Response type:

```ts
type LoginResponse = TokenResponse
```

#### `GET /auth/me`

- Implementation: `src/lib/api/auth.ts`
- Auth required: yes
- Request body: none
- Response type:

```ts
type MeResponse = User
```

### 2. Work Groups and Works

#### `GET /works/groups`

- Implementation: `src/lib/api/works.ts`
- Request body: none
- Response type:

```ts
type FetchGroupsResponse = WorkGroup[]
```

#### `POST /works/groups`

- Implementation: `src/lib/api/works.ts`
- Request type:

```ts
type CreateGroupRequest = {
  name: string
}
```

- Response type:

```ts
type CreateGroupResponse = WorkGroup
```

#### `GET /works/daily?work_date=YYYY-MM-DD`

- Implementation: `src/lib/api/works.ts`
- Query type:

```ts
type FetchDailyOverviewQuery = {
  work_date: string
}
```

- Response type:

```ts
type FetchDailyOverviewResponse = WorkOverview[]
```

#### `POST /works`

- Implementation: `src/lib/api/works.ts`
- Request type:

```ts
type CreateWorkRequest = {
  title: string
  description: string
  group_id: number
  work_date: string
  status: WorkStatus
}
```

- Response type:

```ts
type CreateWorkResponse = Work
```

#### `POST /works/{workId}/items`

- Implementation: `src/lib/api/works.ts`
- Path params:

```ts
type AddWorkItemPath = {
  workId: number
}
```

- Request type:

```ts
type AddWorkItemRequest = {
  name: string
  description: string
}
```

- Response type:

```ts
type AddWorkItemResponse = WorkItem
```

#### `POST /works/items/{workItemId}/risks/generate`

- Implementation: `src/lib/api/works.ts`
- Request body: none
- Response type:

```ts
type GenerateRiskResponse = RiskAssessment
```

#### `GET /works/{workId}`

- Implementation: `src/lib/api/works.ts`
- Request body: none
- Response type:

```ts
type FetchWorkDetailResponse = WorkOverview
```

#### `GET /works?start_date=&end_date=&limit=&offset=`

- Implementation: `src/lib/api/works.ts`
- Query type:

```ts
type FetchWorkListQuery = {
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}
```

- Response type:

```ts
type FetchWorkListResponse = WorkListResponse
```

#### `GET /works/dates?start_date=&end_date=`

- Implementation: `src/lib/api/works.ts`
- Query type:

```ts
type FetchWorkDateSummaryQuery = {
  start_date: string
  end_date: string
}
```

- Response type:

```ts
type FetchWorkDateSummaryResponse = WorkDateSummary[]
```

### 3. Work Risk APIs

#### `GET /works/items/{workItemId}/risks/manual`

- Implementation: `src/lib/api/risks.ts`
- Request body: none
- Response type:

```ts
type FetchManualRisksResponse = ManualRisk[]
```

#### `POST /works/items/{workItemId}/risks/manual`

- Implementation: `src/lib/api/risks.ts`
- Request type:

```ts
type CreateManualRiskRequest = {
  content: string
  action?: string | null
}
```

- Response type:

```ts
type CreateManualRiskResponse = ManualRisk
```

#### `PATCH /works/items/risks/manual/{riskId}`

- Implementation: `src/lib/api/risks.ts`
- Request type:

```ts
type UpdateManualRiskRequest = {
  content?: string | null
  action?: string | null
}
```

- Response type:

```ts
type UpdateManualRiskResponse = ManualRisk
```

#### `DELETE /works/items/risks/manual/{riskId}`

- Implementation: `src/lib/api/risks.ts`
- Request body: none
- Response type:

```ts
type DeleteManualRiskResponse = {
  deleted: boolean
}
```

#### `PATCH /works/items/risks/ai/{riskId}`

- Implementation: `src/lib/api/risks.ts`
- Request type:

```ts
type UpdateRiskAssessmentRequest = {
  content?: string | null
  action?: string | null
}
```

- Response type:

```ts
type UpdateRiskAssessmentResponse = RiskAssessment
```

#### `DELETE /works/items/risks/ai/{riskId}`

- Implementation: `src/lib/api/risks.ts`
- Request body: none
- Response type:

```ts
type DeleteRiskAssessmentResponse = {
  deleted: boolean
}
```

#### `GET /works/{workId}/risk-summary`

- Implementation: `src/lib/api/risks.ts`
- Response type:

```ts
type FetchRiskSummaryResponse = RiskSummary
```

### 4. Risk Registry

#### `GET /risks`

- Implementation: `src/lib/api/riskRegistry.ts`
- Response type:

```ts
type FetchRisksResponse = RiskRecord[]
```

#### `GET /risks/{riskId}`

- Implementation: `src/lib/api/riskRegistry.ts`
- Response type:

```ts
type FetchRiskResponse = RiskRecord
```

#### `PATCH /risks/{riskId}/status`

- Implementation: `src/lib/api/riskRegistry.ts`
- Request type:

```ts
type UpdateRiskStatusRequest = {
  status: RiskRecord['status']
}
```

- Response type:

```ts
type UpdateRiskStatusResponse = RiskRecord
```

#### `PATCH /risks/{riskId}/severity`

- Implementation: `src/lib/api/riskRegistry.ts`
- Request type:

```ts
type UpdateRiskSeverityRequest = {
  severity: RiskRecord['severity']
}
```

- Response type:

```ts
type UpdateRiskSeverityResponse = RiskRecord
```

#### `POST /risks/{riskId}/actions`

- Implementation: `src/lib/api/riskRegistry.ts`
- Request type:

```ts
type AddRiskActionRequest = {
  action: string
}
```

- Response type:

```ts
type AddRiskActionResponse = RiskRecord
```

### 5. Incidents

#### `GET /incidents`

- Implementation: `src/lib/api/incidents.ts`
- Response type:

```ts
type FetchIncidentsResponse = Incident[]
```

#### `GET /incidents/{incidentId}`

- Implementation: `src/lib/api/incidents.ts`
- Response type:

```ts
type FetchIncidentResponse = Incident
```

#### `PATCH /incidents/{incidentId}/status`

- Implementation: `src/lib/api/incidents.ts`
- Request type:

```ts
type UpdateIncidentStatusRequest = {
  status: Incident['status']
}
```

- Response type:

```ts
type UpdateIncidentStatusResponse = Incident
```

#### `POST /incidents/{incidentId}/actions`

- Implementation: `src/lib/api/incidents.ts`
- Request type:

```ts
type AddIncidentActionRequest = {
  action: string
}
```

- Response type:

```ts
type AddIncidentActionResponse = Incident
```

#### `POST /incidents`

- Implementation: `src/lib/api/incidents.ts`
- Request type:

```ts
type CreateIncidentRequest = {
  title: string
  type: 'incident' | 'near_miss'
  date: string
  root_cause: string
  corrective_actions?: string[]
  status?: Incident['status']
  work_id?: number
  assignee_id?: number
  labels?: string[]
}
```

- Response type:

```ts
type CreateIncidentResponse = Incident
```

#### `PATCH /incidents/{incidentId}/assignment`

- Implementation: `src/lib/api/incidents.ts`
- Request type:

```ts
type UpdateIncidentAssignmentRequest = {
  assignee_id: number | null
}
```

- Response type:

```ts
type UpdateIncidentAssignmentResponse = Incident
```

#### `POST /incidents/{incidentId}/labels`

- Implementation: `src/lib/api/incidents.ts`
- Request type:

```ts
type AddIncidentLabelRequest = {
  label: string
}
```

- Response type:

```ts
type AddIncidentLabelResponse = Incident
```

#### `DELETE /incidents/{incidentId}/labels/{label}`

- Implementation: `src/lib/api/incidents.ts`
- Request body: none
- Response type:

```ts
type RemoveIncidentLabelResponse = Incident
```

#### `GET /incidents/{incidentId}/comments`

- Implementation: `src/lib/api/incidents.ts`
- Response type:

```ts
type FetchIncidentCommentsResponse = IncidentComment[]
```

#### `POST /incidents/{incidentId}/comments`

- Implementation: `src/lib/api/incidents.ts`
- Request type:

```ts
type AddIncidentCommentRequest = {
  content: string
}
```

- Response type:

```ts
type AddIncidentCommentResponse = IncidentComment
```

#### `PATCH /incidents/{incidentId}/comments/{commentId}`

- Implementation: `src/lib/api/incidents.ts`
- Request type:

```ts
type UpdateIncidentCommentRequest = {
  content: string
}
```

- Response type:

```ts
type UpdateIncidentCommentResponse = IncidentComment
```

#### `DELETE /incidents/{incidentId}/comments/{commentId}`

- Implementation: `src/lib/api/incidents.ts`
- Request body: none
- Response type:

```ts
type DeleteIncidentCommentResponse = void
```

#### `GET /incidents/{incidentId}/activities`

- Implementation: `src/lib/api/incidents.ts`
- Response type:

```ts
type FetchIncidentActivitiesResponse = IncidentActivity[]
```

#### `GET /users`

- Implementation: `src/lib/api/incidents.ts`
- Response type:

```ts
type FetchUsersResponse = User[]
```

### 6. Work Comments

#### `GET /works/{workId}/comments`

- Implementation: `src/lib/api/comments.ts`
- Auth mode in code: `withAuth = false`
- Response type:

```ts
type FetchCommentsResponse = Comment[]
```

#### `POST /works/{workId}/comments`

- Implementation: `src/lib/api/comments.ts`
- Request type:

```ts
type AddCommentRequest = {
  content: string
}
```

- Response type:

```ts
type AddCommentResponse = Comment
```

### 7. Meetings

#### `GET /meetings`

- Implementation: `src/lib/api/meetings.ts`
- Response type:

```ts
type FetchMeetingsResponse = Meeting[]
```

#### `GET /meetings/{meetingId}`

- Implementation: `src/lib/api/meetings.ts`
- Response type:

```ts
type FetchMeetingResponse = Meeting
```

#### `PATCH /meetings/{meetingId}/sync-state`

- Implementation: `src/lib/api/meetings.ts`
- Request type:

```ts
type UpdateMeetingSyncStateRequest = {
  sync_state: string
}
```

- Response type:

```ts
type UpdateMeetingSyncStateResponse = Meeting
```

#### `GET /meetings/uploads?meeting_id=`

- Implementation: `src/lib/api/meetings.ts`
- Query type:

```ts
type FetchMeetingUploadsQuery = {
  meeting_id?: number | null
}
```

- Response type:

```ts
type FetchMeetingUploadsResponse = MeetingUpload[]
```

#### `POST /meetings/uploads`

- Implementation: `src/lib/api/meetings.ts`
- Request type:

```ts
type AddMeetingUploadsRequest = {
  meeting_id: number | null
  files: string[]
}
```

- Response type:

```ts
type AddMeetingUploadsResponse = MeetingUpload[]
```

### 8. Manuals

#### `GET /manuals`

- Implementation: `src/lib/api/manuals.ts`
- Response type:

```ts
type FetchManualsResponse = Manual[]
```

#### `GET /manuals/{manualId}`

- Implementation: `src/lib/api/manuals.ts`
- Response type:

```ts
type FetchManualResponse = Manual
```

### 9. Notifications

#### `GET /notifications?unread_only=&limit=`

- Implementation: `src/lib/api/notifications.ts`
- Query type used by frontend:

```ts
type FetchNotificationsQuery = {
  unreadOnly?: boolean
  limit?: number
}
```

- Query keys actually sent to backend:

```ts
type FetchNotificationsBackendQuery = {
  unread_only?: 'true'
  limit?: string
}
```

- Response type:

```ts
type FetchNotificationsResponse = Notification[]
```

#### `PATCH /notifications/{notificationId}/read`

- Implementation: `src/lib/api/notifications.ts`
- Request body: none
- Response type:

```ts
type MarkNotificationAsReadResponse = Notification
```

#### `POST /notifications`

- Implementation: `src/lib/api/notifications.ts`
- Request type:

```ts
type CreateNotificationRequest = {
  title: string
  content: string
  type: Notification['type']
  link?: string
  display_until?: string | null
  pinned?: boolean
}
```

- Response type:

```ts
type CreateNotificationResponse = Notification
```

### 10. My Works

#### `GET /my-works?limit=&offset=`

- Implementation: `src/lib/api/myWorks.ts`
- Query type:

```ts
type FetchMyWorksQuery = {
  limit?: number
  offset?: number
}
```

- Response type:

```ts
type FetchMyWorksResponse = MyWorkListResponse
```

#### `GET /my-works/{workId}`

- Implementation: `src/lib/api/myWorks.ts`
- Response type:

```ts
type FetchMyWorkResponse = MyWork
```

#### `GET /my-works/{workId}/assets`

- Implementation: `src/lib/api/myWorks.ts`
- Response type:

```ts
type FetchWorkAssetsResponse = WorkAsset
```

#### `POST /my-works/{workId}/assets/photos`

- Implementation: `src/lib/api/myWorks.ts`
- Request type:

```ts
type AddWorkPhotosRequest = {
  files: string[]
}
```

- Response type:

```ts
type AddWorkPhotosResponse = WorkAsset
```

#### `POST /my-works/{workId}/assets/audios`

- Implementation: `src/lib/api/myWorks.ts`
- Request type:

```ts
type AddWorkAudiosRequest = {
  files: string[]
}
```

- Response type:

```ts
type AddWorkAudiosResponse = WorkAsset
```

#### `POST /my-works/{workId}/assets/notes`

- Implementation: `src/lib/api/myWorks.ts`
- Request type:

```ts
type AddWorkNoteRequest = {
  note: string
}
```

- Response type:

```ts
type AddWorkNoteResponse = WorkAsset
```

### 11. Safety Acknowledgment

These endpoints are used directly from `src/stores/safetyStore.ts` and are not wrapped in a dedicated API module.

#### `POST /works/{workId}/acknowledge`

- Implementation: `src/stores/safetyStore.ts`
- Request type:

```ts
type AcknowledgedRiskSnapshot = {
  id: number
  source: 'ai' | 'manual'
  content: string
  action?: string | null
  item_name?: string | null
}

type SubmitAcknowledgmentRequest = {
  signature_base64: string | null
  acknowledged_risk_ids: number[]
  acknowledged_risks: AcknowledgedRiskSnapshot[]
}
```

- Response type:

```ts
type SubmitAcknowledgmentResponse = WorkRiskAcknowledgment
```

#### `GET /works/{workId}/acknowledgment`

- Implementation: `src/stores/safetyStore.ts`
- Response type:

```ts
type FetchAcknowledgmentResponse = WorkRiskAcknowledgment | null
```

#### `GET /works/{workId}/acknowledgments/history`

- Implementation: `src/stores/safetyStore.ts`
- Response type:

```ts
type FetchAcknowledgmentHistoryResponse = WorkRiskAcknowledgment[]
```

## Current Coverage Gap Against Existing OpenAPI

The current `docs/openapi.json` documents only a limited subset of the endpoints used by the frontend.

Endpoints already present there include:

- `/auth/login`
- `/auth/me`
- `/works/groups`
- `/works`
- `/works/{work_id}/items`
- `/works/items/{work_item_id}/risks/generate`
- `/works/daily`
- `/works/{work_id}/comments`

Endpoints used by the frontend but not represented in the current OpenAPI file include at least:

- `/works/{workId}`
- `/works/dates`
- `/works/items/{workItemId}/risks/manual`
- `/works/items/risks/manual/{riskId}`
- `/works/items/risks/ai/{riskId}`
- `/works/{workId}/risk-summary`
- `/works/{workId}/acknowledge`
- `/works/{workId}/acknowledgment`
- `/works/{workId}/acknowledgments/history`
- `/risks`
- `/risks/{riskId}`
- `/risks/{riskId}/status`
- `/risks/{riskId}/severity`
- `/risks/{riskId}/actions`
- `/incidents`
- `/incidents/{incidentId}`
- `/incidents/{incidentId}/status`
- `/incidents/{incidentId}/actions`
- `/incidents/{incidentId}/assignment`
- `/incidents/{incidentId}/labels`
- `/incidents/{incidentId}/labels/{label}`
- `/incidents/{incidentId}/comments`
- `/incidents/{incidentId}/comments/{commentId}`
- `/incidents/{incidentId}/activities`
- `/users`
- `/meetings`
- `/meetings/{meetingId}`
- `/meetings/{meetingId}/sync-state`
- `/meetings/uploads`
- `/manuals`
- `/manuals/{manualId}`
- `/notifications`
- `/notifications/{notificationId}/read`
- `/my-works`
- `/my-works/{workId}`
- `/my-works/{workId}/assets`
- `/my-works/{workId}/assets/photos`
- `/my-works/{workId}/assets/audios`
- `/my-works/{workId}/assets/notes`

## Notes and Ambiguities

- `GET /works/{workId}/comments` is called with `withAuth = false` in the frontend, while many other endpoints use authenticated requests by default.
- `WorkComment` and `Comment` are structurally identical in the current frontend types.
- `ManualRisk` and `RiskAssessment` are also structurally similar, with different timestamp fields: `created_at` vs `generated_at`.
- The frontend currently treats meeting uploads and work assets as JSON payloads using `string[]`, not `multipart/form-data`.
- Notification query input is camelCase in the frontend API function, but converted to snake_case when sent to the backend.
- Safety acknowledgment types are duplicated in `src/stores/safetyStore.ts` rather than reusing the exported type from `src/types/api.ts`.

## Recommended Next Step

If this document is to become the contract document for backend alignment, the next step should be to update `docs/openapi.json` and `docs/API.md` so they match this inventory exactly.