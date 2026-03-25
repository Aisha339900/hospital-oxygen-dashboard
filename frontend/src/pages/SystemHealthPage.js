import React, { useEffect } from "react";
import { useSystemHealthContext } from "../context/SystemHealthContext";

function StatusBadge({ value, okAbove, warnAbove, unit = "" }) {
  if (value == null) return <span className="text-muted">—</span>;
  let cls = "badge-ok";
  if (warnAbove !== undefined && value >= warnAbove) cls = "badge-warn";
  if (okAbove !== undefined && value < okAbove) cls = "badge-warn";
  return (
    <span className={`badge ${cls}`}>
      {value}
      {unit}
    </span>
  );
}

function MetricRow({ label, value, unit, okAbove, warnAbove }) {
  return (
    <tr>
      <td className="metric-label">{label}</td>
      <td>
        <StatusBadge value={value} unit={unit} okAbove={okAbove} warnAbove={warnAbove} />
      </td>
    </tr>
  );
}

function SystemHealthPage() {
  const {
    systemHealth,
    healthHistory,
    loading,
    error,
    fetchSystemHealth,
    fetchSystemHealthHistory,
    clearError,
  } = useSystemHealthContext();

  useEffect(() => {
    fetchSystemHealth();
    fetchSystemHealthHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const latest = Array.isArray(systemHealth)
    ? systemHealth[0]
    : systemHealth;

  return (
    <div className="page system-health-page">
      <div className="page-header">
        <h2>System Health</h2>
        <p className="page-subtitle">Monitor real-time system performance metrics</p>
        <button
          className="btn btn-secondary"
          onClick={fetchSystemHealth}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
          <button onClick={clearError} className="alert-close">×</button>
        </div>
      )}

      {loading && !latest ? (
        <div className="loading-state">Loading system health…</div>
      ) : latest ? (
        <div className="health-grid">
          <div className="health-card">
            <h3>Current Status</h3>
            <table className="metrics-table">
              <tbody>
                <MetricRow
                  label="Overall Status"
                  value={latest.status || latest.overallStatus}
                />
                <MetricRow
                  label="Uptime"
                  value={latest.uptime}
                  unit="%"
                  okAbove={99}
                />
                <MetricRow
                  label="CPU Usage"
                  value={latest.cpuUsage}
                  unit="%"
                  warnAbove={80}
                />
                <MetricRow
                  label="Memory Usage"
                  value={latest.memoryUsage}
                  unit="%"
                  warnAbove={85}
                />
                <MetricRow
                  label="Disk Usage"
                  value={latest.diskUsage}
                  unit="%"
                  warnAbove={90}
                />
                <MetricRow
                  label="Network Latency"
                  value={latest.networkLatency}
                  unit=" ms"
                  warnAbove={200}
                />
                <MetricRow
                  label="DB Status"
                  value={latest.databaseStatus || latest.dbStatus}
                />
                <MetricRow
                  label="API Response Time"
                  value={latest.apiResponseTime}
                  unit=" ms"
                  warnAbove={500}
                />
              </tbody>
            </table>
            <p className="last-updated">
              Last updated:{" "}
              {latest.createdAt
                ? new Date(latest.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>

          {healthHistory && healthHistory.length > 0 && (
            <div className="health-card">
              <h3>Recent History</h3>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Status</th>
                      <th>CPU %</th>
                      <th>Memory %</th>
                      <th>Uptime %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthHistory.slice(0, 10).map((record) => (
                      <tr key={record._id}>
                        <td>
                          {record.createdAt
                            ? new Date(record.createdAt).toLocaleString()
                            : "—"}
                        </td>
                        <td>{record.status || record.overallStatus || "—"}</td>
                        <td>{record.cpuUsage ?? "—"}</td>
                        <td>{record.memoryUsage ?? "—"}</td>
                        <td>{record.uptime ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>No system health data available.</p>
        </div>
      )}
    </div>
  );
}

export default SystemHealthPage;
