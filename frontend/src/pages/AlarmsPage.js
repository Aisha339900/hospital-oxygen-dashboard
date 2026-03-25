import React, { useEffect, useState } from "react";
import { useAlarmContext } from "../context/AlarmContext";

const SEVERITY_LABELS = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

const STATUS_LABELS = {
  active: "Active",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

function AlarmsPage() {
  const {
    alarms,
    loading,
    error,
    filter,
    fetchAlarms,
    fetchActiveAlarms,
    acknowledgeAlarm,
    resolveAlarm,
    setFilter,
    clearError,
  } = useAlarmContext();

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (activeTab === "active") {
      fetchActiveAlarms();
    } else {
      fetchAlarms(filter);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key, value) => {
    const updated = { ...filter, [key]: value || null };
    setFilter(updated);
    fetchAlarms(updated);
  };

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlarm(id);
    } catch (err) {
      // error handled by context
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveAlarm(id);
    } catch (err) {
      // error handled by context
    }
  };

  const displayedAlarms =
    activeTab === "active"
      ? alarms.filter((a) => a.status === "active")
      : alarms;

  return (
    <div className="page alarms-page">
      <div className="page-header">
        <h2>Alarms &amp; Alerts</h2>
        <p className="page-subtitle">
          Monitor and manage system alarms
        </p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
          <button onClick={clearError} className="alert-close">×</button>
        </div>
      )}

      <div className="page-tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Alarms
        </button>
        <button
          className={`tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active
        </button>
      </div>

      <div className="filter-bar">
        <select
          value={filter.severity || ""}
          onChange={(e) => handleFilterChange("severity", e.target.value)}
        >
          <option value="">All Severities</option>
          {Object.entries(SEVERITY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filter.status || ""}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading alarms…</div>
      ) : displayedAlarms.length === 0 ? (
        <div className="empty-state">
          <p>No alarms found.</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Message</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedAlarms.map((alarm) => (
                <tr
                  key={alarm._id}
                  className={`alarm-row severity-${alarm.severity}`}
                >
                  <td>
                    <span className={`badge badge-${alarm.severity}`}>
                      {SEVERITY_LABELS[alarm.severity] || alarm.severity}
                    </span>
                  </td>
                  <td>{alarm.message || alarm.description || "—"}</td>
                  <td>
                    <span className={`badge badge-status-${alarm.status}`}>
                      {STATUS_LABELS[alarm.status] || alarm.status}
                    </span>
                  </td>
                  <td>
                    {alarm.createdAt
                      ? new Date(alarm.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="action-cell">
                    {alarm.status === "active" && (
                      <>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleAcknowledge(alarm._id)}
                          disabled={loading}
                        >
                          Acknowledge
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleResolve(alarm._id)}
                          disabled={loading}
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    {alarm.status === "acknowledged" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleResolve(alarm._id)}
                        disabled={loading}
                      >
                        Resolve
                      </button>
                    )}
                    {alarm.status === "resolved" && (
                      <span className="text-muted">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AlarmsPage;
