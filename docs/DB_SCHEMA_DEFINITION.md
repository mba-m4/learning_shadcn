# DB Schema Definition

## Purpose

This document summarizes the current database schema implied by the SQLModel table definitions in `backend/app/infrastructure/repositories.py`.

It also marks where the current schema is already suitable and where redesign would help future API work.

## Current Tables

### 1. `work_groups`

Purpose:

- master data for work group names

Columns:

- `id`: integer, primary key
- `name`: varchar(50), unique, not null

Notes:

- currently stores only the group entity itself
- group membership is not persisted yet

### 2. `works`

Purpose:

- top-level work header

Columns:

- `id`: integer, primary key
- `title`: varchar(100), not null
- `description`: varchar(500), not null
- `group_id`: integer, not null, foreign key to `work_groups.id`
- `work_date`: date, not null
- `status`: varchar(20), not null, default `draft`

### 3. `work_items`

Purpose:

- child work items under a work

Columns:

- `id`: integer, primary key
- `work_id`: integer, not null, foreign key to `works.id`
- `name`: varchar(100), not null
- `description`: varchar(300), not null

### 4. `risk_assessments`

Purpose:

- AI-generated risks per work item

Columns:

- `id`: integer, primary key
- `work_item_id`: integer, not null, foreign key to `work_items.id`
- `content`: varchar(1000), not null
- `action`: varchar(1000), nullable
- `generated_at`: datetime, not null

### 5. `manual_risks`

Purpose:

- user-entered risks per work item

Columns:

- `id`: integer, primary key
- `work_item_id`: integer, not null, foreign key to `work_items.id`
- `content`: varchar(1000), not null
- `action`: varchar(1000), nullable
- `created_at`: datetime, not null

### 6. `work_comments`

Purpose:

- comments attached to a work

Columns:

- `id`: integer, primary key
- `work_id`: integer, not null, foreign key to `works.id`
- `user_id`: integer, not null, foreign key to `users.id`
- `content`: varchar(500), not null
- `created_at`: datetime, not null

### 7. `risk_records`

Purpose:

- risk registry records used outside a single work item

Columns:

- `id`: integer, primary key
- `title`: varchar(200), not null
- `severity`: varchar(20), not null
- `status`: varchar(20), not null
- `work_id`: integer, nullable
- `work_title`: varchar(200), nullable
- `summary`: varchar(1000), not null
- `actions_json`: text/json string, not null, default `[]`
- `location_x`: float, nullable
- `location_y`: float, nullable
- `location_width`: float, nullable
- `location_height`: float, nullable

Notes:

- `actions_json` is denormalized
- `work_title` duplicates data that could be derived from `work_id`

### 8. `incidents`

Purpose:

- incident header

Columns:

- `id`: integer, primary key
- `title`: varchar(200), not null
- `incident_date`: date, not null
- `root_cause`: varchar(1000), not null
- `status`: varchar(20), not null
- `corrective_actions_json`: text/json string, not null, default `[]`

Current limitation:

- no `type`
- no `work_id`
- no assignee
- no labels
- no timestamps
- no comments table
- no activities table

This is the main reason the current backend does not match frontend incident expectations.

### 9. `manuals`

Purpose:

- safety and work manuals

Columns:

- `id`: integer, primary key
- `title`: varchar(200), not null
- `category`: varchar(100), not null
- `updated_at`: date, not null
- `summary`: varchar(1000), not null

### 10. `meetings`

Purpose:

- meeting header and transcript body

Columns:

- `id`: integer, primary key
- `title`: varchar(200), not null
- `meeting_date`: date, not null
- `participants_json`: text/json string, not null, default `[]`
- `transcript`: varchar(4000), not null
- `extracted_risk_ids_json`: text/json string, not null, default `[]`
- `sync_state`: varchar(100), not null, default `待機中`

Notes:

- participant list and extracted risk links are denormalized
- if meeting detail grows further, related child tables will be preferable

### 11. `meeting_uploads`

Purpose:

- uploaded audio/file references for meetings

Columns:

- `id`: integer, primary key
- `meeting_id`: integer, nullable
- `filename`: varchar(200), not null
- `created_at`: datetime, not null

### 12. `my_works`

Purpose:

- worker-centric work list for mobile/detail flows

Columns:

- `id`: integer, primary key
- `title`: varchar(200), not null
- `description`: varchar(1000), not null
- `work_date`: date, not null
- `group`: varchar(100), not null
- `status`: varchar(20), not null
- `risk_score`: integer, not null
- `incidents_json`: text/json string, not null, default `[]`

Notes:

- `group` is plain text rather than a foreign key
- `incidents_json` is denormalized

### 13. `my_work_items`

Purpose:

- steps and tools under a worker-centric work item

Columns:

- `id`: integer, primary key
- `work_id`: integer, not null, foreign key to `my_works.id`
- `title`: varchar(200), not null
- `status`: varchar(30), not null
- `steps_json`: text/json string, not null, default `[]`
- `hazards_json`: text/json string, not null, default `[]`
- `tools_json`: text/json string, not null, default `[]`

