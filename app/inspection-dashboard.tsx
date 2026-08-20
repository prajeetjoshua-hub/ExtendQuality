"use client";
/* eslint-disable @next/next/no-img-element -- webcam blobs and local FastAPI artifacts are runtime-only URLs */

import { type ChangeEvent, type CSSProperties, useEffect, useRef, useState } from "react";

type InspectionResult = {
  id: string;
  status: "ACCEPT" | "REJECT" | "RECAPTURE" | "REVIEW" | "SYSTEM_HOLD";
  image_quality: { score: number; blur_score: number; exposure_score: number; contrast_score: number; width: number; height: number; issues: string[] };
  vision_result: { mode: "yolo" | "opencv_contour_fallback"; model_ready: boolean; model_version: string; detections: Array<{ label: string; confidence: number; box: number[] }>; note: string };
  decision: { disposition: string; score: number; needs_vlm: boolean; reasons: string[] };
  vlm_result: { invoked: boolean; mode: "not_required" | "demo_rules" | "not_configured"; analysis: string; recommendation: string; disclaimer: string };
  artifacts: { processed: string; overlay: string };
  review_status: string;
  processing_time_ms: number;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const percentage = (value?: number) => value === undefined ? "--" : `${Math.round(value * 100)}%`;

export default function InspectionDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureUrlRef = useRef<string | null>(null);
  const [bearingType, setBearingType] = useState("6204");
  const [capture, setCapture] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (captureUrlRef.current) URL.revokeObjectURL(captureUrlRef.current);
  }, []);

  function replaceCapture(blob: Blob, name: string) {
    if (captureUrlRef.current) URL.revokeObjectURL(captureUrlRef.current);
    const url = URL.createObjectURL(blob);
    captureUrlRef.current = url;
    setCapture({ blob, name, url });
    setResult(null);
    setReviewMessage("");
    setError("");
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) replaceCapture(file, file.name);
  }

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" }, audio: false });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setError("Camera access was unavailable. Allow camera permission or upload an image instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video?.videoWidth) return setError("The camera is still starting. Wait a moment and capture again.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => { if (blob) replaceCapture(blob, `bearing-${Date.now()}.jpg`); }, "image/jpeg", 0.94);
  }

  async function inspectBearing() {
    if (!capture) return setError("Capture a camera frame or choose a bearing image first.");
    setBusy(true); setError(""); setResult(null); setReviewMessage("");
    const form = new FormData();
    form.append("image", capture.blob, capture.name);
    form.append("bearing_type", bearingType.trim() || "6204");
    try {
      const response = await fetch(`${API_BASE}/api/inspections`, { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || `Inspection failed (${response.status}).`);
      setResult(payload as InspectionResult);
    } catch (cause) {
      setError(cause instanceof TypeError ? "Cannot reach the backend. Keep FastAPI running on port 8000." : cause instanceof Error ? cause.message : "Inspection failed.");
    } finally { setBusy(false); }
  }

  async function submitReview(decision: "ACCEPT" | "REJECT") {
    if (!result) return;
    setReviewMessage("Saving inspector decision…");
    try {
      const response = await fetch(`${API_BASE}/api/inspections/${result.id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, reason: "Confirmed from inspector dashboard" }) });
      if (!response.ok) throw new Error();
      setReviewMessage(`Inspector marked this bearing ${decision}.`);
    } catch { setReviewMessage("Could not save the review. Check the backend connection."); }
  }

  const overlayUrl = result ? `${API_BASE}${result.artifacts.overlay}` : null;
  const statusClass = result ? `decision decision--${result.status.toLowerCase()}` : "decision";

  return <main className="app-shell">
    <aside className="sidebar" aria-label="Dashboard navigation">
      <div className="brand-mark" aria-label="EXtendQuality"><span>EX</span><i /></div>
      <nav className="side-nav"><span className="nav-section">INSPECTION</span><button className="nav-item nav-item--active" type="button"><span className="nav-grid"><i/><i/><i/><i/></span><span>Live inspection</span></button><button className="nav-item" type="button" disabled><span className="nav-clock"/><span>Previous defects</span><small>SOON</small></button></nav>
      <div className="sidebar-foot"><span className="pulse-dot"/><div><strong>LINE 04</strong><span>Prototype mode</span></div></div>
    </aside>
    <section className="workspace">
      <header className="topbar"><div className="wordmark"><span>EX</span>tendQuality<small>INTELLIGENT INSPECTION SYSTEM</small></div><div className="topbar-meta"><span className="system-tag"><i/> LOCAL API / 8000</span><span className="operator">EQ</span></div></header>
      <div className="content">
        <section className="hero-row"><div><p className="kicker"><span>QUALITY CONTROL</span> / BEARING MANUFACTURING</p><h1>Inspection intelligence,<br/><em>now connected.</em></h1></div><div className={statusClass}><span>CURRENT DISPOSITION</span><strong>{result?.status ?? "AWAITING CAPTURE"}</strong><small>{result ? `${result.processing_time_ms} ms processing` : "OpenCV · YOLO · Decision · VLM"}</small></div></section>
        <section className="control-strip" aria-label="Inspection controls">
          <label className="bearing-field"><span>BEARING TYPE</span><input value={bearingType} onChange={(event) => setBearingType(event.target.value)} maxLength={50}/></label>
          <label className="upload-button"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile}/><span>Choose image</span></label>
          {!cameraActive ? <button className="secondary-button" type="button" onClick={startCamera}>Start camera</button> : <><button className="secondary-button" type="button" onClick={captureFrame}>Capture frame</button><button className="text-button" type="button" onClick={stopCamera}>Stop</button></>}
          <button className="inspect-button" type="button" onClick={inspectBearing} disabled={busy}>{busy ? "Processing…" : "Run inspection"}<i/></button>
        </section>
        {error && <div className="error-banner" role="alert"><strong>Action needed</strong><span>{error}</span></div>}
        <section className="module-grid" aria-label="Inspection modules">
          <article className="module-card camera-card"><header><span className="module-number">01</span><div><p>VISION CELL</p><h2>Camera Feed</h2><small>OpenCV preprocessing + detection overlay</small></div><span className="live-chip">{cameraActive ? "LIVE" : capture ? "FRAME READY" : "STANDBY"}</span></header><div className="vision-stage"><video ref={videoRef} autoPlay muted playsInline className={cameraActive ? "" : "is-hidden"}/>{!cameraActive && overlayUrl && <img src={overlayUrl} alt="Bearing inspection overlay"/>}{!cameraActive && !overlayUrl && capture && <img src={capture.url} alt="Selected bearing"/>}{!cameraActive && !capture && <div className="empty-vision"><i/><strong>No bearing frame</strong><span>Start the camera or choose an image</span></div>}<div className="reticle" aria-hidden="true"/></div><footer><span>{capture?.name ?? "No capture selected"}</span><strong>{result ? `${result.vision_result.detections.length} region(s)` : "-- regions"}</strong></footer></article>
          <article className="module-card analysis-card"><header><span className="module-number">02</span><div><p>QUALITY INTELLIGENCE</p><h2>Processing Analysis</h2><small>Measured evidence and routing</small></div></header><div className="quality-score"><div><span>IMAGE QUALITY</span><strong>{percentage(result?.image_quality.score)}</strong></div><i style={{ "--score": result?.image_quality.score ?? 0 } as CSSProperties}/></div><dl className="metrics"><div><dt>Sharpness</dt><dd>{percentage(result?.image_quality.blur_score)}</dd></div><div><dt>Exposure</dt><dd>{percentage(result?.image_quality.exposure_score)}</dd></div><div><dt>Contrast</dt><dd>{percentage(result?.image_quality.contrast_score)}</dd></div><div><dt>Resolution</dt><dd>{result ? `${result.image_quality.width} × ${result.image_quality.height}` : "--"}</dd></div></dl><div className="model-state"><span className={result?.vision_result.model_ready ? "ready" : "fallback"}/><div><strong>{result ? result.vision_result.model_ready ? "YOLO MODEL ACTIVE" : "OPENCV FALLBACK" : "VISION MODEL"}</strong><p>{result?.vision_result.note ?? "Awaiting an inspection frame."}</p></div></div><ul className="reason-list">{(result?.decision.reasons ?? ["Decision evidence will appear here."]).map((reason) => <li key={reason}>{reason}</li>)}</ul></article>
          <article className="module-card recommendation-card"><header><span className="module-number">03</span><div><p>ACTION LAYER</p><h2>VLM Recommendation</h2><small>Grounded explanation for the inspector</small></div><span className="mode-chip">{result?.vlm_result.mode.replaceAll("_", " ") ?? "WAITING"}</span></header><div className="vlm-copy"><span>ANALYSIS</span><p>{result?.vlm_result.analysis ?? "Run an inspection to generate a grounded analysis."}</p><span>RECOMMENDATION</span><strong>{result?.vlm_result.recommendation ?? "No action recommended yet."}</strong></div>{result && <div className="review-panel"><span>HUMAN-IN-THE-LOOP CONFIRMATION</span><div><button type="button" onClick={() => submitReview("ACCEPT")}>Accept bearing</button><button type="button" onClick={() => submitReview("REJECT")}>Reject bearing</button></div>{reviewMessage && <p>{reviewMessage}</p>}</div>}<footer>{result?.vlm_result.disclaimer ?? "The VLM layer is invoked only when deterministic evidence is uncertain."}</footer></article>
        </section>
        <footer className="dashboard-footer"><p><span>EXTENDQUALITY / EQ-INSPECT</span> · Local prototype interface</p><div><i/> Images stored locally <i/> Inspector decision recorded</div></footer>
      </div>
    </section>
  </main>;
}
