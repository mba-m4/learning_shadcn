from fastapi import APIRouter, Depends, HTTPException, status

from app.application.usecases.incident import (
    AddIncidentActionUseCase,
    CreateIncidentUseCase,
    GetIncidentUseCase,
    ListIncidentsUseCase,
    UpdateIncidentStatusUseCase,
)
from app.infrastructure.repositories import SqlModelRepository
from app.presentation.deps import get_current_user, get_repo
from app.presentation.schemas import (
    IncidentCreateRequest,
    IncidentActionCreateRequest,
    IncidentResponse,
    IncidentStatusUpdateRequest,
)

router = APIRouter(prefix="/incidents", tags=["incidents"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[IncidentResponse])
async def list_incidents(repo: SqlModelRepository = Depends(get_repo)):
    usecase = ListIncidentsUseCase(repo)
    incidents = usecase.execute()
    return [IncidentResponse(**incident.__dict__) for incident in incidents]


@router.post("", response_model=IncidentResponse)
async def create_incident(
    payload: IncidentCreateRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = CreateIncidentUseCase(repo)
    incident = usecase.execute(
        payload.title,
        payload.date,
        payload.root_cause,
        payload.corrective_actions,
        payload.status,
    )
    return IncidentResponse(**incident.__dict__)


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: int, repo: SqlModelRepository = Depends(get_repo)):
    usecase = GetIncidentUseCase(repo)
    incident = usecase.execute(incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return IncidentResponse(**incident.__dict__)


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: int,
    payload: IncidentStatusUpdateRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = UpdateIncidentStatusUseCase(repo)
    incident = usecase.execute(incident_id, payload.status)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return IncidentResponse(**incident.__dict__)


@router.post("/{incident_id}/actions", response_model=IncidentResponse)
async def add_incident_action(
    incident_id: int,
    payload: IncidentActionCreateRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = AddIncidentActionUseCase(repo)
    incident = usecase.execute(incident_id, payload.action)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return IncidentResponse(**incident.__dict__)