### 14. `my_work_risk_links`

Purpose:

- link table between `my_works` and `risk_records`

Columns:

- `work_id`: integer, primary key, foreign key to `my_works.id`
- `risk_id`: integer, primary key, foreign key to `risk_records.id`

### 15. `work_locations`

Purpose:

- map/location metadata attached to `my_works`

Columns:

- `id`: integer, primary key
- `work_id`: integer, not null, foreign key to `my_works.id`
- `name`: varchar(200), not null
- `map_type`: varchar(20), not null
- `map_file_path`: varchar(500), not null
- `coord_x`: float, not null
- `coord_y`: float, not null
- `coord_width`: float, nullable
- `coord_height`: float, nullable
- `description`: varchar(1000), nullable

### 16. `work_assets`

Purpose:

- normalized asset records for photos, audio, and notes tied to `my_works`

Columns:

- `id`: integer, primary key
- `work_id`: integer, not null, foreign key to `my_works.id`
- `asset_type`: varchar(20), not null
- `value`: varchar(500), not null
- `created_at`: datetime, not null

Notes:

- this table is already normalized enough for simple asset storage
- current API aggregates it back into `{ photos, audios, notes }`

### 17. `users`

Purpose:

- application user master

Columns:

- `id`: integer, primary key
- `name`: varchar(50), not null
- `role`: varchar(30), not null
- `is_active`: boolean, not null, default true

Current limitation:

- no contact/email in current table despite optional frontend `contact`

### 18. `auth_users`

Purpose:

- authentication credentials linked to `users`

Columns:

- `user_id`: integer, primary key, foreign key to `users.id`
- `login_id`: varchar(50), unique, not null
- `password_hash`: varchar(256), not null

### 19. `work_risk_acknowledgments`

Purpose:

- legal/audit evidence for risk confirmation before starting work

Columns:

- `id`: integer, primary key
- `work_id`: integer, not null, foreign key to `works.id`, indexed
- `user_id`: integer, not null, foreign key to `users.id`
- `acknowledged_at`: datetime, not null
- `signature_base64`: text, nullable
- `acknowledged_risk_ids_json`: text/json string, not null, default `[]`
- `acknowledged_risks_json`: text/json string, not null, default `[]`

Notes:

- keeping the risk snapshot JSON is acceptable because it serves as immutable evidence
- this is one of the few JSON columns that is reasonable to retain for audit fidelity

### 20. `audit_logs`

Purpose:

- audit trail for sensitive work/risk actions

Columns:

- `id`: integer, primary key
- `action`: varchar(50), not null
- `user_id`: integer, not null, foreign key to `users.id`
- `work_id`: integer, nullable, indexed
- `details`: text, nullable
- `timestamp`: datetime, not null, indexed

## Missing Tables for Current Frontend Requirements

The frontend currently expects behavior that would normally require the following persisted structures.

### Notifications

Missing suggested tables:

- `notifications`
- `notification_reads` or `notification_targets` depending on audience scope

Suggested minimal `notifications` columns:

- `id`
- `title`
- `content`
- `type`
- `link`
- `display_until`
- `pinned`
- `created_at`
- `created_by`

### Incident enrichment

Missing suggested tables:

- `incident_comments`
- `incident_activities`
- `incident_labels`
- `incident_label_links`

Suggested incident header additions:

- `type`
- `work_id`
- `assignee_id`
- `created_at`
- `updated_at`

### Group membership

Missing suggested table:

- `group_memberships`

Suggested columns:

- `group_id`
- `user_id`
- `created_at`
- composite unique key on `(group_id, user_id)`

### Configurable master data

If enum values and labels become backend-owned, consider master tables such as:

- `incident_label_masters`
- `status_masters`
- `notification_type_masters`
- `risk_severity_masters`

## Schema Quality Assessment

### Good current patterns

- `work_assets` uses row-based normalization instead of multiple repeated columns
- `my_work_risk_links` correctly uses a link table for many-to-many
- `auth_users` is separated from `users`
- `audit_logs` and `work_risk_acknowledgments` are useful for traceability

### Redesign candidates

- JSON string columns for business relationships
- duplicated human-readable columns such as `risk_records.work_title`
- string-only enums without master/config ownership
- incidents being much thinner in DB than in frontend/API expectations

## Recommended DB Refactoring Order

1. Add missing persistence for notifications
2. Expand incident schema and add related child tables
3. Add group membership table
4. Keep acknowledgment snapshot JSON as-is for audit use
5. Gradually normalize other JSON string arrays when the related API surfaces stabilize

## Suggested Future Target Model

The following areas should be normalized when feature scope stabilizes:

- meeting participants
- meeting extracted risk links
- incident corrective actions
- incident labels
- incident comments and activities
- my work incident references

That will make both the API contract and the DB design easier to reason about than the current mix of normalized rows and embedded JSON arrays.