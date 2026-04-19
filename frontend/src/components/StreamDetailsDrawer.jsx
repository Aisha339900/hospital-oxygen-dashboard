import React, { useEffect, useMemo } from "react";
import { FiX } from "react-icons/fi";

function parseNormalRange(rangeStr) {
  if (rangeStr == null || typeof rangeStr !== "string") {
    return null;
  }
  const parts = rangeStr.split(/\s*[–-]\s*/).map((s) => Number(String(s).trim().replace(/,/g, "")));
  if (parts.length < 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) {
    return null;
  }
  const lo = Math.min(parts[0], parts[1]);
  const hi = Math.max(parts[0], parts[1]);
  return [lo, hi];
}

function computePropertyStatus(prop) {
  const v = Number(prop.value);
  const bounds = parseNormalRange(prop.normalRange);
  if (!Number.isFinite(v) || !bounds) {
    return "normal";
  }
  const [min, max] = bounds;
  if (v < min || v > max) {
    return "critical";
  }
  const atLo = Math.abs(v - min) < 1e-6;
  const atHi = Math.abs(v - max) < 1e-6;
  if (atLo || atHi) {
    return "warning";
  }
  return "normal";
}

function statusDotClass(status) {
  if (status === "critical") {
    return "stream-details-drawer__dot stream-details-drawer__dot--critical";
  }
  if (status === "warning") {
    return "stream-details-drawer__dot stream-details-drawer__dot--warning";
  }
  return "stream-details-drawer__dot stream-details-drawer__dot--normal";
}

function formatValue(value, unit) {
  if (!Number.isFinite(Number(value))) {
    return `— ${unit || ""}`.trim();
  }
  const n = Number(value);
  const text = Number.isInteger(n) ? String(n) : n.toFixed(3).replace(/\.?0+$/, "");
  return unit ? `${text} ${unit}` : text;
}

export default function StreamDetailsDrawer({ stream, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rows = useMemo(() => {
    if (!stream?.properties?.length) {
      return [];
    }
    return stream.properties.map((prop) => ({
      prop,
      status: computePropertyStatus(prop),
    }));
  }, [stream]);

  if (!stream) {
    return null;
  }

  return (
    <aside
      className="stream-details-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stream-details-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="stream-details-drawer__inner"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stream-details-drawer__header">
          <div className="stream-details-drawer__header-text">
            <h2 id="stream-details-drawer-title">{stream.name}</h2>
            <p className="stream-details-drawer__route">
              {stream.from} <span aria-hidden="true">→</span> {stream.to}
            </p>
          </div>
          <button
            type="button"
            className="stream-details-drawer__close"
            onClick={onClose}
            aria-label="Close stream inspector"
          >
            <FiX aria-hidden />
          </button>
        </header>

        {stream.summary ? (
          <p className="stream-details-drawer__summary">{stream.summary}</p>
        ) : null}

        <div className="stream-details-drawer__section-label">Properties</div>
        <ul className="stream-details-drawer__props">
          {rows.map(({ prop, status }) => (
            <li key={prop.key} className="stream-details-drawer__prop">
              <div className="stream-details-drawer__prop-head">
                <span className={statusDotClass(status)} title={status} />
                <div className="stream-details-drawer__prop-labels">
                  <span className="stream-details-drawer__prop-label">{prop.label}</span>
                  <span className="stream-details-drawer__prop-value">
                    {formatValue(prop.value, prop.unit)}
                  </span>
                </div>
              </div>
              <p className="stream-details-drawer__prop-range">
                Normal range: <strong>{prop.normalRange}</strong>
              </p>
              <div className="stream-details-drawer__prop-training">
                <p>
                  <span className="stream-details-drawer__training-k">Meaning:</span> {prop.meaning}
                </p>
                <p>
                  <span className="stream-details-drawer__training-k">Clinical impact:</span>{" "}
                  {prop.clinicalImpact}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
