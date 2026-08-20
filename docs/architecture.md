# EXtendQuality prototype architecture

## Scope for the SSN hackathon

The prototype demonstrates a reliable inspection workflow. It does not claim
industrial accuracy or automatic product release.

1. A camera provides a live preview.
2. The inspector captures a stable, high-resolution frame.
3. OpenCV checks focus, exposure, crop, and bearing position.
4. YOLO localizes known objects or defects.
5. Bearing-specific geometry calculates count, angular gaps, and radial offsets.
6. The Quality Intelligence Engine returns `ACCEPT`, `REJECT`, `RECAPTURE`,
   `REVIEW`, or `SYSTEM_HOLD`.
7. Only uncertain cases are sent to the VLM adapter.
8. The inspector confirms the final disposition.
9. Images are stored as files; structured metadata is stored in SQLite.
10. Only separately verified records become future training candidates.

## Frontend

The existing TypeScript application remains at the repository root to preserve
the working GitHub Pages deployment. Planned screens:

- `/`: inspector dashboard with camera, YOLO evidence, VLM result, and analytics.
- `/inspection`: presentation visualizer with an animated bearing and processing timeline.

## Backend

FastAPI is responsible for camera capture, inspection orchestration, result
storage, API responses, and later WebSocket progress events.

```text
backend/app/
  api/routes/       HTTP and WebSocket routes
  core/             environment configuration
  db/               SQLite metadata storage
  schemas/          typed request/response contracts
  services/vision/  OpenCV and YOLO
  services/decision evidence routing
  services/vlm/     grounded VLM provider adapter
```

## Data policy

- Original images are never overwritten.
- Generated images, overlays, and model weights are not committed to Git.
- An accepted production decision is not automatically a verified training label.
- A reviewer must approve a record before it enters `training_candidates`.
