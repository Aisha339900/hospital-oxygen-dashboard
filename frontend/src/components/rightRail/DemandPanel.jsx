import React from "react";

const clampPercent = (value) => Math.min(Math.max(value || 0, 0), 140);

const formatValue = (
  value,
  { decimals = 0, suffix = "", asVolume = false } = {},
) => {
  if (value === null || value === undefined) {
    return "—";
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return String(value);
  }
  if (asVolume) {
    return `${Math.floor(parsed).toLocaleString()} L`;
  }
  const formatted = parsed.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted}${suffix}`.trim();
};

function DemandPanel({ supplyDemand, supplyFill, supplyIsHealthy, demandPanelPulse }) {
  if (!supplyDemand) {
    return null;
  }

  const constrainedFill = clampPercent(supplyFill || 0);
  const demand = supplyDemand.demand || {};
  const supply = supplyDemand.supply || {};
  const coverageValue = supply.coveragePercent ?? supply.coverage_percent;
  const fallbackTotal =
    demand.generalRequests === undefined && demand.icuRequests === undefined
      ? null
      : (demand.generalRequests ?? 0) + (demand.icuRequests ?? 0);

  const sections = [
    {
      title: "Demand",
      rows: [
        { label: "Total Requests", value: demand.totalRequests ?? fallbackTotal },
        { label: "General", value: demand.generalRequests },
        { label: "ICU", value: demand.icuRequests },
      ],
    },
    {
      title: "Supply",
      rows: [
        {
          label: "Main Tank Utilization",
          value: supply.mainUtilizationPercent,
          suffix: "%",
          decimals: 2,
        },
        {
          label: "Main Oxygen Remaining",
          value: supply.mainRemainingLiters,
          asVolume: true,
        },
        {
          label: "Demand Coverage",
          value: coverageValue,
          suffix: "%",
          decimals: 0,
        },
      ],
    },
  ];

  return (
    <section className={`right-card demand-panel demand ${demandPanelPulse ? "pulse" : ""}`}>
      <h4>Demand vs Supply</h4>
      <div className="demand-sections demand-grid">
        {sections.map((section) => (
          <div className="demand-section-card" key={section.title}>
            <h5>{section.title}</h5>
            <div className="right-grid">
              {section.rows.map((row) => (
                <div key={`${section.title}-${row.label}`}>
                  <p>{row.label}</p>
                  <strong>
                    {formatValue(row.value, {
                      decimals: row.decimals ?? 0,
                      suffix: row.suffix,
                      asVolume: row.asVolume,
                    })}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${constrainedFill}%` }}></div>
      </div>
      <p className={`status-note ${supplyIsHealthy ? "healthy" : "risk"}`}>
        {supplyDemand.status || "Status unavailable"}
      </p>
      {supplyDemand.forecast ? (
        <p className="forecast-copy">{supplyDemand.forecast}</p>
      ) : null}
    </section>
  );
}

export default DemandPanel;
