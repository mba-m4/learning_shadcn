from app.domain.models import Manual
from app.domain.repositories import SupportRepository


class ListManualsUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self) -> list[Manual]:
        return self._repo.list_manuals()


class GetManualUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, manual_id: int) -> Manual | None:
        return self._repo.get_manual(manual_id)
