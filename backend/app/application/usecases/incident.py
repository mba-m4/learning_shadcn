from datetime import date

from app.domain.models import Incident
from app.domain.repositories import SupportRepository


class ListIncidentsUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self) -> list[Incident]:
        return self._repo.list_incidents()


class GetIncidentUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, incident_id: int) -> Incident | None:
        return self._repo.get_incident(incident_id)


class UpdateIncidentStatusUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, incident_id: int, status: str) -> Incident | None:
        return self._repo.update_incident_status(incident_id, status)


class AddIncidentActionUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, incident_id: int, action: str) -> Incident | None:
        return self._repo.add_incident_action(incident_id, action)


class CreateIncidentUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(
        self,
        title: str,
        incident_date: date,
        root_cause: str,
        corrective_actions: list[str],
        status: str,
    ) -> Incident:
        return self._repo.create_incident(
            title=title,
            incident_date=incident_date,
            root_cause=root_cause,
            corrective_actions=corrective_actions,
            status=status,
        )
