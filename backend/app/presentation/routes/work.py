from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status

from app.application.usecases.work import (
    AddWorkItemUseCase,
    CreateManualRiskUseCase,
    CreateWorkGroupUseCase,
    CreateWorkUseCase,
    DeleteManualRiskUseCase,
    DeleteRiskAssessmentUseCase,
    GenerateRiskAssessmentUseCase,
    GetDailyWorkOverviewUseCase,
    GetWorkDateStreamUseCase,
    GetWorkDateSummaryUseCase,
    GetWorkDetailUseCase,
    GetWorkListUseCase,
    GetWorkRiskSummaryUseCase,
    ListWorkGroupsUseCase,
    ListManualRisksUseCase,
    UpdateManualRiskUseCase,
    UpdateRiskAssessmentUseCase,
)
from app.domain.models import User
from app.infrastructure.repositories import SqlModelRepository
from app.presentation.deps import get_current_user, get_repo
from app.presentation.schemas import (
    RiskAssessmentResponse,
    ManualRiskCreateRequest,
    ManualRiskUpdateRequest,
    ManualRiskResponse,
    RiskAssessmentUpdateRequest,
    RiskSummaryResponse,
    WorkDateCountResponse,
    WorkDateStreamResponse,
    WorkCreateRequest,
    WorkDetailResponse,
    WorkGroupCreateRequest,
    WorkGroupResponse,
    WorkItemCreateRequest,
    WorkItemResponse,
    WorkListItemResponse,
    WorkListPageResponse,
    WorkItemWithRisksResponse,
    WorkOverviewResponse,
    WorkResponse,
    WorkRiskAcknowledgmentRequest,
    WorkRiskAcknowledgmentResponse,
    AuditLogResponse,
)

router = APIRouter(prefix="/works", tags=["works"], dependencies=[Depends(get_current_user)])


