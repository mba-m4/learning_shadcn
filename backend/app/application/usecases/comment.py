from app.domain.models import WorkComment
from app.domain.repositories import WorkRepository


class AddWorkCommentUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, work_id: int, user_id: int, role: str, content: str) -> WorkComment:
        if role == "safety_manager":
            raise PermissionError("Not allowed")
        return self._repo.add_comment(work_id, user_id, content)


class ListWorkCommentsUseCase:
    def __init__(self, repo: WorkRepository):
        self._repo = repo

    def execute(self, work_id: int) -> list[WorkComment]:
        return self._repo.list_comments(work_id)
