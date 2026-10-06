import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultSettings, navItems } from "./data/securityData";
import "./App.css";

export const API_URL = "http://localhost:5000";
const SESSION_KEY = "secureflow-demo-session";
const PROFILE_KEY = "secureflow-profile";
const SETTINGS_KEY = "secureflow-settings";
const levels = ["Critical", "High", "Medium", "Low"];
const statuses = ["Blocked", "Monitoring", "Review", "Resolved"];
const roles = ["Security Administrator", "Security Analyst", "Viewer"];
const severityClass = { Critical: "critical", High: "high", Medium: "medium", Low: "low" };

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? { ...fallback, ...JSON.parse(value) } : fallback;
  } catch {
    return fallback;
  }
}

function Badge({ children }) {
  const value = String(children ?? "Unknown");
  return <span className={`badge ${severityClass[value] || value.toLowerCase()}`}>{value}</span>;
}

function LoadingState() {
  return <section className="panel state-panel"><div className="spinner" aria-hidden="true" /><h2>Loading security data</h2><p>Connecting to the SENTRA API...</p></section>;
}

function ErrorState({ message, onRetry }) {
  return <section className="panel state-panel error-panel"><div className="error-icon" aria-hidden="true">!</div><h2>Unable to load security data</h2><p>{message}</p><button className="primary-action" onClick={onRetry} type="button">Retry connection</button></section>;
}

