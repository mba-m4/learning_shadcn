import json
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func
from sqlmodel import Field, Session, SQLModel, select

from app.domain.models import (
    AuthUser,
    Coordinates,
    Incident,
    Manual,
    Meeting,
    MeetingUpload,
    MyWork,
    MyWorkItem,
    RiskRecord,
    WorkAsset,
    WorkLocation,
    ManualRisk,
    RiskAssessment,
    User,
    Work,
    WorkComment,
    WorkGroup,
    WorkItem,
    WorkRiskAcknowledgment,
    AuditLog,
)
from app.domain.repositories import AuthRepository, SupportRepository, WorkRepository
from app.infrastructure.security import get_password_hash


class WorkGroupTable(SQLModel, table=True):
    __tablename__ = "work_groups"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True, nullable=False)


class WorkTable(SQLModel, table=True):
    __tablename__ = "works"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=100, nullable=False)
    description: str = Field(max_length=500, nullable=False)
    group_id: int = Field(foreign_key="work_groups.id", nullable=False)
    work_date: date = Field(nullable=False)
    status: str = Field(max_length=20, nullable=False, default="draft")


class WorkItemTable(SQLModel, table=True):
    __tablename__ = "work_items"

    id: int | None = Field(default=None, primary_key=True)
    work_id: int = Field(foreign_key="works.id", nullable=False)
    name: str = Field(max_length=100, nullable=False)
    description: str = Field(max_length=300, nullable=False)


class RiskAssessmentTable(SQLModel, table=True):
    __tablename__ = "risk_assessments"

    id: int | None = Field(default=None, primary_key=True)
    work_item_id: int = Field(foreign_key="work_items.id", nullable=False)
    content: str = Field(max_length=1000, nullable=False)
    action: str | None = Field(default=None, max_length=1000, nullable=True)
    generated_at: datetime = Field(nullable=False)


class ManualRiskTable(SQLModel, table=True):
    __tablename__ = "manual_risks"

    id: int | None = Field(default=None, primary_key=True)
    work_item_id: int = Field(foreign_key="work_items.id", nullable=False)
    content: str = Field(max_length=1000, nullable=False)
    action: str | None = Field(default=None, max_length=1000, nullable=True)
    created_at: datetime = Field(nullable=False)


