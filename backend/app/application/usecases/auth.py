from app.domain.models import User
from app.domain.repositories import AuthRepository
from app.infrastructure.security import verify_password


class LoginUseCase:
    def __init__(self, auth_repo: AuthRepository):
        self._auth_repo = auth_repo

    def execute(self, login_id: str, password: str) -> User:
        auth_user = self._auth_repo.get_auth_user_by_login_id(login_id)
        if not auth_user:
            raise ValueError("Invalid credentials")
        if not verify_password(password, auth_user.password_hash):
            raise ValueError("Invalid credentials")
        user = self._auth_repo.get_user(auth_user.user_id)
        if not user or not user.is_active:
            raise ValueError("Inactive user")
        return user
