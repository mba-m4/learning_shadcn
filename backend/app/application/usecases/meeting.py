from app.domain.models import Meeting, MeetingUpload
from app.domain.repositories import SupportRepository


class ListMeetingsUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self) -> list[Meeting]:
        return self._repo.list_meetings()


class GetMeetingUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, meeting_id: int) -> Meeting | None:
        return self._repo.get_meeting(meeting_id)


class UpdateMeetingSyncStateUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, meeting_id: int, state: str) -> Meeting | None:
        return self._repo.update_meeting_sync_state(meeting_id, state)


class AddMeetingUploadsUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, meeting_id: int | None, files: list[str]) -> list[MeetingUpload]:
        return self._repo.add_meeting_uploads(meeting_id, files)


class ListMeetingUploadsUseCase:
    def __init__(self, repo: SupportRepository):
        self._repo = repo

    def execute(self, meeting_id: int | None) -> list[MeetingUpload]:
        return self._repo.list_meeting_uploads(meeting_id)
