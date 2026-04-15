import React, { useMemo } from "react";

function clamp(n, lo, hi) {
  return Math.min(Math.max(n, lo), hi);
}

/**
 * @param {{ min: number; max: number; optimalMin?: number | null; optimalMax?: number | null; value: number | null; unit?: string; caption?: string }} props
 */
function KpiRangeBar({
  min,
  max,
  optimalMin = null,
  optimalMax = null,
  value,
  unit = "",
  caption = "",
}) {
  const span = max - min;
  const pct = useMemo(() => {
    if (value === null || value === undefined || !Number.isFinite(span) || span <= 0) {
      return null;
    }
    return clamp(((Number(value) - min) / span) * 100, 0, 100);
  }, [value, min, max, span]);

  const opt = useMemo(() => {
    if (
      optimalMin === null ||
      optimalMax === null ||
      !Number.isFinite(optimalMin) ||
      !Number.isFinite(optimalMax) ||
      !Number.isFinite(span) ||
      span <= 0
    ) {
      return null;
    }
    const lo = clamp(((optimalMin - min) / span) * 100, 0, 100);
    const hi = clamp(((optimalMax - min) / span) * 100, 0, 100);
    return { left: lo, width: Math.max(hi - lo, 0.5) };
  }, [optimalMin, optimalMax, min, span]);

  if (pct === null) {
    return null;
  }

  return (
    <div className="kpi-range" aria-hidden>
      <div className="kpi-range__rail">
        <div className="kpi-range__track" />
        {opt ? (
          <div
            className="kpi-range__optimal"
            style={{ left: `${opt.left}%`, width: `${opt.width}%` }}
            title="Allowed / target band"
          />
        ) : null}
        <div className="kpi-range__marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="kpi-range__ticks">
        <span>
          {min}
          {unit}
        </span>
        {caption ? <span className="kpi-range__caption">{caption}</span> : <span />}
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

export default KpiRangeBar;
