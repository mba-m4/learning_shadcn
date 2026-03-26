from fastapi import APIRouter, Depends, HTTPException, status

from app.application.usecases.meeting import (
    AddMeetingUploadsUseCase,
    GetMeetingUseCase,
    ListMeetingUploadsUseCase,
    ListMeetingsUseCase,
    UpdateMeetingSyncStateUseCase,
)
from app.domain.models import Coordinates, RiskRecord
from app.infrastructure.repositories import SqlModelRepository
from app.presentation.deps import get_current_user, get_repo
from app.presentation.schemas import (
    CoordinatesResponse,
    MeetingResponse,
    MeetingSyncStateRequest,
    MeetingUploadRequest,
    MeetingUploadResponse,
    RiskRecordResponse,
)

router = APIRouter(prefix="/meetings", tags=["meetings"], dependencies=[Depends(get_current_user)])


def _to_coordinates(coords: Coordinates | None) -> CoordinatesResponse | None:
    if not coords:
        return None
    return CoordinatesResponse(
        x=coords.x,
        y=coords.y,
        width=coords.width,
        height=coords.height,
    )


def _to_risk_response(risk: RiskRecord) -> RiskRecordResponse:
    return RiskRecordResponse(
        id=risk.id,
        title=risk.title,
        severity=risk.severity,
        status=risk.status,
        work_id=risk.work_id,
        work_title=risk.work_title,
        summary=risk.summary,
        actions=risk.actions,
        location_coordinates=_to_coordinates(risk.location_coordinates),
    )


def _to_meeting_response(meeting) -> MeetingResponse:
    return MeetingResponse(
        id=meeting.id,
        title=meeting.title,
        date=meeting.date,
        participants=meeting.participants,
        transcript=meeting.transcript,
        extracted_risks=[_to_risk_response(risk) for risk in meeting.extracted_risks],
        sync_state=meeting.sync_state,
    )


@router.get("/uploads", response_model=list[MeetingUploadResponse])
async def list_uploads(meeting_id: int | None = None, repo: SqlModelRepository = Depends(get_repo)):
    usecase = ListMeetingUploadsUseCase(repo)
    uploads = usecase.execute(meeting_id)
    return [MeetingUploadResponse(**upload.__dict__) for upload in uploads]


@router.post("/uploads", response_model=list[MeetingUploadResponse])
async def add_uploads(
    payload: MeetingUploadRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = AddMeetingUploadsUseCase(repo)
    uploads = usecase.execute(payload.meeting_id, payload.files)
    return [MeetingUploadResponse(**upload.__dict__) for upload in uploads]


@router.get("", response_model=list[MeetingResponse])
async def list_meetings(repo: SqlModelRepository = Depends(get_repo)):
    usecase = ListMeetingsUseCase(repo)
    meetings = usecase.execute()
    return [_to_meeting_response(meeting) for meeting in meetings]


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(meeting_id: int, repo: SqlModelRepository = Depends(get_repo)):
    usecase = GetMeetingUseCase(repo)
    meeting = usecase.execute(meeting_id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return _to_meeting_response(meeting)


@router.patch("/{meeting_id}/sync-state", response_model=MeetingResponse)
async def update_sync_state(
    meeting_id: int,
    payload: MeetingSyncStateRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = UpdateMeetingSyncStateUseCase(repo)
    meeting = usecase.execute(meeting_id, payload.sync_state)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return _to_meeting_response(meeting)
