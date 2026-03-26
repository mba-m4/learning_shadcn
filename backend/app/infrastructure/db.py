import os

from sqlmodel import SQLModel, Session, create_engine


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rky_check.db")
engine = create_engine(DATABASE_URL, echo=False)


def init_db() -> None:
    from app.infrastructure import repositories

    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        repositories.seed_default_users(session)
        repositories.seed_sample_data(session)


def get_session():
    with Session(engine) as session:
        yield session
