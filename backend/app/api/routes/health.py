from datetime import datetime, timezone

from fastapi import APIRouter

from backend.app.core.config import get_settings


router = APIRouter(tags=["system"])


@router.get("/health")
def health() -> dict[str, str]:
    """Return a lightweight readiness response for frontend connection tests."""
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
