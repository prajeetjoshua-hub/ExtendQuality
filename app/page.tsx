import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EXtendQuality | Intelligent Bearing Inspection",
  description:
    "An industrial quality intelligence dashboard for explainable bearing defect inspection.",
};

const cards = [
  {
    number: "01",
    eyebrow: "VISION CELL",
    title: "Camera Feed",
    subtitle: "Powered by OpenCV and YOLO",
    ghost: "LIVE OPTICAL INSPECTION",
    detail: "Edge detection · defect localization · confidence scoring",
  },
  {
    number: "02",
    eyebrow: "QUALITY INTELLIGENCE",
    title: "VLM Analysis",
    subtitle: "Explainable defect reasoning",
    ghost: "ROOT-CAUSE INTERPRETATION",
    detail: "Defect context · ambiguity review · evidence summary",
  },
  {
    number: "03",
    eyebrow: "ACTION LAYER",
    title: "VLM Recommendation",
    subtitle: "Corrective guidance for the line",
    ghost: "REWORK & PROCESS GUIDANCE",
    detail: "Disposition advice · corrective action · knowledge capture",
  },
];

function LockMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "lock-mark lock-mark--small" : "lock-mark"} aria-hidden="true">
      <span className="lock-shackle" />
      <span className="lock-body"><span /></span>
    </span>
  );
}

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Dashboard navigation">
        <div className="brand-mark" aria-label="EXtendQuality">
          <span className="brand-x">X</span>
          <span className="brand-rail" />
        </div>

        <nav className="side-nav">
          <span className="nav-section">INSPECTION</span>
          <button className="nav-item nav-item--active" type="button" aria-current="page">
            <span className="nav-grid" aria-hidden="true"><i/><i/><i/><i/></span>
            <span>Overview</span>
          </button>
          <button className="nav-item nav-item--locked" type="button" disabled aria-disabled="true">
            <span className="nav-clock" aria-hidden="true" />
            <span>Previous Defects</span>
            <LockMark small />
          </button>
        </nav>

        <div className="sidebar-foot">
          <span className="pulse-dot" />
          <div><strong>LINE 04</strong><span>Prototype mode</span></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="wordmark">
            <span>EX</span>tendQuality
            <small>INTELLIGENT INSPECTION SYSTEM</small>
          </div>
          <div className="topbar-meta">
            <span className="system-tag"><i /> SYSTEM STANDBY</span>
            <span className="divider" />
            <span className="plant-id">PLANT / BLR-01</span>
            <span className="operator">EQ</span>
          </div>
        </header>

        <div className="content">
          <div className="hero-row">
            <div>
              <p className="kicker"><span>QUALITY CONTROL</span> / BEARING MANUFACTURING</p>
              <h1>Inspection intelligence,<br/><em>built for the factory floor.</em></h1>
            </div>
            <div className="hero-status">
              <span>PROTOTYPE STATUS</span>
              <strong>03 modules awaiting activation</strong>
              <div className="status-track"><i /></div>
            </div>
          </div>

          <section className="module-grid" aria-label="Inspection modules">
            {cards.map((card) => (
              <article className="module-card" key={card.number} aria-disabled="true">
                <div className="card-underlay" aria-hidden="true">
                  <div className="scan-line" />
                  <span>{card.ghost}</span>
                  <div className="metric-bars"><i/><i/><i/><i/><i/></div>
                  <p>{card.detail}</p>
                </div>
                <div className="card-heading">
                  <span className="module-number">{card.number}</span>
                  <div>
                    <p>{card.eyebrow}</p>
                    <h2>{card.title}</h2>
                    <span>{card.subtitle}</span>
                  </div>
                </div>
                <div className="locked-overlay">
                  <LockMark />
                  <strong>Yet to be done</strong>
                  <span>MODULE LOCKED</span>
                </div>
                <div className="card-corner" aria-hidden="true" />
              </article>
            ))}
          </section>

          <footer className="dashboard-footer">
            <p><span>EXTENDQUALITY / EQ-INSPECT</span> · Prototype interface</p>
            <div><i /> Secure local processing <i /> Human-in-the-loop ready</div>
          </footer>
        </div>
      </section>
    </main>
  );
}
