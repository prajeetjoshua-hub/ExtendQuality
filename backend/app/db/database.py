import sqlite3
import json
from typing import Any

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
CREATE INDEX IF NOT EXISTS idx_inspections_created_at
ON inspections(created_at DESC);
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


def create_inspection(record: dict[str, Any]) -> None:
    columns = ", ".join(record)
    placeholders = ", ".join("?" for _ in record)
    with connect() as connection:
        connection.execute(
            f"INSERT INTO inspections ({columns}) VALUES ({placeholders})",
            tuple(record.values()),
        )


def get_inspection(inspection_id: str) -> dict[str, Any] | None:
    with connect() as connection:
        row = connection.execute(
            "SELECT * FROM inspections WHERE id = ?", (inspection_id,)
        ).fetchone()
    return _deserialize_row(row) if row else None


def list_inspections(limit: int = 20) -> list[dict[str, Any]]:
    with connect() as connection:
        rows = connection.execute(
            "SELECT * FROM inspections ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [_deserialize_row(row) for row in rows]


def save_human_review(
    inspection_id: str, decision: str, reason: str | None
) -> bool:
    with connect() as connection:
        cursor = connection.execute(
            """
            UPDATE inspections
            SET human_decision = ?, human_reason = ?, review_status = 'reviewed'
            WHERE id = ?
            """,
            (decision, reason, inspection_id),
        )
    return cursor.rowcount == 1


def _deserialize_row(row: sqlite3.Row) -> dict[str, Any]:
    result = dict(row)
    for key in (
        "image_quality_json",
        "yolo_result_json",
        "geometry_result_json",
        "decision_json",
        "vlm_result_json",
    ):
        value = result.pop(key, None)
        result[key.removesuffix("_json")] = json.loads(value) if value else None
    return result
