import React from "react";
import { FiAlertTriangle, FiSliders } from "react-icons/fi";

const FIELD_CFG = [
  { key: "purity", label: "O₂ purity", suffix: "%", step: "0.1" },
  { key: "flowRate", label: "Flow rate", suffix: "m³/h", step: "1" },
  { key: "molarFlow", label: "Molar flow", suffix: "kmol/h", step: "0.001" },
  { key: "pressureBar", label: "Delivery pressure", suffix: "bar", step: "0.1" },
  { key: "demandCoverage", label: "Demand coverage", suffix: "%", step: "1" },
  { key: "storageLevel", label: "Storage level", suffix: "%", step: "0.01" },
  { key: "backupRemaining", label: "Backup remaining", suffix: "L", step: "10" },
  { key: "backupUtilization", label: "Backup utilization", suffix: "%", step: "1" },
  { key: "specificEnergy", label: "Specific energy", suffix: "kWh/Nm³", step: "0.05" },
];

export default function DashboardTestModePanel({
  enabled,
  onToggle,
  values,
  onChange,
}) {
  return (
    <section
      className={`dashboard-test-mode ${enabled ? "dashboard-test-mode--on" : ""}`}
      aria-label="Alarm test mode"
    >
      <div className="dashboard-test-mode__head">
        <div className="dashboard-test-mode__title">
          <FiSliders aria-hidden />
          <span>Alarm test mode</span>
        </div>
        <label className="dashboard-test-mode__toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span>Simulate inputs</span>
        </label>
      </div>
      <p className="dashboard-test-mode__lede">
        Enter values to run the same alarm rules as live data. Leave a field empty to use the
        current reading. Flow alarms: warning below 80 m³/h, critical below 40 m³/h.
      </p>
      {enabled ? (
        <div className="dashboard-test-mode__grid">
          {FIELD_CFG.map((f) => (
            <label key={f.key} className="dashboard-test-mode__field">
              <span className="dashboard-test-mode__field-label">
                {f.label} ({f.suffix})
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Live"
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            </label>
          ))}
        </div>
      ) : null}
      {enabled ? (
        <p className="dashboard-test-mode__warn" role="status">
          <FiAlertTriangle aria-hidden />
          Alerts on the right reflect simulated values, not the live plant.
        </p>
      ) : null}
    </section>
  );
}
