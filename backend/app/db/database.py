import sqlite3

from backend.app.core.config import get_settings


SCHEMA = """
CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    bearing_type TEXT NOT NULL,
    status TEXT NOT NULL,
    raw_image_path TEXT,
    processed_image_path TEXT,
    overlay_image_path TEXT,
    image_quality_json TEXT,
    yolo_result_json TEXT,
    geometry_result_json TEXT,
    decision_json TEXT,
    vlm_result_json TEXT,
    human_decision TEXT,
    human_reason TEXT,
    review_status TEXT NOT NULL DEFAULT 'pending',
    model_version TEXT,
    processing_time_ms REAL
);
"""


def connect() -> sqlite3.Connection:
    settings = get_settings()
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(settings.database_path)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    """Create the prototype metadata database without storing image blobs."""
    with connect() as connection:
        connection.executescript(SCHEMA)
