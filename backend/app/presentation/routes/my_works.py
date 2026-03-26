from fastapi import APIRouter, Depends, HTTPException, status

from app.application.usecases.my_work import (
    AddWorkAudiosUseCase,
    AddWorkNoteUseCase,
    AddWorkPhotosUseCase,
    GetMyWorkUseCase,
    GetWorkAssetsUseCase,
    ListMyWorksUseCase,
)
from app.domain.models import Coordinates, RiskRecord
from app.infrastructure.repositories import SqlModelRepository
from app.presentation.deps import get_current_user, get_repo
from app.presentation.schemas import (
    CoordinatesResponse,
    MyWorkItemResponse,
    MyWorkListPageResponse,
    MyWorkResponse,
    RiskRecordResponse,
    WorkAssetFilesRequest,
    WorkAssetResponse,
    WorkLocationResponse,
    WorkNoteRequest,
)

router = APIRouter(prefix="/my-works", tags=["my-works"], dependencies=[Depends(get_current_user)])


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


def _to_my_work_response(work) -> MyWorkResponse:
    location = None
    if work.location:
        location = WorkLocationResponse(
            id=work.location.id,
            work_id=work.location.work_id,
            name=work.location.name,
            map_type=work.location.map_type,
            map_file_path=work.location.map_file_path,
            coordinates=_to_coordinates(work.location.coordinates),
            description=work.location.description,
        )
    return MyWorkResponse(
        id=work.id,
        title=work.title,
        description=work.description,
        work_date=work.work_date,
        group=work.group,
        status=work.status,
        risk_score=work.risk_score,
        items=[MyWorkItemResponse(**item.__dict__) for item in work.items],
        related_risks=[_to_risk_response(risk) for risk in work.related_risks],
        incidents=work.incidents,
        location=location,
    )


@router.get("", response_model=MyWorkListPageResponse)
async def list_my_works(
    limit: int = 20,
    offset: int = 0,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = ListMyWorksUseCase(repo)
    page = usecase.execute(limit=limit, offset=offset)
    return MyWorkListPageResponse(
        items=[_to_my_work_response(work) for work in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/{work_id}", response_model=MyWorkResponse)
async def get_my_work(work_id: int, repo: SqlModelRepository = Depends(get_repo)):
    usecase = GetMyWorkUseCase(repo)
    work = usecase.execute(work_id)
    if not work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    return _to_my_work_response(work)


@router.get("/{work_id}/assets", response_model=WorkAssetResponse)
async def get_work_assets(work_id: int, repo: SqlModelRepository = Depends(get_repo)):
    usecase = GetWorkAssetsUseCase(repo)
    assets = usecase.execute(work_id)
    return WorkAssetResponse(**assets.__dict__)


@router.post("/{work_id}/assets/photos", response_model=WorkAssetResponse)
async def add_work_photos(
    work_id: int,
    payload: WorkAssetFilesRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = AddWorkPhotosUseCase(repo)
    assets = usecase.execute(work_id, payload.files)
    return WorkAssetResponse(**assets.__dict__)


@router.post("/{work_id}/assets/audios", response_model=WorkAssetResponse)
async def add_work_audios(
    work_id: int,
    payload: WorkAssetFilesRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = AddWorkAudiosUseCase(repo)
    assets = usecase.execute(work_id, payload.files)
    return WorkAssetResponse(**assets.__dict__)


@router.post("/{work_id}/assets/notes", response_model=WorkAssetResponse)
async def add_work_note(
    work_id: int,
    payload: WorkNoteRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = AddWorkNoteUseCase(repo)
    assets = usecase.execute(work_id, payload.note)
    return WorkAssetResponse(**assets.__dict__)