function EventRow({ event }) {
  const severity = event.risk_level || "Low";
  return <div className="event"><span className={`event-dot ${severityClass[severity] || "success"}`} aria-hidden="true">{severity === "Low" ? "✓" : "!"}</span><div><b>{event.threat_type || "Unknown threat"}</b><p>{event.ip_address || "Unknown source"} · {event.status || "Unknown status"}</p></div><time>{event.event_time ? new Date(event.event_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</time></div>;
}

function csvDownload(filename, rows) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function eventCsv(events) {
  const columns = ["id", "ip_address", "threat_type", "risk_level", "status", "event_time"];
  return [columns.join(","), ...events.map((event) => columns.map((column) => `"${String(event[column] ?? "").replaceAll('"', '""')}"`).join(","))];
}

function MetricCard({ label, value, note, color, icon }) {
  return <div className={`card ${color}`}><div className="card-top"><span>{label}</span><span className="card-icon" aria-hidden="true">{icon}</span></div><strong>{value}</strong><small>{note}</small></div>;
}

function Dashboard({ events, summary, health, onExport }) {
  const [showAll, setShowAll] = useState(false);
  const [period, setPeriod] = useState("all");
  const filteredEvents = period === "all" ? events : events.filter((event) => event.risk_level === period);
  const metrics = {
    total: events.length,
    criticalHigh: events.filter((event) => ["Critical", "High"].includes(event.risk_level)).length,
    blocked: events.filter((event) => event.status === "Blocked").length,
    review: events.filter((event) => ["Review", "Monitoring"].includes(event.status)).length,
  };
  const riskLevels = levels.map((level) => ({ level, count: events.filter((event) => event.risk_level === level).length }));
  const maxRisk = Math.max(...riskLevels.map((item) => item.count), 1);
  const maxThreat = Math.max(...summary.map((item) => Number(item.total) || 0), 1);
  return <>
    <section className="cards">
      <MetricCard label="Total Security Events" value={metrics.total} note="events in database" color="card-blue" icon="◈" />
      <MetricCard label="Critical / High Risk" value={metrics.criticalHigh} note="priority events" color="card-red" icon="!" />
      <MetricCard label="Blocked Events" value={metrics.blocked} note="blocked by policy" color="card-amber" icon="↘" />
      <MetricCard label="Requires Review" value={metrics.review} note="monitoring or review" color="card-green" icon="⌁" />
    </section>
    <div className="data-source"><span className="live-status"><span /> {health?.status === "OK" ? "API connected" : "API unavailable"}</span><span>Database: secureflow_db · {health?.message || "Unavailable"}</span></div>
    <section className="content-grid">
      <div className="panel"><div className="panel-heading"><div><h2>Threat Types</h2><p>Aggregated from live API records</p></div></div><div className="threat-bars">{summary.length === 0 ? <p className="empty-state">No threat summary data available.</p> : summary.map((item) => { const count = Number(item.total) || 0; return <div className="threat-bar" key={item.threat_type}><div><span>{item.threat_type || "Unknown"}</span><strong>{count}</strong></div><i style={{ width: `${count / maxThreat * 100}%` }} /></div>; })}</div></div>
      <div className="panel"><div className="panel-heading"><div><h2>Risk Levels</h2><p>Calculated from security event records</p></div></div><div className="risk-list">{riskLevels.map((item) => <div className="risk-item" key={item.level}><span><Badge>{item.level}</Badge></span><div className="risk-track"><i style={{ width: `${item.count / maxRisk * 100}%` }} /></div><strong>{item.count}</strong></div>)}</div></div>
    </section>
    <section className="panel table-panel"><div className="panel-heading"><div><h2>Security Events</h2><p>Live records returned by the PostgreSQL-backed API</p></div><div className="table-actions"><select className="period-button" value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Filter events by risk"><option value="all">All risk levels</option>{levels.map((level) => <option key={level}>{level}</option>)}</select><button className="text-button" onClick={() => onExport(events)} type="button">Export CSV ↓</button></div></div><div className="event-table"><table><thead><tr><th>IP Address</th><th>Threat</th><th>Risk</th><th>Status</th><th>Event Time</th></tr></thead><tbody>{filteredEvents.length === 0 ? <tr><td className="empty-cell" colSpan="5">No security events match this filter.</td></tr> : filteredEvents.map((event) => <tr key={event.id}><td>{event.ip_address || "Unknown"}</td><td>{event.threat_type || "Unknown"}</td><td><Badge>{event.risk_level}</Badge></td><td><Badge>{event.status}</Badge></td><td>{event.event_time ? new Date(event.event_time).toLocaleString() : "Unknown"}</td></tr>)}</tbody></table></div></section>
    <section className="panel"><div className="panel-heading"><div><h2>Recent Activity</h2><p>Latest events from the API</p></div><button className="text-button" onClick={() => setShowAll((current) => !current)} type="button">{showAll ? "Show less ↑" : "View all →"}</button></div>{(showAll ? filteredEvents : filteredEvents.slice(0, 3)).map((event) => <EventRow event={event} key={event.id} />)}{filteredEvents.length === 0 && <p className="empty-state">No recent activity.</p>}</section>
  </>;
}

function SecurityPage({ events, summary }) {
  const risks = levels.map((level) => ({ level, count: events.filter((event) => event.risk_level === level).length }));
  const maxRisk = Math.max(...risks.map((item) => item.count), 1);
  const maxThreat = Math.max(...summary.map((item) => Number(item.total) || 0), 1);
  const statusSummary = statuses.map((status) => ({ status, count: events.filter((event) => event.status === status).length }));
  return <section className="security-layout"><div className="overview-grid"><MetricCard label="Total Events" value={events.length} note="events" color="card-blue" icon="◈" />{risks.map((item) => <MetricCard key={item.level} label={item.level} value={item.count} note="events" color={item.level === "Critical" ? "card-red" : item.level === "High" ? "card-amber" : "card-green"} icon="•" />)}<MetricCard label="Blocked" value={events.filter((event) => event.status === "Blocked").length} note="events" color="card-blue" icon="✓" /><MetricCard label="Monitoring" value={events.filter((event) => event.status === "Monitoring").length} note="events" color="card-blue" icon="◌" /><MetricCard label="Review" value={events.filter((event) => event.status === "Review").length} note="events" color="card-amber" icon="!" /></div><div className="page-grid"><div className="panel page-panel"><div className="panel-heading"><div><h2>Threat Distribution</h2><p>Threat intelligence from live events</p></div><Badge>Live</Badge></div><div className="threat-bars">{summary.length === 0 ? <p className="empty-state">No threat distribution data available.</p> : summary.map((item) => <div className="threat-bar" key={item.threat_type}><div><span>{item.threat_type || "Unknown"}</span><strong>{Number(item.total) || 0}</strong></div><i style={{ width: `${(Number(item.total) || 0) / maxThreat * 100}%` }} /></div>)}</div></div><div className="panel page-panel"><div className="panel-heading"><div><h2>Risk Distribution</h2><p>Events by current risk level</p></div></div><div className="risk-list">{risks.map((item) => <div className="risk-item" key={item.level}><span><Badge>{item.level}</Badge></span><div className="risk-track"><i style={{ width: `${item.count / maxRisk * 100}%` }} /></div><strong>{item.count}</strong></div>)}</div></div></div><section className="panel"><div className="panel-heading"><div><h2>Status Distribution</h2><p>Operational status across live records</p></div></div><div className="status-summary">{statusSummary.map((item) => <div key={item.status}><span><Badge>{item.status}</Badge></span><strong>{item.count}</strong></div>)}</div><div className="security-activity"><h3>Recent Security Activity</h3>{events.slice(0, 5).map((event) => <EventRow event={event} key={event.id} />)}{events.length === 0 && <p className="empty-state">No recent security activity.</p>}</div></section></section>;
}

function DetailsModal({ event, onClose }) {
  useEffect(() => {
    const closeOnEscape = (keyboardEvent) => { if (keyboardEvent.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="details-modal" role="dialog" aria-modal="true" aria-labelledby="alert-details-title" onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}><div className="modal-heading"><h2 id="alert-details-title">Alert details</h2><button className="close-button" onClick={onClose} type="button" aria-label="Close alert details">×</button></div><dl>{Object.entries(event).map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{key === "risk_level" || key === "status" ? <Badge>{value}</Badge> : String(value ?? "Unknown")}</dd></div>)}</dl></div></div>;
}

function AlertsPage({ events }) {
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const counts = levels.map((level) => ({ level, count: events.filter((event) => event.risk_level === level).length }));
  const filtered = events.filter((event) => {
    const haystack = `${event.threat_type || ""} ${event.ip_address || ""} ${event.status || ""}`.toLowerCase();
    return (riskFilter === "All" || event.risk_level === riskFilter) && (statusFilter === "All" || event.status === statusFilter) && haystack.includes(search.toLowerCase());
  });
  const clearFilters = () => { setRiskFilter("All"); setStatusFilter("All"); setSearch(""); };
  return <section className="alerts-section"><div className="alert-summary"><MetricCard label="Total Alerts" value={events.length} note="total events" color="card-blue" icon="◈" />{counts.map((item) => <MetricCard key={item.level} label={`${item.level} Alerts`} value={item.count} note={`${item.level.toLowerCase()} risk`} color={item.level === "Critical" ? "card-red" : item.level === "High" ? "card-amber" : "card-green"} icon="!" />)}</div><section className="panel"><div className="panel-heading"><div><h2>Security Alerts</h2><p>Search and inspect live events returned by the API</p></div><div className="alert-controls"><label className="sr-only" htmlFor="alert-search">Search alerts</label><input id="alert-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search IP, threat or status" /><select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} aria-label="Filter alerts by risk"><option>All</option>{levels.map((level) => <option key={level}>{level}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter alerts by status"><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><button className="secondary-action" onClick={clearFilters} type="button">Clear</button></div></div><div className="event-table"><table><thead><tr><th>Severity</th><th>Threat</th><th>Source</th><th>Status</th><th>Event Time</th><th>Action</th></tr></thead><tbody>{filtered.length === 0 ? <tr><td className="empty-cell" colSpan="6">No alerts match your filters.</td></tr> : filtered.map((event) => <tr key={event.id}><td><Badge>{event.risk_level}</Badge></td><td>{event.threat_type || "Unknown"}</td><td>{event.ip_address || "Unknown"}</td><td><Badge>{event.status}</Badge></td><td>{event.event_time ? new Date(event.event_time).toLocaleString() : "Unknown"}</td><td><button className="row-action" onClick={() => setSelectedAlert(event)} type="button">View Details</button></td></tr>)}</tbody></table></div></section>{selectedAlert && <DetailsModal event={selectedAlert} onClose={() => setSelectedAlert(null)} />}</section>;
}

function ReportsPage({ events, summary, onExport }) {
  const risks = levels.map((level) => [level, events.filter((event) => event.risk_level === level).length]);
  const statusCounts = statuses.map((status) => [status, events.filter((event) => event.status === status).length]);
  const [reportType, setReportType] = useState("");
  const generate = (type) => setReportType(type);
  return <section className="reports-layout"><section className="panel page-panel printable-report"><div className="panel-heading"><div><h2>Security Summary</h2><p>Current posture calculated from live API data</p></div><div className="table-actions"><button className="secondary-action" onClick={() => window.print()} type="button">Print Report</button><button className="primary-action" onClick={() => onExport(events)} type="button">Export CSV</button></div></div><div className="report-summary-grid"><div><span>Total events</span><strong>{events.length}</strong></div><div><span>Blocked events</span><strong>{statusCounts.find(([status]) => status === "Blocked")?.[1] || 0}</strong></div><div><span>Review events</span><strong>{(statusCounts.find(([status]) => status === "Review")?.[1] || 0) + (statusCounts.find(([status]) => status === "Monitoring")?.[1] || 0)}</strong></div><div><span>Threat types</span><strong>{summary.length}</strong></div></div><h3>Risk summary</h3><div className="report-risk-list">{risks.map(([level, count]) => <div key={level}><Badge>{level}</Badge><span>{count} events</span></div>)}</div><h3>Status summary</h3><div className="report-risk-list">{statusCounts.map(([status, count]) => <div key={status}><Badge>{status}</Badge><span>{count} events</span></div>)}</div></section><section className="panel page-panel"><h2>Generate Report</h2><p className="page-intro">Create an exportable snapshot of this API-backed dataset.</p><div className="report-list">{["Daily Security Report", "Weekly Threat Report", "Monthly Security Summary"].map((type) => <button key={type} onClick={() => generate(type)} type="button">{type}<span>Generate →</span></button>)}</div>{reportType && <div className="report-result"><strong>{reportType} ready</strong><span>{events.length} events analyzed · generated {new Date().toLocaleString()}</span><button className="primary-action" onClick={() => onExport(events)} type="button">Export CSV ↓</button></div>}</section></section>;
}

function SettingsPage({ settings, onUpdate, onSave, saved, health, onRefresh, loading, lastRefresh }) {
  return <section className="settings-layout"><section className="panel page-panel"><div className="panel-heading"><div><h2>API Information</h2><p>Live connection details for this dashboard</p></div><span className={`connection-pill ${health?.status === "OK" ? "" : "connection-error"}`}><i />{health?.status === "OK" ? "Healthy" : "Unavailable"}</span></div><div className="connection-details"><div><span>Frontend</span><strong>http://localhost:5173</strong></div><div><span>Backend</span><strong>{API_URL}</strong></div><div><span>API health</span><strong>{health?.message || "Unavailable"}</strong></div><div><span>Last updated</span><strong>{lastRefresh || "Not refreshed yet"}</strong></div></div><button className="secondary-action" disabled={loading} onClick={onRefresh} type="button">{loading ? "Refreshing..." : "Refresh Connection ↻"}</button></section><section className="panel page-panel"><h2>Application Settings</h2><p className="page-intro">Preferences are stored only in this browser.</p><h3>Monitoring Settings</h3><div className="settings-list"><label htmlFor="live-monitoring">Live Monitoring <input id="live-monitoring" checked={settings.liveMonitoring} onChange={(event) => onUpdate("liveMonitoring", event.target.checked)} type="checkbox" /></label><label htmlFor="refresh-interval">Refresh interval<select id="refresh-interval" value={settings.refreshInterval} onChange={(event) => onUpdate("refreshInterval", event.target.value)}><option value="10">10 seconds</option><option value="30">30 seconds</option><option value="60">60 seconds</option></select></label></div><h3>Notification Settings</h3><div className="settings-list"><label htmlFor="notifications">Notifications <input id="notifications" checked={settings.notifications} onChange={(event) => onUpdate("notifications", event.target.checked)} type="checkbox" /></label></div><h3>Display Settings</h3><div className="settings-list"><label htmlFor="compact-dashboard">Compact Dashboard <input id="compact-dashboard" checked={settings.compactDashboard} onChange={(event) => onUpdate("compactDashboard", event.target.checked)} type="checkbox" /></label></div><button className="primary-action" onClick={onSave} type="button">{saved ? "Settings Saved ✓" : "Save Settings"}</button></section><section className="panel page-panel"><h2>Monitoring Status</h2><p className="page-intro">Live monitoring refreshes API data automatically when enabled. No credentials are stored.</p><p className="setting-note">{settings.liveMonitoring ? `Automatic refresh is enabled every ${settings.refreshInterval} seconds.` : "Automatic refresh is disabled. Manual refresh remains available."}</p></section></section>;
}

function ProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState(profile);
  const [error, setError] = useState("");
  const submit = (event) => { event.preventDefault(); if (!form.name.trim()) return setError("Full Name is required."); if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address."); setError(""); onSave({ ...form, name: form.name.trim(), email: form.email.trim() }); };
  return <FormModal title="Edit Profile" onClose={onClose}><form onSubmit={submit} noValidate><label>Full Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoFocus /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button className="primary-action" type="submit">Save Changes</button><button className="secondary-action" onClick={onClose} type="button">Cancel</button></div></form></FormModal>;
}

function PasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [message, setMessage] = useState("");
  const submit = (event) => { event.preventDefault(); if (!form.current || !form.next || !form.confirm) return setMessage("All password fields are required."); if (form.next.length < 8) return setMessage("New password must be at least 8 characters."); if (form.next !== form.confirm) return setMessage("New passwords do not match."); setMessage("Password validated for this demo session. No password was stored or changed."); setForm({ current: "", next: "", confirm: "" }); };
  return <FormModal title="Change Password" onClose={onClose}><form onSubmit={submit} noValidate><label>Current Password<input type="password" value={form.current} onChange={(event) => setForm({ ...form, current: event.target.value })} autoFocus /></label><label>New Password<input type="password" value={form.next} onChange={(event) => setForm({ ...form, next: event.target.value })} /></label><label>Confirm New Password<input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} /></label>{message && <p className={message.startsWith("Password validated") ? "form-success" : "form-error"} role="alert">{message}</p>}<div className="form-actions"><button className="primary-action" type="submit">Save Password</button><button className="secondary-action" onClick={onClose} type="button">Cancel</button></div></form></FormModal>;
}

function FormModal({ title, children, onClose }) {
  useEffect(() => { const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); }; document.addEventListener("keydown", closeOnEscape); return () => document.removeEventListener("keydown", closeOnEscape); }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="details-modal form-modal" role="dialog" aria-modal="true" aria-labelledby="form-modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><h2 id="form-modal-title">{title}</h2><button className="close-button" onClick={onClose} type="button" aria-label={`Close ${title}`}>×</button></div>{children}</div></div>;
}

function AdminProfile({ profile, onProfileSave, onBack }) {
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = (nextProfile) => { onProfileSave(nextProfile); setEditOpen(false); setSaved(true); };
  return <section className="profile-layout"><div className="panel profile-card"><div className="large-avatar">{profile.name.charAt(0).toUpperCase() || "A"}</div><h2>{profile.name}</h2><p>{profile.role}</p><Badge>Active</Badge><div className="profile-actions"><button className="primary-action" onClick={() => setEditOpen(true)} type="button">Edit Profile</button><button className="secondary-action" onClick={() => setPasswordOpen(true)} type="button">Change Password</button>  <button className="secondary-action" onClick={onBack} type="button">Back to Overview</button></div></div><div className="panel profile-details"><div className="panel-heading"><div><h2>Administrator Details</h2><p>Profile information for this workspace</p></div></div><dl><dt>Email</dt><dd>{profile.email}</dd><dt>Role</dt><dd>{profile.role}</dd><dt>Last Login</dt><dd>{profile.lastLogin}</dd><dt>Account Created</dt><dd>{profile.accountCreated}</dd><dt>Status</dt><dd><Badge>Active</Badge></dd></dl>{saved && <p className="form-success" role="status">Profile updated successfully.</p>}</div>{editOpen && <ProfileModal profile={profile} onSave={save} onClose={() => setEditOpen(false)} />}{passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} />}</section>;}

function CreateAccount({ onCancel }) {
  const [form, setForm] = useState({ name: "", email: "", role: roles[1], password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const update = (key, value) => { setSuccess(false); setError(""); setForm((current) => ({ ...current, [key]: value })); };
  const submit = (event) => { event.preventDefault(); if (!form.name.trim() || !form.email.trim() || !form.role || !form.password || !form.confirm) return setError("Complete all required fields."); if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address."); if (form.password.length < 8) return setError("Password must be at least 8 characters."); if (form.password !== form.confirm) return setError("Passwords do not match."); setError(""); setSuccess(true); setForm({ ...form, password: "", confirm: "" }); };
  return <section className="panel form-panel"><div className="panel-heading"><div><h2>Create Account</h2><p>Demo-only account form. No password is stored or sent to PostgreSQL.</p></div></div><form onSubmit={submit} noValidate><div className="form-grid"><label>Full Name<input value={form.name} onChange={(event) => update("name", event.target.value)} required autoFocus /></label><label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required /></label><label>Role<select value={form.role} onChange={(event) => update("role", event.target.value)}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label><label>Password<input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required /></label><label>Confirm Password<input type="password" value={form.confirm} onChange={(event) => update("confirm", event.target.value)} required /></label></div>{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">Account created successfully (demo-only). Password fields were cleared and no database user was created.</p>}<div className="form-actions"><button className="primary-action" type="submit">Create Account</button><button className="secondary-action" onClick={onCancel} type="button">Cancel</button></div></form></section>;
}

function AccountPage({ onManage, onSecurity, health }) {
  return <section className="account-layout"><section className="panel page-panel"><h2>Account Information</h2><div className="account-list"><div><span>Account</span><strong>Admin</strong></div><div><span>Role</span><strong>Security Administrator</strong></div><div><span>Session Status</span><strong className="status-online">Active</strong></div><div><span>Security Status</span><strong className="status-online">Protected</strong></div><div><span>API Status</span><strong className={health?.status === "OK" ? "status-online" : "status-offline"}>{health?.status === "OK" ? "Connected" : "Unavailable"}</strong></div></div><div className="form-actions"><button className="primary-action" onClick={onManage} type="button">Manage Account</button><button className="secondary-action" onClick={onSecurity} type="button">Security Settings</button></div></section></section>;
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const submit = (event) => { event.preventDefault(); if (!email.trim() || !password.trim()) return setError("Enter an email and password to continue."); onLogin(remember); };
  return <main className="login-shell"><div className="login-card"><div className="brand-lockup"><div className="brand-mark" aria-hidden="true">S</div><div><h2>SENTRA</h2><span>SECURITY INTELLIGENCE</span></div></div><h1>Welcome back</h1><p>Sign in to your security workspace.</p><form onSubmit={submit} noValidate><label>Email<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} autoComplete="email" autoFocus /></label><label>Password<input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} autoComplete="current-password" /></label><label className="checkbox-label"><input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" /> Remember Me</label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-action" type="submit">Sign In</button></form><small>Demo mode: use any non-empty credentials. Suggested account: admin@secureflow.local</small></div></main>;
}

function AdminMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => { const close = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false); }; const escape = (event) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("mousedown", close); document.addEventListener("keydown", escape); return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); }; }, []);
  const select = (action) => { setOpen(false); onSelect(action); };
  return <div className="admin-menu" ref={menuRef}><button className="profile" onClick={() => setOpen((current) => !current)} type="button" aria-expanded={open} aria-haspopup="menu"><span className="avatar">A</span> Admin <span aria-hidden="true">⌄</span></button>{open && <div className="admin-dropdown" role="menu"><button onClick={() => select("profile")} role="menuitem" type="button">Profile</button><button onClick={() => select("account")} role="menuitem" type="button">Account</button><button onClick={() => select("settings")} role="menuitem" type="button">Settings</button><button onClick={() => select("logout")} role="menuitem" type="button">Logout</button></div>}</div>;
}

