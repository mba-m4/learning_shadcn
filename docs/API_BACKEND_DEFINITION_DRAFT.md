# Backend API Definition Draft

## Purpose

This document rewrites the current frontend-driven API inventory into a backend-oriented contract draft.

Format principles:

- Python and Pydantic first
- request and response models shown as backend schema definitions
- examples included so payload shape is immediately visible
- implemented endpoints and proposed endpoints are separated

## 1. Shared schema patterns

```py
from datetime import date, datetime
from pydantic import BaseModel, Field


class ConfigItemResponse(BaseModel):
    # Generic configuration item for enums and label metadata.
    value: str = Field(description="Machine-readable value")
    label: str = Field(description="Display label shown in the UI")
    color: str | None = Field(default=None, description="Optional color token or CSS token")
    description: str | None = Field(default=None, description="Optional human-readable explanation")

    class Config:
        json_schema_extra = {
            "example": {
                "value": "urgent",
                "label": "緊急",
                "color": "red",
                "description": "Immediate attention required"
            }
        }
```

## 2. Implemented backend schemas

### Auth

```py
class TokenResponse(BaseModel):
    # JWT access token for authenticated requests.
    access_token: str
    token_type: str = "bearer"

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


class UserResponse(BaseModel):
    # Authenticated user profile returned after login/session restore.
    id: int
    name: str
    role: str
    is_active: bool

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Leader",
                "role": "leader",
                "is_active": True
            }
        }
```

### Works

```py
class WorkGroupCreateRequest(BaseModel):
    # Display name of the work group.
    name: str = Field(min_length=1, max_length=50)

    class Config:
        json_schema_extra = {"example": {"name": "設備点検"}}


class WorkGroupResponse(BaseModel):
    id: int
    name: str

    class Config:
        json_schema_extra = {"example": {"id": 10, "name": "設備点検"}}


class WorkCreateRequest(BaseModel):
    # New work created by a leader.
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)
    group_id: int
    work_date: date
    status: str = Field(default="draft")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "配管点検",
                "description": "高温配管ラインの目視点検",
                "group_id": 10,
                "work_date": "2026-03-26",
                "status": "draft"
            }
        }


class WorkResponse(BaseModel):
    id: int
    title: str
    description: str
    group_id: int
    work_date: date
    status: str


class WorkItemCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=300)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "バルブ確認",
                "description": "締結状態と漏れの確認"
            }
        }


class WorkItemResponse(BaseModel):
    id: int
    work_id: int
    name: str
    description: str
```

### Risks

```py
class RiskAssessmentResponse(BaseModel):
    # AI-generated risk candidate linked to a work item.
    id: int
    work_item_id: int
    content: str
    action: str | None = None
    generated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": 101,
                "work_item_id": 20,
                "content": "高温配管への接触火傷リスクあり",
                "action": "断熱カバーの確認と耐熱手袋着用",
                "generated_at": "2026-03-26T09:30:00Z"
            }
        }


class ManualRiskCreateRequest(BaseModel):
    # Human-added risk note for a work item.
    content: str = Field(min_length=1, max_length=1000)
    action: str | None = Field(default=None, max_length=1000)

    class Config:
        json_schema_extra = {
            "example": {
                "content": "床面が濡れているため転倒リスクがある",
                "action": "清掃実施と滑り止めマットを設置"
            }
        }


class ManualRiskResponse(BaseModel):
    id: int
    work_item_id: int
    content: str
    action: str | None = None
    created_at: datetime


class RiskSummaryResponse(BaseModel):
    # Work-level rollup used by dashboard and explorer views.
    work_id: int
    level: str
    score: int
    reasons: list[str] | None = None
    updated_at: datetime | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "work_id": 1,
                "level": "high",
                "score": 82,
                "reasons": ["高温配管", "高所作業", "滑りやすい床面"],
                "updated_at": "2026-03-26T10:15:00Z"
            }
        }
```

### Comments and acknowledgment

```py
class WorkCommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500)

    class Config:
        json_schema_extra = {
            "example": {"content": "開始前に養生範囲を追加してください"}
        }


class WorkCommentResponse(BaseModel):
    id: int
    work_id: int
    user_id: int
    content: str
    created_at: datetime


class WorkRiskAcknowledgmentRequest(BaseModel):
    # Legal/audit evidence that the worker reviewed risks before starting work.
    acknowledged_risk_ids: list[int]
    acknowledged_risks: list[dict[str, str | int | None]] = Field(default_factory=list)
    signature_base64: str | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "acknowledged_risk_ids": [101, 201],
                "acknowledged_risks": [
                    {
                        "id": 101,
                        "source": "ai",
                        "content": "高温配管への接触火傷リスクあり",
                        "action": "耐熱手袋を着用",
                        "item_name": "配管確認"
                    }
                ],
                "signature_base64": "data:image/png;base64,iVBORw0KGgoAAA..."
            }
        }


class WorkRiskAcknowledgmentResponse(BaseModel):
    id: int
    work_id: int
    user_id: int
    acknowledged_at: datetime
    signature_base64: str | None = None
    acknowledged_risk_ids: list[int]
    acknowledged_risks: list[dict[str, str | int | None]] = Field(default_factory=list)
```

