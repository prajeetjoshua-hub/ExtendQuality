from dataclasses import dataclass
from functools import lru_cache
import os
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


def _repository_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else REPOSITORY_ROOT / path


@dataclass(frozen=True)
class Settings:
    app_name: str
    environment: str
    database_path: Path
    storage_path: Path
    allowed_origins: list[str]


@lru_cache
def get_settings() -> Settings:
    origins = os.getenv(
        "EXTENDQUALITY_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    )
    return Settings(
        app_name="EXtendQuality API",
        environment=os.getenv("EXTENDQUALITY_ENVIRONMENT", "development"),
        database_path=_repository_path(
            os.getenv(
                "EXTENDQUALITY_DATABASE_PATH",
                "storage/metadata/extendquality.db",
            )
        ),
        storage_path=_repository_path(
            os.getenv("EXTENDQUALITY_STORAGE_PATH", "storage")
        ),
        allowed_origins=[item.strip() for item in origins.split(",") if item.strip()],
    )
