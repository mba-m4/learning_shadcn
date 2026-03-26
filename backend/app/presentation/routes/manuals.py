from fastapi import APIRouter, Depends, HTTPException, status

from app.application.usecases.manual import GetManualUseCase, ListManualsUseCase
from app.infrastructure.repositories import SqlModelRepository
from app.presentation.deps import get_current_user, get_repo
from app.presentation.schemas import ManualResponse

router = APIRouter(prefix="/manuals", tags=["manuals"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[ManualResponse])
async def list_manuals(repo: SqlModelRepository = Depends(get_repo)):
    usecase = ListManualsUseCase(repo)
    manuals = usecase.execute()
    return [ManualResponse(**manual.__dict__) for manual in manuals]


@router.get("/{manual_id}", response_model=ManualResponse)
async def get_manual(manual_id: int, repo: SqlModelRepository = Depends(get_repo)):
    usecase = GetManualUseCase(repo)
    manual = usecase.execute(manual_id)
    if not manual:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual not found")
    return ManualResponse(**manual.__dict__)
