import { Link } from "react-router-dom";

export function DashboardPage() {
  return (
    <main className="dashboard-page">
      <section className="hero-panel">
        <p className="eyebrow">Overview</p>
        <h1>Dashboard</h1>
        <p className="hero-copy">
          This is the first dashboard placeholder for JobTracker. Next we can
          turn this into a real overview with stats, next actions and recent
          applications.
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="panel stat-card">
          <p className="stat-label">Applications</p>
          <strong className="stat-value">Live data</strong>
          <p>Manage saved job applications from the API-backed workflow.</p>
        </article>

        <article className="panel stat-card">
          <p className="stat-label">Navigation</p>
          <strong className="stat-value">Ready</strong>
          <p>Sidebar and routes are now in place for the next frontend phases.</p>
        </article>
      </section>

      <section className="panel quick-links">
        <h2>Quick Links</h2>
        <div className="quick-links-row">
          <Link className="primary-button quick-link" to="/applications">
            Open Applications
          </Link>
        </div>
      </section>
    </main>
  );
}
