from fastapi import APIRouter, Depends, HTTPException, status

from app.application.usecases.risk_registry import (
    AddRiskActionUseCase,
    GetRiskRecordUseCase,
    ListRiskRecordsUseCase,
    UpdateRiskSeverityUseCase,
    UpdateRiskStatusUseCase,
)
from app.domain.models import Coordinates, RiskRecord
from app.infrastructure.repositories import SqlModelRepository
from app.presentation.deps import get_current_user, get_repo
from app.presentation.schemas import (
    CoordinatesResponse,
    RiskActionCreateRequest,
    RiskRecordResponse,
    RiskSeverityUpdateRequest,
    RiskStatusUpdateRequest,
)

router = APIRouter(prefix="/risks", tags=["risks"], dependencies=[Depends(get_current_user)])


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


@router.get("", response_model=list[RiskRecordResponse])
async def list_risks(repo: SqlModelRepository = Depends(get_repo)):
    usecase = ListRiskRecordsUseCase(repo)
    risks = usecase.execute()
    return [_to_risk_response(risk) for risk in risks]


@router.get("/{risk_id}", response_model=RiskRecordResponse)
async def get_risk(risk_id: int, repo: SqlModelRepository = Depends(get_repo)):
    usecase = GetRiskRecordUseCase(repo)
    risk = usecase.execute(risk_id)
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    return _to_risk_response(risk)


@router.patch("/{risk_id}/status", response_model=RiskRecordResponse)
async def update_risk_status(
    risk_id: int,
    payload: RiskStatusUpdateRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = UpdateRiskStatusUseCase(repo)
    risk = usecase.execute(risk_id, payload.status)
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    return _to_risk_response(risk)


@router.patch("/{risk_id}/severity", response_model=RiskRecordResponse)
async def update_risk_severity(
    risk_id: int,
    payload: RiskSeverityUpdateRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = UpdateRiskSeverityUseCase(repo)
    risk = usecase.execute(risk_id, payload.severity)
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    return _to_risk_response(risk)


@router.post("/{risk_id}/actions", response_model=RiskRecordResponse)
async def add_risk_action(
    risk_id: int,
    payload: RiskActionCreateRequest,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = AddRiskActionUseCase(repo)
    risk = usecase.execute(risk_id, payload.action)
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    return _to_risk_response(risk)
