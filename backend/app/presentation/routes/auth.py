from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.application.usecases.auth import LoginUseCase
from app.domain.models import User
from app.infrastructure.repositories import SqlModelRepository
from app.infrastructure.security import create_access_token
from app.presentation.deps import SECRET_KEY, get_current_user, get_repo
from app.presentation.schemas import TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    repo: SqlModelRepository = Depends(get_repo),
):
    usecase = LoginUseCase(repo)
    try:
        user = usecase.execute(form_data.username, form_data.password)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(str(user.id), SECRET_KEY)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(**current_user.__dict__)
