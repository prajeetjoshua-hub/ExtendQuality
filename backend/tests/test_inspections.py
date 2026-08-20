import cv2
import numpy as np
from fastapi.testclient import TestClient

from backend.app.main import app


def sample_image() -> bytes:
    image = np.full((640, 640, 3), 160, dtype=np.uint8)
    cv2.circle(image, (320, 320), 220, (45, 45, 45), 45)
    cv2.circle(image, (320, 320), 110, (160, 160, 160), -1)
    ok, encoded = cv2.imencode(".jpg", image)
    assert ok
    return encoded.tobytes()


def test_create_list_and_review_inspection() -> None:
    with TestClient(app) as client:
        created = client.post(
            "/api/inspections",
            files={"image": ("bearing.jpg", sample_image(), "image/jpeg")},
            data={"bearing_type": "6204"},
        )
        assert created.status_code == 201
        payload = created.json()
        assert payload["bearing_type"] == "6204"
        assert payload["vision_result"]["mode"] == "opencv_contour_fallback"
        assert payload["decision"]["disposition"] in {"RECAPTURE", "REVIEW"}

        history = client.get("/api/inspections")
        assert history.status_code == 200
        assert any(item["id"] == payload["id"] for item in history.json())

        review = client.post(
            f"/api/inspections/{payload['id']}/review",
            json={"decision": "ACCEPT", "reason": "Mentor demo verification"},
        )
        assert review.status_code == 200
        assert review.json()["review_status"] == "reviewed"


def test_rejects_non_image_upload() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/inspections",
            files={"image": ("notes.txt", b"not an image", "text/plain")},
        )
    assert response.status_code == 415