@router.post("/groups", response_model=WorkGroupResponse)
async def create_group(
    payload: WorkGroupCreateRequest,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = CreateWorkGroupUseCase(repo)
    try:
        group = usecase.execute(payload.name, current_user.role)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return WorkGroupResponse(id=group.id, name=group.name)


@router.get("/groups", response_model=list[WorkGroupResponse])
async def list_groups(repo: SqlModelRepository = Depends(get_repo)):
    usecase = ListWorkGroupsUseCase(repo)
    groups = usecase.execute()
    return [WorkGroupResponse(id=group.id, name=group.name) for group in groups]


@router.post("", response_model=WorkResponse)
async def create_work(
    payload: WorkCreateRequest,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = CreateWorkUseCase(repo)
    try:
        work = usecase.execute(
            payload.title,
            payload.description,
            payload.group_id,
            payload.work_date,
            payload.status,
            current_user.role,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return WorkResponse(**work.__dict__)


@router.post("/{work_id}/items", response_model=WorkItemResponse)
async def add_work_item(
    work_id: int,
    payload: WorkItemCreateRequest,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = AddWorkItemUseCase(repo)
    try:
        item = usecase.execute(work_id, payload.name, payload.description, current_user.role)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return WorkItemResponse(**item.__dict__)


@router.post("/items/{work_item_id}/risks/generate", response_model=RiskAssessmentResponse)
async def generate_risk_assessment(
    work_item_id: int,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = GenerateRiskAssessmentUseCase(repo)
    try:
        content = usecase.execute(work_item_id, current_user.role)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    risks = repo.list_risk_assessments(work_item_id)
    latest = risks[-1]
    work_item = repo.get_work_item(work_item_id)
    if work_item:
        repo.add_audit_log(
            action="risk_generated",
            user_id=current_user.id,
            work_id=work_item.work_id,
            details=f"Generated AI risk {latest.id}",
        )
    return RiskAssessmentResponse(**latest.__dict__)


@router.patch("/items/risks/ai/{risk_id}", response_model=RiskAssessmentResponse)
async def update_risk_assessment(
    risk_id: int,
    payload: RiskAssessmentUpdateRequest,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = UpdateRiskAssessmentUseCase(repo)
    try:
        risk = usecase.execute(
            risk_id,
            payload.content,
            payload.action,
            current_user.role,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    work_item = repo.get_work_item(risk.work_item_id)
    if work_item:
        repo.add_audit_log(
            action="risk_updated",
            user_id=current_user.id,
            work_id=work_item.work_id,
            details=f"Updated AI risk {risk.id}",
        )
    return RiskAssessmentResponse(**risk.__dict__)


@router.delete("/items/risks/ai/{risk_id}")
async def delete_risk_assessment(
    risk_id: int,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = DeleteRiskAssessmentUseCase(repo)
    risk = repo.get_risk_assessment(risk_id)
    work_item = repo.get_work_item(risk.work_item_id) if risk else None
    try:
        deleted = usecase.execute(risk_id, current_user.role)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    if work_item:
        repo.add_audit_log(
            action="risk_deleted",
            user_id=current_user.id,
            work_id=work_item.work_id,
            details=f"Deleted AI risk {risk_id}",
        )
    return {"deleted": True}


@router.get("/items/{work_item_id}/risks/manual", response_model=list[ManualRiskResponse])
async def list_manual_risks(
    work_item_id: int,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = ListManualRisksUseCase(repo)
    risks = usecase.execute(work_item_id)
    return [ManualRiskResponse(**risk.__dict__) for risk in risks]


@router.post("/items/{work_item_id}/risks/manual", response_model=ManualRiskResponse)
async def create_manual_risk(
    work_item_id: int,
    payload: ManualRiskCreateRequest,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = CreateManualRiskUseCase(repo)
    try:
        risk = usecase.execute(
            work_item_id,
            payload.content,
            current_user.role,
            payload.action,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    work_item = repo.get_work_item(work_item_id)
    if work_item:
        repo.add_audit_log(
            action="risk_created",
            user_id=current_user.id,
            work_id=work_item.work_id,
            details=f"Created manual risk {risk.id}",
        )
    return ManualRiskResponse(**risk.__dict__)


@router.patch("/items/risks/manual/{risk_id}", response_model=ManualRiskResponse)
async def update_manual_risk(
    risk_id: int,
    payload: ManualRiskUpdateRequest,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = UpdateManualRiskUseCase(repo)
    try:
        risk = usecase.execute(
            risk_id,
            payload.content,
            payload.action,
            current_user.role,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    work_item = repo.get_work_item(risk.work_item_id)
    if work_item:
        repo.add_audit_log(
            action="risk_updated",
            user_id=current_user.id,
            work_id=work_item.work_id,
            details=f"Updated manual risk {risk.id}",
        )
    return ManualRiskResponse(**risk.__dict__)


@router.delete("/items/risks/manual/{risk_id}")
async def delete_manual_risk(
    risk_id: int,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = DeleteManualRiskUseCase(repo)
    risk = repo.get_manual_risk(risk_id)
    work_item = repo.get_work_item(risk.work_item_id) if risk else None
    try:
        deleted = usecase.execute(risk_id, current_user.role)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    if work_item:
        repo.add_audit_log(
            action="risk_deleted",
            user_id=current_user.id,
            work_id=work_item.work_id,
            details=f"Deleted manual risk {risk_id}",
        )
    return {"deleted": True}


@router.get("/{work_id}/risk-summary", response_model=RiskSummaryResponse)
async def get_work_risk_summary(
    work_id: int,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = GetWorkRiskSummaryUseCase(repo)
    summary = usecase.execute(work_id)
    return RiskSummaryResponse(**summary.__dict__)


@router.get("", response_model=WorkListPageResponse)
async def list_works(
    start_date: date,
    end_date: date,
    limit: int = 20,
    offset: int = 0,
    group_id: int | None = None,
    q: str | None = None,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = GetWorkListUseCase(repo)
    page = usecase.execute(start_date, end_date, limit, offset, group_id, q)
    return WorkListPageResponse(
        items=[
            WorkListItemResponse(
                work=WorkResponse(**entry.work.__dict__),
                items=[WorkItemResponse(**item.__dict__) for item in entry.items],
                risk_count=entry.risk_count,
            )
            for entry in page.items
        ],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/dates", response_model=list[WorkDateCountResponse])
async def list_work_dates(
    start_date: date,
    end_date: date,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = GetWorkDateSummaryUseCase(repo)
    summary = usecase.execute(start_date, end_date)
    return [WorkDateCountResponse(work_date=row.work_date, count=row.count) for row in summary]


@router.get("/stream", response_model=list[WorkDateStreamResponse])
async def list_work_stream(
    start_date: date,
    end_date: date,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = GetWorkDateStreamUseCase(repo)
    streams = usecase.execute(start_date, end_date)
    return [
        WorkDateStreamResponse(
            work_date=stream.work_date,
            items=[
                WorkListItemResponse(
                    work=WorkResponse(**entry.work.__dict__),
                    items=[WorkItemResponse(**item.__dict__) for item in entry.items],
                    risk_count=entry.risk_count,
                )
                for entry in stream.items
            ],
        )
        for stream in streams
    ]


@router.get("/daily", response_model=list[WorkOverviewResponse])
async def get_daily_overview(
    work_date: date,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = GetDailyWorkOverviewUseCase(repo)
    overview = usecase.execute(work_date)
    response: list[WorkOverviewResponse] = []
    for entry in overview:
        response.append(
            WorkOverviewResponse(
                work=WorkResponse(**entry.work.__dict__),
                items=[
                    WorkItemWithRisksResponse(
                        item=WorkItemResponse(**item.item.__dict__),
                        risks=[RiskAssessmentResponse(**risk.__dict__) for risk in item.risks],
                    )
                    for item in entry.items
                ],
            )
        )
    return response


@router.get("/{work_id}", response_model=WorkDetailResponse)
async def get_work_detail(
    work_id: int,
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = GetWorkDetailUseCase(repo)
    detail = usecase.execute(work_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    return WorkDetailResponse(
        work=WorkResponse(**detail.work.__dict__),
        items=[
            WorkItemWithRisksResponse(
                item=WorkItemResponse(**item.item.__dict__),
                risks=[RiskAssessmentResponse(**risk.__dict__) for risk in item.risks],
            )
            for item in detail.items
        ],
    )


@router.post("/{work_id}/acknowledge", response_model=WorkRiskAcknowledgmentResponse)
async def acknowledge_risks(
    work_id: int,
    payload: WorkRiskAcknowledgmentRequest,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    """リスク確認（署名）を記録"""
    work = repo.get_work(work_id)
    if not work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    
    ack = repo.acknowledge_risks(
        work_id=work_id,
        user_id=current_user.id,
        acknowledged_risk_ids=payload.acknowledged_risk_ids,
        acknowledged_risks=payload.acknowledged_risks,
        signature_base64=payload.signature_base64,
    )
    
    return WorkRiskAcknowledgmentResponse(**ack.__dict__)


@router.get("/{work_id}/acknowledgment", response_model=WorkRiskAcknowledgmentResponse | None)
async def get_acknowledgment(
    work_id: int,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    """ユーザーの作業に対するリスク確認情報を取得"""
    work = repo.get_work(work_id)
    if not work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    
    ack = repo.get_acknowledgment(work_id, current_user.id)
    if not ack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not acknowledged yet")

    recent_logs = repo.list_audit_logs(work_id=work_id, limit=50)
    risk_actions = {"risk_created", "risk_updated", "risk_deleted", "risk_generated"}
    latest_risk_log = next((log for log in recent_logs if log.action in risk_actions), None)
    if latest_risk_log and latest_risk_log.timestamp > ack.acknowledged_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not acknowledged yet")
    
    return WorkRiskAcknowledgmentResponse(**ack.__dict__)


@router.get("/{work_id}/acknowledgments/history", response_model=list[WorkRiskAcknowledgmentResponse])
async def list_acknowledgments(
    work_id: int,
    repo: SqlModelRepository = Depends(get_repo),
):
    """作業に対するすべてのリスク確認履歴を取得（監査用）"""
    work = repo.get_work(work_id)
    if not work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    
    acks = repo.list_acknowledgments(work_id)
    return [WorkRiskAcknowledgmentResponse(**ack.__dict__) for ack in acks]


@router.get("/audit/logs", response_model=list[AuditLogResponse])
async def list_audit_logs(
    work_id: int | None = None,
    user_id: int | None = None,
    limit: int = 1000,
    repo: SqlModelRepository = Depends(get_repo),
):
    """監査ログを検索"""
    logs = repo.list_audit_logs(work_id=work_id, user_id=user_id, limit=limit)
    return [AuditLogResponse(**log.__dict__) for log in logs]
