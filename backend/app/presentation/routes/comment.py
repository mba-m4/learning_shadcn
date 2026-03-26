from fastapi import APIRouter, Depends, HTTPException, status

from app.application.usecases.comment import AddWorkCommentUseCase, ListWorkCommentsUseCase
from app.domain.models import User
from app.infrastructure.repositories import SqlModelRepository
from app.presentation.deps import get_current_user, get_repo
from app.presentation.schemas import WorkCommentCreateRequest, WorkCommentResponse

router = APIRouter(prefix="/works", tags=["comments"], dependencies=[Depends(get_current_user)])


@router.post("/{work_id}/comments", response_model=WorkCommentResponse)
async def add_comment(
    work_id: int,
    payload: WorkCommentCreateRequest,
    current_user: User = Depends(get_current_user),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = AddWorkCommentUseCase(repo)
    try:
        comment = usecase.execute(work_id, current_user.id, current_user.role, payload.content)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return WorkCommentResponse(**comment.__dict__)


@router.get("/{work_id}/comments", response_model=list[WorkCommentResponse])
async def list_comments(work_id: int, repo: SqlModelRepository = Depends(get_repo)):
    usecase = ListWorkCommentsUseCase(repo)
    comments = usecase.execute(work_id)
    return [WorkCommentResponse(**comment.__dict__) for comment in comments]
