from app.domain.models import MyWork, MyWorkListPage, WorkAsset
from app.domain.repositories import SupportRepository


class ListMyWorksUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(
        self,
        limit: int = 20,
        offset: int = 0,
    ) -> MyWorkListPage:
        works = self._repo.list_my_works(limit=limit, offset=offset)
        total = self._repo.count_my_works()
        return MyWorkListPage(items=works, total=total, limit=limit, offset=offset)


class GetMyWorkUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, work_id: int) -> MyWork | None:
        return self._repo.get_my_work(work_id)


class GetWorkAssetsUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, work_id: int) -> WorkAsset:
        return self._repo.get_work_assets(work_id)


class AddWorkPhotosUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, work_id: int, files: list[str]) -> WorkAsset:
        return self._repo.add_work_photos(work_id, files)


class AddWorkAudiosUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, work_id: int, files: list[str]) -> WorkAsset:
        return self._repo.add_work_audios(work_id, files)


class AddWorkNoteUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, work_id: int, note: str) -> WorkAsset:
        return self._repo.add_work_note(work_id, note)

