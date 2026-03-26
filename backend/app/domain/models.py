from dataclasses import dataclass
from datetime import date, datetime


@dataclass(frozen=True)
class WorkGroup:
    id: int
    name: str


@dataclass(frozen=True)
class Work:
    id: int
    title: str
    description: str
    group_id: int
    work_date: date
    status: str


@dataclass(frozen=True)
class WorkItem:
    id: int
    work_id: int
    name: str
    description: str


@dataclass(frozen=True)
class RiskAssessment:
    id: int
    work_item_id: int
    content: str
    action: str | None
    generated_at: datetime


@dataclass(frozen=True)
class ManualRisk:
    id: int
    work_item_id: int
    content: str
    action: str | None
    created_at: datetime


@dataclass(frozen=True)
class WorkComment:
    id: int
    work_id: int
    user_id: int
    content: str
    created_at: datetime


@dataclass(frozen=True)
class User:
    id: int
    name: str
    role: str
    is_active: bool


@dataclass(frozen=True)
class AuthUser:
    user_id: int
    login_id: str
    password_hash: str


@dataclass(frozen=True)
class WorkItemWithRisks:
    item: WorkItem
    risks: list[RiskAssessment]


@dataclass(frozen=True)
class WorkOverview:
    work: Work
    items: list[WorkItemWithRisks]


@dataclass(frozen=True)
class WorkDetail:
    work: Work
    items: list[WorkItemWithRisks]


@dataclass(frozen=True)
class WorkListItem:
    work: Work
    items: list[WorkItem]
    risk_count: int


@dataclass(frozen=True)
class WorkListPage:
    items: list[WorkListItem]
    total: int
    limit: int
    offset: int


@dataclass(frozen=True)
class WorkDateCount:
    work_date: date
    count: int


@dataclass(frozen=True)
class WorkDateStream:
    work_date: date
    items: list[WorkListItem]


@dataclass(frozen=True)
class RiskSummary:
    work_id: int
    level: str
    score: int
    reasons: list[str] | None
    updated_at: datetime | None


@dataclass(frozen=True)
class Coordinates:
    x: float
    y: float
    width: float | None
    height: float | None


@dataclass(frozen=True)
class WorkLocation:
    id: int
    work_id: int
    name: str
    map_type: str
    map_file_path: str
    coordinates: Coordinates
    description: str | None


@dataclass(frozen=True)
class RiskRecord:
    id: int
    title: str
    severity: str
    status: str
    work_id: int | None
    work_title: str | None
    summary: str
    actions: list[str]
    location_coordinates: Coordinates | None


@dataclass(frozen=True)
class Incident:
    id: int
    title: str
    date: date
    root_cause: str
    corrective_actions: list[str]
    status: str


@dataclass(frozen=True)
class Manual:
    id: int
    title: str
    category: str
    updated_at: date
    summary: str


@dataclass(frozen=True)
class Meeting:
    id: int
    title: str
    date: date
    participants: list[str]
    transcript: str
    extracted_risks: list[RiskRecord]
    sync_state: str


@dataclass(frozen=True)
class MeetingUpload:
    id: int
    meeting_id: int | None
    filename: str
    created_at: datetime


@dataclass(frozen=True)
class MyWorkItem:
    id: int
    work_id: int
    title: str
    status: str
    steps: list[str]
    hazards: list[str]
    tools: list[str]


@dataclass(frozen=True)
class MyWork:
    id: int
    title: str
    description: str
    work_date: date
    group: str
    status: str
    risk_score: int
    items: list[MyWorkItem]
    related_risks: list[RiskRecord]
    incidents: list[str]
    location: WorkLocation | None


@dataclass(frozen=True)
class MyWorkListPage:
    items: list[MyWork]
    total: int
    limit: int
    offset: int


@dataclass(frozen=True)
class WorkAsset:
    photos: list[str]
    audios: list[str]
    notes: list[str]


@dataclass(frozen=True)
class WorkRiskAcknowledgment:
    """作業開始時のリスク確認履歴（法的証跡）"""
    id: int
    work_id: int
    user_id: int
    acknowledged_at: datetime
    signature_base64: str | None
    acknowledged_risk_ids: list[int]
    acknowledged_risks: list[dict[str, str | int | None]]


@dataclass(frozen=True)
class AuditLog:
    """全アクション監査ログ"""
    id: int
    action: str
    user_id: int
    work_id: int | None
    details: str | None
    timestamp: datetime