### Risk registry, manuals, meetings, my works

```py
class CoordinatesResponse(BaseModel):
    x: float
    y: float
    width: float | None = None
    height: float | None = None


class RiskRecordResponse(BaseModel):
    id: int
    title: str
    severity: str
    status: str
    work_id: int | None = None
    work_title: str | None = None
    summary: str
    actions: list[str]
    location_coordinates: CoordinatesResponse | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": 301,
                "title": "高温配管エリアの接触リスク",
                "severity": "high",
                "status": "open",
                "work_id": 1,
                "work_title": "配管点検",
                "summary": "配管周辺で保温材破損が見つかっている",
                "actions": ["保温材交換", "注意喚起表示"],
                "location_coordinates": {"x": 212.0, "y": 144.0, "width": 64.0, "height": 52.0}
            }
        }


class ManualResponse(BaseModel):
    id: int
    title: str
    category: str
    updated_at: date
    summary: str


class MeetingUploadRequest(BaseModel):
    # Current implementation accepts a JSON array of filenames, not multipart upload.
    meeting_id: int | None = None
    files: list[str] = Field(min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "meeting_id": 12,
                "files": ["2026-03-26-morning.m4a", "shift-handover.wav"]
            }
        }


class MeetingUploadResponse(BaseModel):
    id: int
    meeting_id: int | None = None
    filename: str
    created_at: datetime
```

## 3. Frontend-required but backend-missing schemas

These should be formalized before OpenAPI is refreshed.

### Extended incident contract

```py
class IncidentCommentResponse(BaseModel):
    id: int
    incident_id: int
    user_id: int
    user_name: str
    content: str
    created_at: datetime
    updated_at: datetime | None = None


class IncidentActivityResponse(BaseModel):
    id: int
    incident_id: int
    user_id: int
    user_name: str
    action_type: str
    content: str | None = None
    old_value: str | None = None
    new_value: str | None = None
    created_at: datetime


class IncidentResponse(BaseModel):
    # This is the response shape the frontend actually expects today.
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

    class Config:
        json_schema_extra = {
            "example": {
                "id": 501,
                "title": "通路での滑り事故",
                "type": "incident",
                "date": "2026-03-26",
                "root_cause": "清掃後の水分が残っていた",
                "corrective_actions": ["清掃手順見直し", "滑り止めマット設置"],
                "status": "open",
                "work_id": 1,
                "work_title": "安全巡視",
                "assignee_id": 3,
                "assignee_name": "Safety",
                "labels": ["安全", "要確認"],
                "created_at": "2026-03-26T08:40:00Z",
                "updated_at": "2026-03-26T09:10:00Z"
            }
        }
```

Required related requests:

```py
class IncidentAssignmentUpdateRequest(BaseModel):
    assignee_id: int | None = None


class IncidentLabelAddRequest(BaseModel):
    label: str = Field(min_length=1, max_length=50)


class IncidentCommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class IncidentCommentUpdateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=1000)
```

### Notification contract

```py
class NotificationCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=2000)
    type: str = Field(min_length=1, max_length=30)
    link: str | None = None
    display_until: datetime | None = None
    pinned: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "title": "設備点検予定",
                "content": "本日 14:00 から第2ラインを停止して点検します。",
                "type": "warning",
                "link": "/works/18",
                "display_until": "2026-04-02T00:00:00Z",
                "pinned": True
            }
        }


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

### Group membership contract

```py
class GroupMemberResponse(BaseModel):
    group_id: int
    user_id: int
    user_name: str
    role: str


class GroupMemberCreateRequest(BaseModel):
    user_id: int
```

### Config endpoints for current frontend hardcoding

```py
class IncidentLabelConfigResponse(BaseModel):
    id: str
    name: str
    color: str
    description: str | None = None


class NotificationTypeConfigResponse(BaseModel):
    value: str
    label: str
    color: str
    description: str | None = None


class RolePermissionResponse(BaseModel):
    role: str
    permissions: list[str]
```

## 4. Endpoint groups that should exist after normalization

### Implemented or largely implemented

- `/auth/*`
- `/works/*`
- `/risks/*`
- `/manuals/*`
- `/meetings/*`
- `/my-works/*`

### Required to satisfy current frontend fully

- `/incidents/*` extended with assignment, labels, comments, activities
- `/notifications/*`
- `/config/*` for hardcoded enums and label metadata
- `/groups/*/members` or `/works/groups/*/members`

## 5. Notes for OpenAPI generation

When these schemas are added to backend code, examples should be placed in `json_schema_extra` so they are rendered automatically by FastAPI/OpenAPI UI.

Recommended style:

```py
class ExampleResponse(BaseModel):
    value: str

    class Config:
        json_schema_extra = {
            "example": {"value": "sample"}
        }
```

That approach will make the contract understandable in a backend-native way without relying on TypeScript-only documents.