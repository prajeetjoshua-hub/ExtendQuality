# EXtendQuality

EXtendQuality is an explainable, multi-level AI inspection prototype for bearing manufacturing MSMEs. It combines OpenCV image-quality checks, YOLO defect localisation, bearing-specific geometry, a confidence-aware Quality Intelligence Engine, and selective Vision Language Model reasoning.

## Live demo

[Open the EXtendQuality dashboard](https://prajeetjoshua-hub.github.io/ExtendQuality/)

The presentation build is deployed directly from this repository through the
`Deploy EXtendQuality to GitHub Pages` workflow.

## Prototype interface

The current responsive landing page presents three prototype modules:

- Camera Feed — powered by OpenCV and YOLO
- VLM Analysis
- VLM Recommendation

The disabled **Previous Defects** area represents the future inspection-history and analytics workspace.

## Prototype architecture

```text
Camera / captured image
        |
        v
OpenCV image-quality gate
        |
        v
YOLO detection -> count and geometry evidence
        |
        v
Quality Intelligence Engine
   | confident          | uncertain
   v                    v
Decision          VLM-assisted review
   \____________________/
             |
             v
Human confirmation -> SQLite metadata + local image storage
```

The existing TypeScript application remains the frontend. The Python backend is
kept in `backend/`, while captured images and generated evidence are written to
ignored runtime folders under `storage/`.

## Run locally

```bash
npm install
npm run dev
```

Run the API in a second terminal:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r backend/requirements-base.txt
uvicorn backend.app.main:app --reload --port 8000
```

Install the larger computer-vision stack when beginning the YOLO work:

```bash
pip install -r backend/requirements-vision.txt
```

API health check: `http://127.0.0.1:8000/api/health`

## Build

```bash
npm run build
```

Team ID: `ZeAI_MIH_407`  
Track: `Industry 4.0 & Manufacturing`

Team: Janani LB, Prajeet Joshua, Mohith Dharshan

## Repository map

```text
app/                      React/Next.js inspector interface
backend/app/api/          FastAPI routes
backend/app/core/         Configuration
backend/app/db/           SQLite metadata layer
backend/app/services/     OpenCV, YOLO, decision and VLM modules
backend/tests/            Backend tests
docs/                     Architecture and implementation notes
models/weights/           Local model weights (ignored by Git)
storage/                  Runtime images, overlays and metadata (ignored)
```
