from app.domain.models import RiskRecord
from app.domain.repositories import SupportRepository


class ListRiskRecordsUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self) -> list[RiskRecord]:
        return self._repo.list_risk_records()


class GetRiskRecordUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, risk_id: int) -> RiskRecord | None:
        return self._repo.get_risk_record(risk_id)


class UpdateRiskStatusUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, risk_id: int, status: str) -> RiskRecord | None:
        return self._repo.update_risk_status(risk_id, status)


class UpdateRiskSeverityUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, risk_id: int, severity: str) -> RiskRecord | None:
        return self._repo.update_risk_severity(risk_id, severity)


class AddRiskActionUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, risk_id: int, action: str) -> RiskRecord | None:
        return self._repo.add_risk_action(risk_id, action)