class WorkCommentTable(SQLModel, table=True):
    __tablename__ = "work_comments"

    id: int | None = Field(default=None, primary_key=True)
    work_id: int = Field(foreign_key="works.id", nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    content: str = Field(max_length=500, nullable=False)
    created_at: datetime = Field(nullable=False)


class RiskRecordTable(SQLModel, table=True):
    __tablename__ = "risk_records"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    severity: str = Field(max_length=20, nullable=False)
    status: str = Field(max_length=20, nullable=False)
    work_id: int | None = Field(default=None, nullable=True)
    work_title: str | None = Field(default=None, max_length=200, nullable=True)
    summary: str = Field(max_length=1000, nullable=False)
    actions_json: str = Field(default="[]", nullable=False)
    location_x: float | None = Field(default=None, nullable=True)
    location_y: float | None = Field(default=None, nullable=True)
    location_width: float | None = Field(default=None, nullable=True)
    location_height: float | None = Field(default=None, nullable=True)


class IncidentTable(SQLModel, table=True):
    __tablename__ = "incidents"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    incident_date: date = Field(nullable=False)
    root_cause: str = Field(max_length=1000, nullable=False)
    status: str = Field(max_length=20, nullable=False)
    corrective_actions_json: str = Field(default="[]", nullable=False)


class ManualTable(SQLModel, table=True):
    __tablename__ = "manuals"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    category: str = Field(max_length=100, nullable=False)
    updated_at: date = Field(nullable=False)
    summary: str = Field(max_length=1000, nullable=False)


class MeetingTable(SQLModel, table=True):
    __tablename__ = "meetings"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    meeting_date: date = Field(nullable=False)
    participants_json: str = Field(default="[]", nullable=False)
    transcript: str = Field(max_length=4000, nullable=False)
    extracted_risk_ids_json: str = Field(default="[]", nullable=False)
    sync_state: str = Field(max_length=100, nullable=False, default="待機中")


class MeetingUploadTable(SQLModel, table=True):
    __tablename__ = "meeting_uploads"

    id: int | None = Field(default=None, primary_key=True)
    meeting_id: int | None = Field(default=None, nullable=True)
    filename: str = Field(max_length=200, nullable=False)
    created_at: datetime = Field(nullable=False)


class MyWorkTable(SQLModel, table=True):
    __tablename__ = "my_works"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    description: str = Field(max_length=1000, nullable=False)
    work_date: date = Field(nullable=False)
    group: str = Field(max_length=100, nullable=False)
    status: str = Field(max_length=20, nullable=False)
    risk_score: int = Field(nullable=False)
    incidents_json: str = Field(default="[]", nullable=False)


class MyWorkItemTable(SQLModel, table=True):
    __tablename__ = "my_work_items"

    id: int | None = Field(default=None, primary_key=True)
    work_id: int = Field(foreign_key="my_works.id", nullable=False)
    title: str = Field(max_length=200, nullable=False)
    status: str = Field(max_length=30, nullable=False)
    steps_json: str = Field(default="[]", nullable=False)
    hazards_json: str = Field(default="[]", nullable=False)
    tools_json: str = Field(default="[]", nullable=False)


class MyWorkRiskLinkTable(SQLModel, table=True):
    __tablename__ = "my_work_risk_links"

    work_id: int = Field(foreign_key="my_works.id", primary_key=True)
    risk_id: int = Field(foreign_key="risk_records.id", primary_key=True)


class WorkLocationTable(SQLModel, table=True):
    __tablename__ = "work_locations"

    id: int | None = Field(default=None, primary_key=True)
    work_id: int = Field(foreign_key="my_works.id", nullable=False)
    name: str = Field(max_length=200, nullable=False)
    map_type: str = Field(max_length=20, nullable=False)
    map_file_path: str = Field(max_length=500, nullable=False)
    coord_x: float = Field(nullable=False)
    coord_y: float = Field(nullable=False)
    coord_width: float | None = Field(default=None, nullable=True)
    coord_height: float | None = Field(default=None, nullable=True)
    description: str | None = Field(default=None, max_length=1000, nullable=True)


class WorkAssetTable(SQLModel, table=True):
    __tablename__ = "work_assets"

    id: int | None = Field(default=None, primary_key=True)
    work_id: int = Field(foreign_key="my_works.id", nullable=False)
    asset_type: str = Field(max_length=20, nullable=False)
    value: str = Field(max_length=500, nullable=False)
    created_at: datetime = Field(nullable=False)


class UserTable(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, nullable=False)
    role: str = Field(max_length=30, nullable=False)
    is_active: bool = Field(default=True, nullable=False)


class AuthUserTable(SQLModel, table=True):
    __tablename__ = "auth_users"

    user_id: int = Field(primary_key=True, foreign_key="users.id")
    login_id: str = Field(max_length=50, unique=True, nullable=False)
    password_hash: str = Field(max_length=256, nullable=False)


class WorkRiskAcknowledgmentTable(SQLModel, table=True):
    __tablename__ = "work_risk_acknowledgments"

    id: int | None = Field(default=None, primary_key=True)
    work_id: int = Field(foreign_key="works.id", nullable=False, index=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    acknowledged_at: datetime = Field(nullable=False)
    signature_base64: str | None = Field(default=None, nullable=True)
    acknowledged_risk_ids_json: str = Field(default="[]", nullable=False)
    acknowledged_risks_json: str = Field(default="[]", nullable=False)


class AuditLogTable(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: int | None = Field(default=None, primary_key=True)
    action: str = Field(max_length=50, nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    work_id: int | None = Field(default=None, nullable=True, index=True)
    details: str | None = Field(default=None, nullable=True)
    timestamp: datetime = Field(nullable=False, default_factory=datetime.now, index=True)


def _dump_json(value: list[str] | list[int] | list[dict[str, str | int | None]]) -> str:
    return json.dumps(value, ensure_ascii=False)


def _load_json(
    value: str | None,
    default: list[str] | list[int] | list[dict[str, str | int | None]],
):
    if not value:
        return default
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return default


def _build_coordinates(
    x: float | None,
    y: float | None,
    width: float | None,
    height: float | None,
) -> Coordinates | None:
    if x is None or y is None:
        return None
    return Coordinates(x=x, y=y, width=width, height=height)


class SqlModelRepository(WorkRepository, AuthRepository, SupportRepository):
    def __init__(self, session: Session):
        self._session = session

    def create_work_group(self, name: str) -> WorkGroup:
        record = WorkGroupTable(name=name)
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return WorkGroup(id=record.id, name=record.name)

    def list_work_groups(self) -> list[WorkGroup]:
        records = self._session.exec(select(WorkGroupTable)).all()
        return [WorkGroup(id=row.id, name=row.name) for row in records]

    def create_work(
        self,
        title: str,
        description: str,
        group_id: int,
        work_date: date,
        status: str,
    ) -> Work:
        record = WorkTable(
            title=title,
            description=description,
            group_id=group_id,
            work_date=work_date,
            status=status,
        )
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return Work(
            id=record.id,
            title=record.title,
            description=record.description,
            group_id=record.group_id,
            work_date=record.work_date,
            status=record.status,
        )

    def list_works_by_date(self, work_date: date) -> list[Work]:
        records = self._session.exec(select(WorkTable).where(WorkTable.work_date == work_date)).all()
        return [
            Work(
                id=row.id,
                title=row.title,
                description=row.description,
                group_id=row.group_id,
                work_date=row.work_date,
                status=row.status,
            )
            for row in records
        ]

    def get_work(self, work_id: int) -> Work | None:
        record = self._session.exec(select(WorkTable).where(WorkTable.id == work_id)).first()
        if not record:
            return None
        return Work(
            id=record.id,
            title=record.title,
            description=record.description,
            group_id=record.group_id,
            work_date=record.work_date,
            status=record.status,
        )

    def list_works_by_date_range(
        self,
        start_date: date,
        end_date: date,
        limit: int,
        offset: int,
        group_id: int | None = None,
        keyword: str | None = None,
    ) -> list[Work]:
        filters = [WorkTable.work_date.between(start_date, end_date)]
        if group_id is not None:
            filters.append(WorkTable.group_id == group_id)
        if keyword:
            pattern = f"%{keyword}%"
            filters.append((WorkTable.title.ilike(pattern)) | (WorkTable.description.ilike(pattern)))

        statement = select(WorkTable).where(*filters).order_by(WorkTable.work_date, WorkTable.id)
        statement = statement.limit(limit).offset(offset)
        records = self._session.exec(statement).all()
        return [
            Work(
                id=row.id,
                title=row.title,
                description=row.description,
                group_id=row.group_id,
                work_date=row.work_date,
                status=row.status,
            )
            for row in records
        ]

    def count_works_by_date_range(
        self,
        start_date: date,
        end_date: date,
        group_id: int | None = None,
        keyword: str | None = None,
    ) -> int:
        filters = [WorkTable.work_date.between(start_date, end_date)]
        if group_id is not None:
            filters.append(WorkTable.group_id == group_id)
        if keyword:
            pattern = f"%{keyword}%"
            filters.append((WorkTable.title.ilike(pattern)) | (WorkTable.description.ilike(pattern)))

        statement = select(func.count()).select_from(WorkTable).where(*filters)
        return self._session.exec(statement).one()

    def list_work_date_counts(self, start_date: date, end_date: date) -> list[tuple[date, int]]:
        statement = (
            select(WorkTable.work_date, func.count())
            .where(WorkTable.work_date.between(start_date, end_date))
            .group_by(WorkTable.work_date)
            .order_by(WorkTable.work_date)
        )
        return self._session.exec(statement).all()

    def add_work_item(self, work_id: int, name: str, description: str) -> WorkItem:
        record = WorkItemTable(work_id=work_id, name=name, description=description)
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return WorkItem(
            id=record.id,
            work_id=record.work_id,
            name=record.name,
            description=record.description,
        )

    def list_work_items(self, work_id: int) -> list[WorkItem]:
        records = self._session.exec(select(WorkItemTable).where(WorkItemTable.work_id == work_id)).all()
        return [
            WorkItem(
                id=row.id,
                work_id=row.work_id,
                name=row.name,
                description=row.description,
            )
            for row in records
        ]

    def get_work_item(self, work_item_id: int) -> WorkItem | None:
        record = self._session.get(WorkItemTable, work_item_id)
        if not record:
            return None
        return WorkItem(
            id=record.id,
            work_id=record.work_id,
            name=record.name,
            description=record.description,
        )

    def create_risk_assessment(
        self,
        work_item_id: int,
        content: str,
        action: str | None = None,
    ) -> RiskAssessment:
        record = RiskAssessmentTable(
            work_item_id=work_item_id,
            content=content,
            action=action,
            generated_at=datetime.now(timezone.utc),
        )
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return RiskAssessment(
            id=record.id,
            work_item_id=record.work_item_id,
            content=record.content,
            action=record.action,
            generated_at=record.generated_at,
        )

    def list_risk_assessments(self, work_item_id: int) -> list[RiskAssessment]:
        records = self._session.exec(
            select(RiskAssessmentTable).where(RiskAssessmentTable.work_item_id == work_item_id)
        ).all()
        return [
            RiskAssessment(
                id=row.id,
                work_item_id=row.work_item_id,
                content=row.content,
                action=row.action,
                generated_at=row.generated_at,
            )
            for row in records
        ]

    def get_risk_assessment(self, risk_id: int) -> RiskAssessment | None:
        record = self._session.get(RiskAssessmentTable, risk_id)
        if not record:
            return None
        return RiskAssessment(
            id=record.id,
            work_item_id=record.work_item_id,
            content=record.content,
            action=record.action,
            generated_at=record.generated_at,
        )

    def update_risk_assessment(
        self,
        risk_id: int,
        content: str | None,
        action: str | None,
    ) -> RiskAssessment | None:
        record = self._session.get(RiskAssessmentTable, risk_id)
        if not record:
            return None
        if content is not None:
            record.content = content
        if action is not None:
            record.action = action
        record.generated_at = datetime.now(timezone.utc)
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return RiskAssessment(
            id=record.id,
            work_item_id=record.work_item_id,
            content=record.content,
            action=record.action,
            generated_at=record.generated_at,
        )

    def delete_risk_assessment(self, risk_id: int) -> bool:
        record = self._session.get(RiskAssessmentTable, risk_id)
        if not record:
            return False
        self._session.delete(record)
        self._session.commit()
        return True

    def create_manual_risk(
        self,
        work_item_id: int,
        content: str,
        action: str | None = None,
    ) -> ManualRisk:
        record = ManualRiskTable(
            work_item_id=work_item_id,
            content=content,
            action=action,
            created_at=datetime.now(timezone.utc),
        )
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return ManualRisk(
            id=record.id,
            work_item_id=record.work_item_id,
            content=record.content,
            action=record.action,
            created_at=record.created_at,
        )

    def list_manual_risks(self, work_item_id: int) -> list[ManualRisk]:
        records = self._session.exec(
            select(ManualRiskTable).where(ManualRiskTable.work_item_id == work_item_id)
        ).all()
        return [
            ManualRisk(
                id=row.id,
                work_item_id=row.work_item_id,
                content=row.content,
                action=row.action,
                created_at=row.created_at,
            )
            for row in records
        ]

    def get_manual_risk(self, risk_id: int) -> ManualRisk | None:
        record = self._session.get(ManualRiskTable, risk_id)
        if not record:
            return None
        return ManualRisk(
            id=record.id,
            work_item_id=record.work_item_id,
            content=record.content,
            action=record.action,
            created_at=record.created_at,
        )

    def update_manual_risk(
        self,
        risk_id: int,
        content: str | None,
        action: str | None,
    ) -> ManualRisk | None:
        record = self._session.get(ManualRiskTable, risk_id)
        if not record:
            return None
        if content is not None:
            record.content = content
        if action is not None:
            record.action = action
        record.created_at = datetime.now(timezone.utc)
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return ManualRisk(
            id=record.id,
            work_item_id=record.work_item_id,
            content=record.content,
            action=record.action,
            created_at=record.created_at,
        )

    def delete_manual_risk(self, risk_id: int) -> bool:
        record = self._session.get(ManualRiskTable, risk_id)
        if not record:
            return False
        self._session.delete(record)
        self._session.commit()
        return True

    def add_comment(self, work_id: int, user_id: int, content: str) -> WorkComment:
        record = WorkCommentTable(
            work_id=work_id,
            user_id=user_id,
            content=content,
            created_at=datetime.now(timezone.utc),
        )
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return WorkComment(
            id=record.id,
            work_id=record.work_id,
            user_id=record.user_id,
            content=record.content,
            created_at=record.created_at,
        )

    def list_comments(self, work_id: int) -> list[WorkComment]:
        records = self._session.exec(
            select(WorkCommentTable).where(WorkCommentTable.work_id == work_id).order_by(WorkCommentTable.created_at)
        ).all()
        return [
            WorkComment(
                id=row.id,
                work_id=row.work_id,
                user_id=row.user_id,
                content=row.content,
                created_at=row.created_at,
            )
            for row in records
        ]

    def acknowledge_risks(
        self,
        work_id: int,
        user_id: int,
        acknowledged_risk_ids: list[int],
        acknowledged_risks: list[dict[str, str | int | None]],
        signature_base64: str | None = None,
    ) -> WorkRiskAcknowledgment:
        """リスク確認（署名）を記録"""
        ack = WorkRiskAcknowledgmentTable(
            work_id=work_id,
            user_id=user_id,
            acknowledged_at=datetime.now(timezone.utc),
            signature_base64=signature_base64,
            acknowledged_risk_ids_json=_dump_json(acknowledged_risk_ids),
            acknowledged_risks_json=_dump_json(acknowledged_risks),
        )
        self._session.add(ack)
        self._session.commit()
        self._session.refresh(ack)
        
        # 監査ログ記録
        self.add_audit_log(
            action="acknowledge_risks",
            user_id=user_id,
            work_id=work_id,
            details=f"Acknowledged {len(acknowledged_risk_ids)} risks",
        )
        
        return WorkRiskAcknowledgment(
            id=ack.id,
            work_id=ack.work_id,
            user_id=ack.user_id,
            acknowledged_at=ack.acknowledged_at,
            signature_base64=ack.signature_base64,
            acknowledged_risk_ids=_load_json(ack.acknowledged_risk_ids_json, []),
            acknowledged_risks=_load_json(ack.acknowledged_risks_json, []),
        )

    def get_acknowledgment(self, work_id: int, user_id: int) -> WorkRiskAcknowledgment | None:
        """ユーザーの作業に対する確認情報を取得"""
        record = self._session.exec(
            select(WorkRiskAcknowledgmentTable)
            .where(WorkRiskAcknowledgmentTable.work_id == work_id)
            .where(WorkRiskAcknowledgmentTable.user_id == user_id)
        ).first()
        
        if not record:
            return None
        
        return WorkRiskAcknowledgment(
            id=record.id,
            work_id=record.work_id,
            user_id=record.user_id,
            acknowledged_at=record.acknowledged_at,
            signature_base64=record.signature_base64,
            acknowledged_risk_ids=_load_json(record.acknowledged_risk_ids_json, []),
            acknowledged_risks=_load_json(record.acknowledged_risks_json, []),
        )

    def list_acknowledgments(self, work_id: int) -> list[WorkRiskAcknowledgment]:
        """作業に対するすべてのリスク確認を取得"""
        records = self._session.exec(
            select(WorkRiskAcknowledgmentTable)
            .where(WorkRiskAcknowledgmentTable.work_id == work_id)
            .order_by(WorkRiskAcknowledgmentTable.acknowledged_at.desc())
        ).all()
        
        return [
            WorkRiskAcknowledgment(
                id=row.id,
                work_id=row.work_id,
                user_id=row.user_id,
                acknowledged_at=row.acknowledged_at,
                signature_base64=row.signature_base64,
                acknowledged_risk_ids=_load_json(row.acknowledged_risk_ids_json, []),
                acknowledged_risks=_load_json(row.acknowledged_risks_json, []),
            )
            for row in records
        ]

    def add_audit_log(
        self,
        action: str,
        user_id: int,
        work_id: int | None = None,
        details: str | None = None,
    ) -> AuditLog:
        """監査ログを追加"""
        log = AuditLogTable(
            action=action,
            user_id=user_id,
            work_id=work_id,
            details=details,
            timestamp=datetime.now(timezone.utc),
        )
        self._session.add(log)
        self._session.commit()
        self._session.refresh(log)
        
        return AuditLog(
            id=log.id,
            action=log.action,
            user_id=log.user_id,
            work_id=log.work_id,
            details=log.details,
            timestamp=log.timestamp,
        )

    def list_audit_logs(
        self,
        work_id: int | None = None,
        user_id: int | None = None,
        limit: int = 1000,
    ) -> list[AuditLog]:
        """監査ログを検索"""
        query = select(AuditLogTable)
        
        if work_id:
            query = query.where(AuditLogTable.work_id == work_id)
        if user_id:
            query = query.where(AuditLogTable.user_id == user_id)
        
        query = query.order_by(AuditLogTable.timestamp.desc()).limit(limit)
        
        records = self._session.exec(query).all()
        
        return [
            AuditLog(
                id=row.id,
                action=row.action,
                user_id=row.user_id,
                work_id=row.work_id,
                details=row.details,
                timestamp=row.timestamp,
            )
            for row in records
        ]

    def get_auth_user_by_login_id(self, login_id: str) -> AuthUser | None:
        record = self._session.exec(select(AuthUserTable).where(AuthUserTable.login_id == login_id)).first()
        if not record:
            return None
        return AuthUser(user_id=record.user_id, login_id=record.login_id, password_hash=record.password_hash)

    def get_user(self, user_id: int) -> User | None:
        record = self._session.exec(select(UserTable).where(UserTable.id == user_id)).first()
        if not record:
            return None
        return User(id=record.id, name=record.name, role=record.role, is_active=record.is_active)

    def _build_risk_record(self, record: RiskRecordTable) -> RiskRecord:
        actions = _load_json(record.actions_json, [])
        location = _build_coordinates(
            record.location_x,
            record.location_y,
            record.location_width,
            record.location_height,
        )
        return RiskRecord(
            id=record.id,
            title=record.title,
            severity=record.severity,
            status=record.status,
            work_id=record.work_id,
            work_title=record.work_title,
            summary=record.summary,
            actions=list(actions),
            location_coordinates=location,
        )

    def _list_risk_records_by_ids(self, ids: list[int]) -> list[RiskRecord]:
        if not ids:
            return []
        records = self._session.exec(select(RiskRecordTable).where(RiskRecordTable.id.in_(ids))).all()
        mapping = {row.id: self._build_risk_record(row) for row in records}
        return [mapping[risk_id] for risk_id in ids if risk_id in mapping]

    def list_risk_records(self) -> list[RiskRecord]:
        records = self._session.exec(select(RiskRecordTable).order_by(RiskRecordTable.id)).all()
        return [self._build_risk_record(row) for row in records]

    def get_risk_record(self, risk_id: int) -> RiskRecord | None:
        record = self._session.exec(select(RiskRecordTable).where(RiskRecordTable.id == risk_id)).first()
        if not record:
            return None
        return self._build_risk_record(record)

    def update_risk_status(self, risk_id: int, status: str) -> RiskRecord | None:
        record = self._session.exec(select(RiskRecordTable).where(RiskRecordTable.id == risk_id)).first()
        if not record:
            return None
        record.status = status
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return self._build_risk_record(record)

    def update_risk_severity(self, risk_id: int, severity: str) -> RiskRecord | None:
        record = self._session.exec(select(RiskRecordTable).where(RiskRecordTable.id == risk_id)).first()
        if not record:
            return None
        record.severity = severity
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return self._build_risk_record(record)

    def add_risk_action(self, risk_id: int, action: str) -> RiskRecord | None:
        record = self._session.exec(select(RiskRecordTable).where(RiskRecordTable.id == risk_id)).first()
        if not record:
            return None
        actions = list(_load_json(record.actions_json, []))
        actions.append(action)
        record.actions_json = _dump_json(actions)
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return self._build_risk_record(record)

    def list_incidents(self) -> list[Incident]:
        records = self._session.exec(select(IncidentTable).order_by(IncidentTable.incident_date.desc())).all()
        return [
            Incident(
                id=row.id,
                title=row.title,
                date=row.incident_date,
                root_cause=row.root_cause,
                corrective_actions=list(_load_json(row.corrective_actions_json, [])),
                status=row.status,
            )
            for row in records
        ]

    def create_incident(
        self,
        title: str,
        incident_date: date,
        root_cause: str,
        corrective_actions: list[str],
        status: str,
    ) -> Incident:
        record = IncidentTable(
            title=title,
            incident_date=incident_date,
            root_cause=root_cause,
            status=status,
            corrective_actions_json=_dump_json(corrective_actions),
        )
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return Incident(
            id=record.id,
            title=record.title,
            date=record.incident_date,
            root_cause=record.root_cause,
            corrective_actions=list(_load_json(record.corrective_actions_json, [])),
            status=record.status,
        )

    def get_incident(self, incident_id: int) -> Incident | None:
        record = self._session.exec(select(IncidentTable).where(IncidentTable.id == incident_id)).first()
        if not record:
            return None
        return Incident(
            id=record.id,
            title=record.title,
            date=record.incident_date,
            root_cause=record.root_cause,
            corrective_actions=list(_load_json(record.corrective_actions_json, [])),
            status=record.status,
        )

    def update_incident_status(self, incident_id: int, status: str) -> Incident | None:
        record = self._session.exec(select(IncidentTable).where(IncidentTable.id == incident_id)).first()
        if not record:
            return None
        record.status = status
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return self.get_incident(incident_id)

    def add_incident_action(self, incident_id: int, action: str) -> Incident | None:
        record = self._session.exec(select(IncidentTable).where(IncidentTable.id == incident_id)).first()
        if not record:
            return None
        actions = list(_load_json(record.corrective_actions_json, []))
        actions.append(action)
        record.corrective_actions_json = _dump_json(actions)
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return self.get_incident(incident_id)

    def list_manuals(self) -> list[Manual]:
        records = self._session.exec(select(ManualTable).order_by(ManualTable.updated_at.desc())).all()
        return [
            Manual(
                id=row.id,
                title=row.title,
                category=row.category,
                updated_at=row.updated_at,
                summary=row.summary,
            )
            for row in records
        ]

    def get_manual(self, manual_id: int) -> Manual | None:
        record = self._session.exec(select(ManualTable).where(ManualTable.id == manual_id)).first()
        if not record:
            return None
        return Manual(
            id=record.id,
            title=record.title,
            category=record.category,
            updated_at=record.updated_at,
            summary=record.summary,
        )

    def _build_meeting(self, record: MeetingTable) -> Meeting:
        participants = list(_load_json(record.participants_json, []))
        risk_ids = list(_load_json(record.extracted_risk_ids_json, []))
        extracted = self._list_risk_records_by_ids(risk_ids)
        return Meeting(
            id=record.id,
            title=record.title,
            date=record.meeting_date,
            participants=participants,
            transcript=record.transcript,
            extracted_risks=extracted,
            sync_state=record.sync_state,
        )

    def list_meetings(self) -> list[Meeting]:
        records = self._session.exec(select(MeetingTable).order_by(MeetingTable.meeting_date.desc())).all()
        return [self._build_meeting(row) for row in records]

    def get_meeting(self, meeting_id: int) -> Meeting | None:
        record = self._session.exec(select(MeetingTable).where(MeetingTable.id == meeting_id)).first()
        if not record:
            return None
        return self._build_meeting(record)

    def update_meeting_sync_state(self, meeting_id: int, state: str) -> Meeting | None:
        record = self._session.exec(select(MeetingTable).where(MeetingTable.id == meeting_id)).first()
        if not record:
            return None
        record.sync_state = state
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return self._build_meeting(record)

    def add_meeting_uploads(self, meeting_id: int | None, files: list[str]) -> list[MeetingUpload]:
        now = datetime.now(timezone.utc)
        uploads = [
            MeetingUploadTable(meeting_id=meeting_id, filename=filename, created_at=now)
            for filename in files
        ]
        self._session.add_all(uploads)
        self._session.commit()
        for record in uploads:
            self._session.refresh(record)
        return [
            MeetingUpload(
                id=row.id,
                meeting_id=row.meeting_id,
                filename=row.filename,
                created_at=row.created_at,
            )
            for row in uploads
        ]

    def list_meeting_uploads(self, meeting_id: int | None) -> list[MeetingUpload]:
        if meeting_id is None:
            statement = select(MeetingUploadTable).where(MeetingUploadTable.meeting_id.is_(None))
        else:
            statement = select(MeetingUploadTable).where(MeetingUploadTable.meeting_id == meeting_id)
        records = self._session.exec(statement.order_by(MeetingUploadTable.created_at.desc())).all()
        return [
            MeetingUpload(
                id=row.id,
                meeting_id=row.meeting_id,
                filename=row.filename,
                created_at=row.created_at,
            )
            for row in records
        ]

    def _list_my_work_items(self, work_id: int) -> list[MyWorkItem]:
        records = self._session.exec(select(MyWorkItemTable).where(MyWorkItemTable.work_id == work_id)).all()
        return [
            MyWorkItem(
                id=row.id,
                work_id=row.work_id,
                title=row.title,
                status=row.status,
                steps=list(_load_json(row.steps_json, [])),
                hazards=list(_load_json(row.hazards_json, [])),
                tools=list(_load_json(row.tools_json, [])),
            )
            for row in records
        ]

    def _get_my_work_location(self, work_id: int) -> WorkLocation | None:
        record = self._session.exec(select(WorkLocationTable).where(WorkLocationTable.work_id == work_id)).first()
        if not record:
            return None
        coordinates = Coordinates(
            x=record.coord_x,
            y=record.coord_y,
            width=record.coord_width,
            height=record.coord_height,
        )
        return WorkLocation(
            id=record.id,
            work_id=record.work_id,
            name=record.name,
            map_type=record.map_type,
            map_file_path=record.map_file_path,
            coordinates=coordinates,
            description=record.description,
        )

    def _list_my_work_risks(self, work_id: int) -> list[RiskRecord]:
        link_records = self._session.exec(select(MyWorkRiskLinkTable).where(MyWorkRiskLinkTable.work_id == work_id)).all()
        risk_ids = [row.risk_id for row in link_records]
        return self._list_risk_records_by_ids(risk_ids)

    def _build_my_work(self, record: MyWorkTable) -> MyWork:
        items = self._list_my_work_items(record.id)
        related_risks = self._list_my_work_risks(record.id)
        incidents = list(_load_json(record.incidents_json, []))
        location = self._get_my_work_location(record.id)
        return MyWork(
            id=record.id,
            title=record.title,
            description=record.description,
            work_date=record.work_date,
            group=record.group,
            status=record.status,
            risk_score=record.risk_score,
            items=items,
            related_risks=related_risks,
            incidents=incidents,
            location=location,
        )

    def list_my_works(
        self,
        limit: int = 20,
        offset: int = 0,
    ) -> list[MyWork]:
        statement = select(MyWorkTable).order_by(MyWorkTable.work_date.desc()).limit(limit).offset(offset)
        records = self._session.exec(statement).all()
        return [self._build_my_work(row) for row in records]

    def count_my_works(self) -> int:
        statement = select(func.count(MyWorkTable.id))
        result = self._session.exec(statement).one()
        return result if isinstance(result, int) else 0

    def get_my_work(self, work_id: int) -> MyWork | None:
        record = self._session.exec(select(MyWorkTable).where(MyWorkTable.id == work_id)).first()
        if not record:
            return None
        return self._build_my_work(record)

    def get_work_assets(self, work_id: int) -> WorkAsset:
        records = self._session.exec(select(WorkAssetTable).where(WorkAssetTable.work_id == work_id)).all()
        photos: list[str] = []
        audios: list[str] = []
        notes: list[str] = []
        for row in records:
            if row.asset_type == "photo":
                photos.append(row.value)
            elif row.asset_type == "audio":
                audios.append(row.value)
            elif row.asset_type == "note":
                notes.append(row.value)
        return WorkAsset(photos=photos, audios=audios, notes=notes)

    def _add_work_assets(self, work_id: int, asset_type: str, values: list[str]) -> WorkAsset:
        if not values:
            return self.get_work_assets(work_id)
        now = datetime.now(timezone.utc)
        records = [
            WorkAssetTable(work_id=work_id, asset_type=asset_type, value=value, created_at=now)
            for value in values
        ]
        self._session.add_all(records)
        self._session.commit()
        return self.get_work_assets(work_id)

    def add_work_photos(self, work_id: int, files: list[str]) -> WorkAsset:
        return self._add_work_assets(work_id, "photo", files)

    def add_work_audios(self, work_id: int, files: list[str]) -> WorkAsset:
        return self._add_work_assets(work_id, "audio", files)

    def add_work_note(self, work_id: int, note: str) -> WorkAsset:
        return self._add_work_assets(work_id, "note", [note])


def seed_default_users(session: Session) -> None:
    existing = session.exec(select(UserTable)).first()
    if existing:
        return

    users = [
        UserTable(name="Leader", role="leader", is_active=True),
        UserTable(name="Worker", role="worker", is_active=True),
        UserTable(name="Safety", role="safety_manager", is_active=True),
    ]
    session.add_all(users)
    session.commit()

    auth_users = [
        AuthUserTable(user_id=users[0].id, login_id="leader", password_hash=get_password_hash("leaderpass")),
        AuthUserTable(user_id=users[1].id, login_id="worker", password_hash=get_password_hash("workerpass")),
        AuthUserTable(user_id=users[2].id, login_id="safety", password_hash=get_password_hash("safetypass")),
    ]
    session.add_all(auth_users)
    session.commit()


def seed_sample_data(session: Session) -> None:
    existing = session.exec(select(WorkGroupTable)).first()
    if existing:
        return

    base_date = date.today()
    groups = [
        WorkGroupTable(name="設備点検"),
        WorkGroupTable(name="安全巡視"),
        WorkGroupTable(name="清掃作業"),
    ]
    session.add_all(groups)
    session.commit()

    works = [
        WorkTable(
            title="配管点検",
            description="配管の目視点検",
            group_id=groups[0].id,
            work_date=base_date - timedelta(days=75),
            status="confirmed",
        ),
        WorkTable(
            title="電源盤点検",
            description="電源盤の温度確認",
            group_id=groups[0].id,
            work_date=base_date - timedelta(days=45),
            status="draft",
        ),
        WorkTable(
            title="通路清掃",
            description="通路の清掃と障害物除去",
            group_id=groups[2].id,
            work_date=base_date - timedelta(days=20),
            status="confirmed",
        ),
        WorkTable(
            title="設備安全巡視",
            description="設備周辺の安全巡視",
            group_id=groups[1].id,
            work_date=base_date - timedelta(days=10),
            status="confirmed",
        ),
        WorkTable(
            title="高所点検",
            description="足場の安全確認",
            group_id=groups[1].id,
            work_date=base_date,
            status="confirmed",
        ),
        WorkTable(
            title="資材搬入",
            description="資材搬入ルートの確認",
            group_id=groups[2].id,
            work_date=base_date + timedelta(days=5),
            status="draft",
        ),
        WorkTable(
            title="配線整理",
            description="配線の整理と結束",
            group_id=groups[0].id,
            work_date=base_date + timedelta(days=20),
            status="confirmed",
        ),
        WorkTable(
            title="非常灯点検",
            description="非常灯の点灯確認",
            group_id=groups[1].id,
            work_date=base_date + timedelta(days=35),
            status="confirmed",
        ),
    ]
    session.add_all(works)
    session.commit()

    items = [
        WorkItemTable(work_id=works[0].id, name="バルブ確認", description="締結状態の確認"),
        WorkItemTable(work_id=works[0].id, name="配管漏れ確認", description="目視で漏れを確認"),
        WorkItemTable(work_id=works[1].id, name="温度測定", description="温度計で測定"),
        WorkItemTable(work_id=works[1].id, name="異音確認", description="異音の有無を確認"),
        WorkItemTable(work_id=works[2].id, name="床清掃", description="清掃と滑り止め確認"),
        WorkItemTable(work_id=works[2].id, name="障害物除去", description="通路の障害物除去"),
        WorkItemTable(work_id=works[3].id, name="消火設備確認", description="消火器の配置確認"),
        WorkItemTable(work_id=works[3].id, name="掲示物確認", description="注意喚起掲示の確認"),
        WorkItemTable(work_id=works[4].id, name="足場確認", description="足場の固定状態確認"),
        WorkItemTable(work_id=works[4].id, name="落下防止", description="安全帯の確認"),
        WorkItemTable(work_id=works[5].id, name="搬入経路確認", description="動線確保の確認"),
        WorkItemTable(work_id=works[5].id, name="荷下ろし注意", description="荷下ろし時の指差し確認"),
        WorkItemTable(work_id=works[6].id, name="結束作業", description="結束バンドの固定"),
        WorkItemTable(work_id=works[6].id, name="通電確認", description="通電前の最終確認"),
        WorkItemTable(work_id=works[7].id, name="点灯確認", description="非常灯の点灯確認"),
        WorkItemTable(work_id=works[7].id, name="電池交換", description="劣化電池の交換"),
    ]
    session.add_all(items)
    session.commit()

    now = datetime.now(timezone.utc)
    ai_risks = [
        RiskAssessmentTable(
            work_item_id=items[0].id,
            content="配管周辺の転倒に注意",
            generated_at=now - timedelta(hours=6),
        ),
        RiskAssessmentTable(
            work_item_id=items[1].id,
            content="漏れ確認時の保護具着用",
            generated_at=now - timedelta(hours=5),
        ),
        RiskAssessmentTable(
            work_item_id=items[2].id,
            content="高温部のやけど注意",
            generated_at=now - timedelta(hours=4),
        ),
        RiskAssessmentTable(
            work_item_id=items[3].id,
            content="騒音が大きい場合は聴覚保護具",
            generated_at=now - timedelta(hours=3),
        ),
        RiskAssessmentTable(
            work_item_id=items[4].id,
            content="床面の滑りに注意",
            generated_at=now - timedelta(hours=2),
        ),
        RiskAssessmentTable(
            work_item_id=items[6].id,
            content="消火器の期限切れ確認",
            generated_at=now - timedelta(hours=1),
        ),
        RiskAssessmentTable(
            work_item_id=items[8].id,
            content="足場の緩み確認",
            generated_at=now - timedelta(minutes=50),
        ),
        RiskAssessmentTable(
            work_item_id=items[10].id,
            content="搬入中の接触に注意",
            generated_at=now - timedelta(minutes=40),
        ),
        RiskAssessmentTable(
            work_item_id=items[12].id,
            content="配線の巻き込み注意",
            generated_at=now - timedelta(minutes=30),
        ),
        RiskAssessmentTable(
            work_item_id=items[14].id,
            content="非常灯の点灯方向確認",
            generated_at=now - timedelta(minutes=20),
        ),
    ]
    session.add_all(ai_risks)
    session.commit()

    manual_risks = [
        ManualRiskTable(
            work_item_id=items[0].id,
            content="足元のコードに注意",
            created_at=now - timedelta(hours=5, minutes=30),
        ),
        ManualRiskTable(
            work_item_id=items[2].id,
            content="測定時は2人で実施",
            created_at=now - timedelta(hours=4, minutes=30),
        ),
        ManualRiskTable(
            work_item_id=items[4].id,
            content="清掃中は進入禁止表示",
            created_at=now - timedelta(hours=1, minutes=30),
        ),
        ManualRiskTable(
            work_item_id=items[6].id,
            content="配置図と実物の差異確認",
            created_at=now - timedelta(minutes=45),
        ),
        ManualRiskTable(
            work_item_id=items[9].id,
            content="作業前に安全帯の点検",
            created_at=now - timedelta(minutes=35),
        ),
        ManualRiskTable(
            work_item_id=items[11].id,
            content="搬入時の合図を統一",
            created_at=now - timedelta(minutes=25),
        ),
        ManualRiskTable(
            work_item_id=items[13].id,
            content="通電前に周辺立入禁止",
            created_at=now - timedelta(minutes=15),
        ),
        ManualRiskTable(
            work_item_id=items[15].id,
            content="交換後の点灯確認を実施",
            created_at=now - timedelta(minutes=5),
        ),
    ]
    session.add_all(manual_risks)
    session.commit()

    users = session.exec(select(UserTable).order_by(UserTable.id)).all()
    leader = users[0]
    worker = users[1]

    comments = [
        WorkCommentTable(
            work_id=works[0].id,
            user_id=leader.id,
            content="作業前の確認を実施済み",
            created_at=now - timedelta(hours=2, minutes=15),
        ),
        WorkCommentTable(
            work_id=works[0].id,
            user_id=worker.id,
            content="保護具の準備完了",
            created_at=now - timedelta(hours=1, minutes=50),
        ),
        WorkCommentTable(
            work_id=works[1].id,
            user_id=leader.id,
            content="温度計の校正を確認",
            created_at=now - timedelta(hours=1, minutes=20),
        ),
        WorkCommentTable(
            work_id=works[2].id,
            user_id=worker.id,
            content="通路幅の確保済み",
            created_at=now - timedelta(minutes=35),
        ),
        WorkCommentTable(
            work_id=works[4].id,
            user_id=leader.id,
            content="足場の点検を先に実施",
            created_at=now - timedelta(minutes=30),
        ),
        WorkCommentTable(
            work_id=works[5].id,
            user_id=worker.id,
            content="搬入ルートの障害物除去済み",
            created_at=now - timedelta(minutes=25),
        ),
        WorkCommentTable(
            work_id=works[6].id,
            user_id=leader.id,
            content="配線整理は午後に実施予定",
            created_at=now - timedelta(minutes=20),
        ),
        WorkCommentTable(
            work_id=works[7].id,
            user_id=worker.id,
            content="予備電池を準備済み",
            created_at=now - timedelta(minutes=10),
        ),
    ]
    session.add_all(comments)
    session.commit()

    my_works = [
        MyWorkTable(
            title="製造ラインA 定期点検",
            description="月次の設備点検と安全確認を実施。",
            work_date=base_date,
            group="設備点検",
            status="in_progress",
            risk_score=78,
            incidents_json=_dump_json(["2025-12 転倒事故"]),
        ),
        MyWorkTable(
            title="資材搬入",
            description="新製品ライン立上げの資材搬入。",
            work_date=base_date,
            group="物流",
            status="pending",
            risk_score=54,
            incidents_json=_dump_json([]),
        ),
    ]
    session.add_all(my_works)
    session.commit()
    for row in my_works:
        session.refresh(row)

    my_work_items = [
        MyWorkItemTable(
            work_id=my_works[0].id,
            title="電気系統の点検",
            status="completed",
            steps_json=_dump_json(["電源遮断", "配線確認", "絶縁測定"]),
            hazards_json=_dump_json(["感電", "火花"]),
            tools_json=_dump_json(["絶縁手袋", "テスター"]),
        ),
        MyWorkItemTable(
            work_id=my_works[0].id,
            title="機械部品の潤滑",
            status="in_progress",
            steps_json=_dump_json(["停止確認", "潤滑油注入", "動作確認"]),
            hazards_json=_dump_json(["挟み込み"]),
            tools_json=_dump_json(["保護メガネ", "グリスガン"]),
        ),
        MyWorkItemTable(
            work_id=my_works[1].id,
            title="搬入導線確認",
            status="pending",
            steps_json=_dump_json(["導線確認", "誘導員配置"]),
            hazards_json=_dump_json(["接触事故"]),
            tools_json=_dump_json(["誘導旗"]),
        ),
    ]
    session.add_all(my_work_items)
    session.commit()

    work_locations = [
        WorkLocationTable(
            work_id=my_works[0].id,
            name="製造ラインA",
            map_type="image",
            map_file_path="https://images.unsplash.com/photo-1581092163562-40de08070ea0?w=800&h=600&fit=crop",
            coord_x=300,
            coord_y=250,
            coord_width=150,
            coord_height=100,
            description="高温配管が複数通っており、火傷リスクが高い。",
        ),
        WorkLocationTable(
            work_id=my_works[1].id,
            name="資材搬入口",
            map_type="image",
            map_file_path="https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=800&h=600&fit=crop",
            coord_x=150,
            coord_y=100,
            coord_width=120,
            coord_height=80,
            description="フォークリフトとの動線交差が発生しやすい。",
        ),
    ]
    session.add_all(work_locations)
    session.commit()

    risk_records = [
        RiskRecordTable(
            title="高温配管の火傷リスク",
            severity="high",
            status="open",
            work_id=my_works[0].id,
            work_title=my_works[0].title,
            summary="保温材の劣化で露出箇所があり、接触事故の可能性。",
            actions_json=_dump_json(["保温材の補修", "接近時は耐熱手袋を着用"]),
            location_x=320,
            location_y=270,
            location_width=30,
            location_height=30,
        ),
        RiskRecordTable(
            title="フォークリフト動線衝突",
            severity="medium",
            status="in_review",
            work_id=my_works[1].id,
            work_title=my_works[1].title,
            summary="作業導線と物流導線の交差が発生。",
            actions_json=_dump_json(["誘導員配置", "停止線の再掲示"]),
            location_x=200,
            location_y=130,
            location_width=25,
            location_height=25,
        ),
        RiskRecordTable(
            title="電源遮断漏れ",
            severity="low",
            status="closed",
            work_id=my_works[0].id,
            work_title=my_works[0].title,
            summary="ロックアウト手順の確認漏れ。",
            actions_json=_dump_json(["チェックリスト改訂"]),
            location_x=280,
            location_y=240,
            location_width=20,
            location_height=20,
        ),
    ]
    session.add_all(risk_records)
    session.commit()
    for record in risk_records:
        session.refresh(record)

    risk_links = [
        MyWorkRiskLinkTable(work_id=my_works[0].id, risk_id=risk_records[0].id),
        MyWorkRiskLinkTable(work_id=my_works[0].id, risk_id=risk_records[2].id),
        MyWorkRiskLinkTable(work_id=my_works[1].id, risk_id=risk_records[1].id),
    ]
    session.add_all(risk_links)
    session.commit()

    incidents = [
        IncidentTable(
            title="作業通路での転倒",
            incident_date=date(2025, 12, 18),
            root_cause="床面の油汚れと注意喚起不足。",
            corrective_actions_json=_dump_json(["清掃頻度の増加", "注意標識の追加"]),
            status="resolved",
        )
    ]
    session.add_all(incidents)
    session.commit()

    manuals = [
        ManualTable(
            title="ロックアウト/タグアウト手順",
            category="安全手順",
            updated_at=date(2026, 1, 20),
            summary="電源遮断時の手順と確認項目。",
        ),
        ManualTable(
            title="フォークリフト運転ルール",
            category="物流",
            updated_at=date(2025, 12, 5),
            summary="構内搬送の安全ルールと禁止事項。",
        ),
    ]
    session.add_all(manuals)
    session.commit()

    meetings = [
        MeetingTable(
            title="安全レビュー 2月週次",
            meeting_date=date(2026, 2, 12),
            participants_json=_dump_json(["田中", "佐藤", "鈴木"]),
            transcript="本週はラインAの保温材劣化が目立つ。補修の優先度を上げる。",
            extracted_risk_ids_json=_dump_json([risk_records[0].id]),
            sync_state="待機中",
        )
    ]
    session.add_all(meetings)
    session.commit()
