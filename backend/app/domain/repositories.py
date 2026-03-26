from abc import ABC, abstractmethod
from datetime import date

from app.domain.models import (
    AuthUser,
    Incident,
    Manual,
    Meeting,
    MeetingUpload,
    MyWork,
    RiskRecord,
    WorkAsset,
    RiskAssessment,
    ManualRisk,
    User,
    Work,
    WorkComment,
    WorkGroup,
    WorkItem,
    WorkRiskAcknowledgment,
    AuditLog,
)


class WorkRepository(ABC):
    @abstractmethod
    def create_work_group(self, name: str) -> WorkGroup: ...

    @abstractmethod
    def list_work_groups(self) -> list[WorkGroup]: ...

    @abstractmethod
    def create_work(
        self,
        title: str,
        description: str,
        group_id: int,
        work_date: date,
        status: str,
    ) -> Work: ...

    @abstractmethod
    def list_works_by_date(self, work_date: date) -> list[Work]: ...

    @abstractmethod
    def get_work(self, work_id: int) -> Work | None: ...

    @abstractmethod
    def list_works_by_date_range(
        self,
        start_date: date,
        end_date: date,
        limit: int,
        offset: int,
        group_id: int | None = None,
        keyword: str | None = None,
    ) -> list[Work]: ...

    @abstractmethod
    def count_works_by_date_range(
        self,
        start_date: date,
        end_date: date,
        group_id: int | None = None,
        keyword: str | None = None,
    ) -> int: ...

    @abstractmethod
    def list_work_date_counts(self, start_date: date, end_date: date) -> list[tuple[date, int]]: ...

    @abstractmethod
    def add_work_item(
        self,
        work_id: int,
        name: str,
        description: str,
    ) -> WorkItem: ...

    @abstractmethod
    def list_work_items(self, work_id: int) -> list[WorkItem]: ...

    @abstractmethod
    def get_work_item(self, work_item_id: int) -> WorkItem | None: ...

    @abstractmethod
    def create_risk_assessment(self, work_item_id: int, content: str) -> RiskAssessment: ...

    @abstractmethod
    def list_risk_assessments(self, work_item_id: int) -> list[RiskAssessment]: ...

    @abstractmethod
    def get_risk_assessment(self, risk_id: int) -> RiskAssessment | None: ...

    @abstractmethod
    def update_risk_assessment(
        self,
        risk_id: int,
        content: str | None,
        action: str | None,
    ) -> RiskAssessment | None: ...

    @abstractmethod
    def delete_risk_assessment(self, risk_id: int) -> bool: ...

    @abstractmethod
    def create_manual_risk(self, work_item_id: int, content: str) -> ManualRisk: ...

    @abstractmethod
    def list_manual_risks(self, work_item_id: int) -> list[ManualRisk]: ...

    @abstractmethod
    def get_manual_risk(self, risk_id: int) -> ManualRisk | None: ...

    @abstractmethod
    def update_manual_risk(
        self,
        risk_id: int,
        content: str | None,
        action: str | None,
    ) -> ManualRisk | None: ...

    @abstractmethod
    def delete_manual_risk(self, risk_id: int) -> bool: ...

    @abstractmethod
    def add_comment(self, work_id: int, user_id: int, content: str) -> WorkComment: ...

    @abstractmethod
    def list_comments(self, work_id: int) -> list[WorkComment]: ...

    @abstractmethod
    def acknowledge_risks(
        self,
        work_id: int,
        user_id: int,
        acknowledged_risk_ids: list[int],
        acknowledged_risks: list[dict[str, str | int | None]],
        signature_base64: str | None = None,
    ) -> WorkRiskAcknowledgment: ...

    @abstractmethod
    def get_acknowledgment(self, work_id: int, user_id: int) -> WorkRiskAcknowledgment | None: ...

    @abstractmethod
    def list_acknowledgments(self, work_id: int) -> list[WorkRiskAcknowledgment]: ...

    @abstractmethod
    def add_audit_log(
        self,
        action: str,
        user_id: int,
        work_id: int | None = None,
        details: str | None = None,
    ) -> AuditLog: ...

    @abstractmethod
    def list_audit_logs(
        self,
        work_id: int | None = None,
        user_id: int | None = None,
        limit: int = 1000,
    ) -> list[AuditLog]: ...


class SupportRepository(ABC):
    @abstractmethod
    def list_risk_records(self) -> list[RiskRecord]: ...

    @abstractmethod
    def get_risk_record(self, risk_id: int) -> RiskRecord | None: ...

    @abstractmethod
    def update_risk_status(self, risk_id: int, status: str) -> RiskRecord | None: ...

    @abstractmethod
    def update_risk_severity(self, risk_id: int, severity: str) -> RiskRecord | None: ...

    @abstractmethod
    def add_risk_action(self, risk_id: int, action: str) -> RiskRecord | None: ...

    @abstractmethod
    def list_incidents(self) -> list[Incident]: ...

    @abstractmethod
    def create_incident(
        self,
        title: str,
        incident_date: date,
        root_cause: str,
        corrective_actions: list[str],
        status: str,
    ) -> Incident: ...

    @abstractmethod
    def get_incident(self, incident_id: int) -> Incident | None: ...

    @abstractmethod
    def update_incident_status(self, incident_id: int, status: str) -> Incident | None: ...

    @abstractmethod
    def add_incident_action(self, incident_id: int, action: str) -> Incident | None: ...

    @abstractmethod
    def list_manuals(self) -> list[Manual]: ...

    @abstractmethod
    def get_manual(self, manual_id: int) -> Manual | None: ...

    @abstractmethod
    def list_meetings(self) -> list[Meeting]: ...

    @abstractmethod
    def get_meeting(self, meeting_id: int) -> Meeting | None: ...

    @abstractmethod
    def update_meeting_sync_state(self, meeting_id: int, state: str) -> Meeting | None: ...

    @abstractmethod
    def add_meeting_uploads(self, meeting_id: int | None, files: list[str]) -> list[MeetingUpload]: ...

    @abstractmethod
    def list_meeting_uploads(self, meeting_id: int | None) -> list[MeetingUpload]: ...

    @abstractmethod
    def list_my_works(
        self,
        limit: int = 20,
        offset: int = 0,
    ) -> list[MyWork]: ...

    @abstractmethod
    def count_my_works(self) -> int: ...

    @abstractmethod
    def get_my_work(self, work_id: int) -> MyWork | None: ...

    @abstractmethod
    def get_work_assets(self, work_id: int) -> WorkAsset: ...

    @abstractmethod
    def add_work_photos(self, work_id: int, files: list[str]) -> WorkAsset: ...

    @abstractmethod
    def add_work_audios(self, work_id: int, files: list[str]) -> WorkAsset: ...

    @abstractmethod
    def add_work_note(self, work_id: int, note: str) -> WorkAsset: ...


class AuthRepository(ABC):
    @abstractmethod
    def get_auth_user_by_login_id(self, login_id: str) -> AuthUser | None: ...

    @abstractmethod
    def get_user(self, user_id: int) -> User | None: ...
