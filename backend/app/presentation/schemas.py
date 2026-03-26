from datetime import date, datetime

from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    role: str
    is_active: bool


class WorkGroupCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=50)


class WorkGroupResponse(BaseModel):
    id: int
    name: str


class WorkCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)
    group_id: int
    work_date: date
    status: str = Field(default="draft")


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


class WorkItemResponse(BaseModel):
    id: int
    work_id: int
    name: str
    description: str


class RiskAssessmentResponse(BaseModel):
    id: int
    work_item_id: int
    content: str
    action: str | None = None
    generated_at: datetime


class ManualRiskCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=1000)
    action: str | None = Field(default=None, max_length=1000)


class ManualRiskResponse(BaseModel):
    id: int
    work_item_id: int
    content: str
    action: str | None = None
    created_at: datetime


class ManualRiskUpdateRequest(BaseModel):
    content: str | None = Field(default=None, max_length=1000)
    action: str | None = Field(default=None, max_length=1000)


class RiskAssessmentUpdateRequest(BaseModel):
    content: str | None = Field(default=None, max_length=1000)
    action: str | None = Field(default=None, max_length=1000)


class WorkCommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500)


class WorkCommentResponse(BaseModel):
    id: int
    work_id: int
    user_id: int
    content: str
    created_at: datetime


class WorkItemWithRisksResponse(BaseModel):
    item: WorkItemResponse
    risks: list[RiskAssessmentResponse]


class WorkOverviewResponse(BaseModel):
    work: WorkResponse
    items: list[WorkItemWithRisksResponse]


class WorkDetailResponse(BaseModel):
    work: WorkResponse
    items: list[WorkItemWithRisksResponse]


class WorkListItemResponse(BaseModel):
    work: WorkResponse
    items: list[WorkItemResponse]
    risk_count: int


class WorkListPageResponse(BaseModel):
    items: list[WorkListItemResponse]
    total: int
    limit: int
    offset: int


class MyWorkListPageResponse(BaseModel):
    items: list[MyWorkResponse]
    total: int
    limit: int
    offset: int


class WorkDateCountResponse(BaseModel):
    work_date: date
    count: int


class WorkDateStreamResponse(BaseModel):
    work_date: date
    items: list[WorkListItemResponse]


class RiskSummaryResponse(BaseModel):
    work_id: int
    level: str
    score: int
    reasons: list[str] | None = None
    updated_at: datetime | None = None


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


class RiskStatusUpdateRequest(BaseModel):
    status: str = Field(min_length=1, max_length=20)


class RiskSeverityUpdateRequest(BaseModel):
    severity: str = Field(min_length=1, max_length=20)


class RiskActionCreateRequest(BaseModel):
    action: str = Field(min_length=1, max_length=200)


class IncidentResponse(BaseModel):
    id: int
    title: str
    date: date
    root_cause: str
    corrective_actions: list[str]
    status: str

class IncidentCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    date: date
    root_cause: str = Field(min_length=1, max_length=1000)
    corrective_actions: list[str] = Field(default_factory=list)
    status: str = Field(default="open", min_length=1, max_length=20)


class IncidentStatusUpdateRequest(BaseModel):
    status: str = Field(min_length=1, max_length=20)


class IncidentActionCreateRequest(BaseModel):
    action: str = Field(min_length=1, max_length=200)


class ManualResponse(BaseModel):
    id: int
    title: str
    category: str
    updated_at: date
    summary: str


class MeetingResponse(BaseModel):
    id: int
    title: str
    date: date
    participants: list[str]
    transcript: str
    extracted_risks: list[RiskRecordResponse]
    sync_state: str


class MeetingSyncStateRequest(BaseModel):
    sync_state: str = Field(min_length=1, max_length=100)


class MeetingUploadRequest(BaseModel):
    meeting_id: int | None = None
    files: list[str] = Field(min_length=1)


class MeetingUploadResponse(BaseModel):
    id: int
    meeting_id: int | None = None
    filename: str
    created_at: datetime


class WorkLocationResponse(BaseModel):
    id: int
    work_id: int
    name: str
    map_type: str
    map_file_path: str
    coordinates: CoordinatesResponse
    description: str | None = None


class MyWorkItemResponse(BaseModel):
    id: int
    work_id: int
    title: str
    status: str
    steps: list[str]
    hazards: list[str]
    tools: list[str]


class MyWorkResponse(BaseModel):
    id: int
    title: str
    description: str
    work_date: date
    group: str
    status: str
    risk_score: int
    items: list[MyWorkItemResponse]
    related_risks: list[RiskRecordResponse]
    incidents: list[str]
    location: WorkLocationResponse | None = None


class WorkAssetResponse(BaseModel):
    photos: list[str]
    audios: list[str]
    notes: list[str]


class WorkAssetFilesRequest(BaseModel):
    files: list[str] = Field(min_length=1)


class WorkNoteRequest(BaseModel):
    note: str = Field(min_length=1, max_length=500)


class WorkRiskAcknowledgmentRequest(BaseModel):
    acknowledged_risk_ids: list[int]
    acknowledged_risks: list[dict[str, str | int | None]] = Field(default_factory=list)
    signature_base64: str | None = None


class WorkRiskAcknowledgmentResponse(BaseModel):
    id: int
    work_id: int
    user_id: int
    acknowledged_at: datetime
    signature_base64: str | None = None
    acknowledged_risk_ids: list[int]
    acknowledged_risks: list[dict[str, str | int | None]] = Field(default_factory=list)


class AuditLogResponse(BaseModel):
    id: int
    action: str
    user_id: int
    work_id: int | None = None
    details: str | None = None
    timestamp: datetime
