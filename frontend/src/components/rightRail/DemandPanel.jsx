import React from 'react';

function DemandPanel({ supplyDemand, supplyFill, supplyIsHealthy, demandPanelPulse }) {
  if (!supplyDemand) {
    return null;
  }

  const constrainedFill = Math.min(Math.max(supplyFill || 0, 0), 100);

  return (
    <section className={`right-card demand-panel demand ${demandPanelPulse ? 'pulse' : ''}`}>
      <h4>Demand vs Supply</h4>
      <div className="demand-row">
        <span>Current Demand</span>
        <strong>{supplyDemand.currentDemand} m³/h</strong>
      </div>
      <div className="demand-row">
        <span>Current Supply</span>
        <strong>{supplyDemand.currentSupply} m³/h</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${constrainedFill}%` }}></div>
      </div>
      <p className={`status-note ${supplyIsHealthy ? 'healthy' : 'risk'}`}>{supplyDemand.status}</p>
      <p className="forecast-copy">{supplyDemand.forecast}</p>
    </section>
  );
}

export default DemandPanel;
