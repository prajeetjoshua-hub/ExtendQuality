from backend.app.core.config import get_settings
from backend.app.schemas.inspection import DecisionResult, ImageQuality, VisionResult, VlmResult


def analyze(
    quality: ImageQuality, vision: VisionResult, decision: DecisionResult
) -> VlmResult:
    if not decision.needs_vlm:
        return VlmResult(
            invoked=False,
            mode="not_required",
            analysis="The deterministic quality and detection gates produced a terminal result.",
            recommendation=decision.disposition,
            disclaimer="No VLM was used for this inspection.",
        )

    if get_settings().vlm_provider != "demo":
        return VlmResult(
            invoked=False,
            mode="not_configured",
            analysis="The case requires semantic review, but no VLM provider is configured.",
            recommendation="Ask the inspector to review the original image and overlay.",
            disclaimer="This is a system status message, not an AI visual assessment.",
        )

    candidate_count = len(vision.detections)
    quality_text = "capture quality is adequate" if quality.score >= 0.65 else "capture quality is marginal"
    return VlmResult(
        invoked=True,
        mode="demo_rules",
        analysis=(
            f"Grounded demo analysis: {quality_text}; the vision stage marked "
            f"{candidate_count} region(s) for closer inspection."
        ),
        recommendation=(
            "Inspect the highlighted regions for scratches, pits, contamination, or excess grease; "
            "clean and recapture if the surface is obscured."
        ),
        disclaimer=(
            "Hackathon fallback generated from measured evidence, not a production VLM. "
            "It must not be presented as a trained visual diagnosis."
        ),
    )
