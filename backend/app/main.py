from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes.health import router as health_router
from backend.app.core.config import get_settings
from backend.app.db.database import initialize_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Prepare local prototype resources before the API accepts requests."""
    initialize_database()
    yield


settings = get_settings()

app = FastAPI(
    title="EXtendQuality API",
    description="Bearing inspection orchestration for OpenCV, YOLO, decision logic, and VLM review.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
