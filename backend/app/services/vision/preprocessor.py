from dataclasses import dataclass

import cv2
import numpy as np

from backend.app.schemas.inspection import ImageQuality


@dataclass
class PreprocessedImage:
    original: np.ndarray
    enhanced: np.ndarray
    edges: np.ndarray
    quality: ImageQuality


def decode_and_preprocess(content: bytes) -> PreprocessedImage:
    encoded = np.frombuffer(content, dtype=np.uint8)
    original = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if original is None:
        raise ValueError("The uploaded file is not a readable image.")

    height, width = original.shape[:2]
    gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    denoised = cv2.GaussianBlur(gray, (3, 3), 0)
    enhanced_gray = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(denoised)
    edges = cv2.Canny(enhanced_gray, 60, 150)

    laplacian_variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(gray.mean())
    contrast = float(gray.std())
    edge_density = float(np.count_nonzero(edges) / edges.size)

    blur_score = _clamp((laplacian_variance - 20.0) / 180.0)
    exposure_score = _clamp(1.0 - abs(brightness - 127.5) / 127.5)
    contrast_score = _clamp(contrast / 64.0)
    score = round(0.45 * blur_score + 0.35 * exposure_score + 0.20 * contrast_score, 3)

    issues: list[str] = []
    if blur_score < 0.35:
        issues.append("Image may be blurred; hold the camera steady and recapture.")
    if brightness < 55:
        issues.append("Image is underexposed; increase diffuse lighting.")
    elif brightness > 210:
        issues.append("Image is overexposed; reduce glare or direct lighting.")
    if contrast_score < 0.25:
        issues.append("Low contrast may hide small surface defects.")
    if min(width, height) < 480:
        issues.append("Resolution is low for millimetre-scale inspection.")

    return PreprocessedImage(
        original=original,
        enhanced=cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2BGR),
        edges=edges,
        quality=ImageQuality(
            score=score,
            blur_score=round(blur_score, 3),
            exposure_score=round(exposure_score, 3),
            contrast_score=round(contrast_score, 3),
            edge_density=round(edge_density, 4),
            width=width,
            height=height,
            issues=issues,
        ),
    )


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))