function LogoutDialog({ onCancel, onConfirm }) {
  return <FormModal title="Confirm logout" onClose={onCancel}><p>Are you sure you want to logout?</p><div className="form-actions"><button className="secondary-action" onClick={onCancel} type="button">Cancel</button><button className="primary-action" onClick={onConfirm} type="button">Logout</button></div></FormModal>;
}

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [data, setData] = useState({ events: [], summary: [], health: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState("");
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(SESSION_KEY) === "active" || localStorage.getItem(SESSION_KEY) === "active");
  const [adminView, setAdminView] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profile, setProfile] = useState(() => readStorage(PROFILE_KEY, { name: "Admin", email: "admin@secureflow.local", role: "Security Administrator", lastLogin: "Today", accountCreated: "Local demo workspace" }));
  const [settings, setSettings] = useState(() => readStorage(SETTINGS_KEY, defaultSettings));
  const [settingsSaved, setSettingsSaved] = useState(false);
  const requestInFlight = useRef(false);
  const loadData = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setLoading(true);
    setError("");
    try {
      const endpoints = [["/api/health", "health"], ["/api/security-events", "security events"], ["/api/threat-summary", "threat summary"]];
      const responses = await Promise.all(endpoints.map(async ([path, label]) => {
        const response = await fetch(`${API_URL}${path}`);
        if (!response.ok) throw new Error(`${label} endpoint returned HTTP ${response.status}.`);
        const payload = await response.json();
        if (path !== "/api/health" && !Array.isArray(payload)) throw new Error(`${label} endpoint returned an invalid response.`);
        return payload;
      }));
      const [health, events, summary] = responses;
      setData({ health, events, summary });
      setLastRefresh(new Date().toLocaleString());
    } catch (requestError) {
      setError(`${requestError.message} Check that the backend is running at ${API_URL}.`);
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }, []);
  // The request is a subscription to the authenticated session and is intentionally
  // started after mount or login.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (authenticated) loadData(); }, [authenticated, loadData]);
  useEffect(() => { document.title = `SENTRA | ${adminView ? adminView : activePage}`; }, [activePage, adminView]);
  useEffect(() => {
    if (!authenticated || !settings.liveMonitoring) return undefined;
    const interval = window.setInterval(loadData, Number(settings.refreshInterval) * 1000);
    return () => window.clearInterval(interval);
  }, [authenticated, loadData, settings.liveMonitoring, settings.refreshInterval]);
  const saveProfile = useCallback((nextProfile) => { setProfile(nextProfile); localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile)); }, []);
  const updateSettings = useCallback((key, value) => { setSettingsSaved(false); setSettings((current) => ({ ...current, [key]: value })); }, []);
  const saveSettings = useCallback(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); setSettingsSaved(true); }, [settings]);
  const exportEvents = (events) => csvDownload("secureflow-security-events.csv", eventCsv(events));
  const pageContent = useMemo(() => {
    if (loading && !data.health) return <LoadingState />;
    if (error && !data.health) return <ErrorState message={error} onRetry={loadData} />;
    if (adminView === "profile") return <AdminProfile profile={profile} onProfileSave={saveProfile} onBack={() => setAdminView("")} />;
    if (adminView === "create") return <CreateAccount onCancel={() => setAdminView("")} />;
    if (adminView === "account") return <AccountPage health={data.health} onManage={() => setAdminView("profile")} onSecurity={() => { setAdminView(""); setActivePage("Settings"); }} />;
    if (activePage === "Overview") return <Dashboard {...data} onExport={exportEvents} />;
    if (activePage === "Threats" || activePage === "Analytics") return <SecurityPage {...data} />;
    if (activePage === "Incidents" || activePage === "Events") return <AlertsPage {...data} />;
    if (activePage === "Reports") return <ReportsPage {...data} onExport={exportEvents} />;
    return <SettingsPage settings={settings} onUpdate={updateSettings} onSave={saveSettings} saved={settingsSaved} health={data.health} lastRefresh={lastRefresh} loading={loading} onRefresh={loadData} />;
  }, [activePage, adminView, data, error, lastRefresh, loading, loadData, profile, saveProfile, saveSettings, settings, settingsSaved, updateSettings]);
  if (!authenticated) return <LoginPage onLogin={(remember) => { setAuthenticated(true); (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, "active"); }} />;
  const selectAdminAction = (action) => { if (action === "logout") setLogoutOpen(true); else if (action === "settings") { setAdminView(""); setActivePage("Settings"); } else setAdminView(action); };
  const confirmLogout = () => { setLogoutOpen(false); setAdminView(""); setActivePage("Overview"); setAuthenticated(false); sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); setData({ events: [], summary: [], health: null }); };
  return <div className="dashboard"><aside className="sidebar"><div className="brand-lockup"><div className="brand-mark" aria-hidden="true">S</div><div><h2>SENTRA</h2><span>SECURITY INTELLIGENCE</span></div></div><div className="workspace-label">WORKSPACE <span>PRO</span></div><nav aria-label="Primary navigation">{navItems.map(([label, icon]) => <button className={activePage === label && !adminView ? "active" : ""} key={label} onClick={() => { setAdminView(""); setActivePage(label); }} type="button"><span className="nav-icon" aria-hidden="true">{icon}</span>{label}</button>)}</nav></aside><main className="main"><header className="topbar"><div className="heading-block"><div className="breadcrumb">OPERATIONS <span>/</span> {adminView ? adminView.toUpperCase() : activePage.toUpperCase()}</div><h1>{adminView === "profile" ? "Admin Profile" : adminView === "create" ? "Create Account" : adminView === "account" ? "Account" : activePage === "Overview" ? "Security Overview" : activePage}</h1><p>PostgreSQL-backed security monitoring · {lastRefresh ? `Updated ${lastRefresh}` : "Awaiting first update"}</p></div><div className="topbar-actions"><div className={`live-status ${settings.liveMonitoring ? "" : "muted-status"}`}><span /> {settings.liveMonitoring ? "System operational" : "Monitoring paused"}</div><AdminMenu onSelect={selectAdminAction} /></div></header>{error && data.health && <div className="error-banner" role="alert">{error}<button className="text-button" onClick={loadData} type="button">Retry</button></div>}{pageContent}</main>{logoutOpen && <LogoutDialog onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />}</div>;
}

export default App;
