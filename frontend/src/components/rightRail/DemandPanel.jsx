import React from 'react';

function DemandPanel({ isTrendsView, supplyDemand, supplyFill, supplyIsHealthy, demandPanelPulse }) {
  if (!supplyDemand) {
    return null;
  }

  return (
    <section className={`right-card demand-panel demand ${demandPanelPulse ? 'pulse' : ''}`}>
      <h4>{isTrendsView ? <span className="placeholder-bar short" aria-hidden="true"></span> : 'Demand vs Supply'}</h4>
      {isTrendsView ? (
        <div className="placeholder-list" aria-hidden="true">
          <span className="placeholder-bar medium"></span>
          <span className="placeholder-bar medium"></span>
          <span className="placeholder-bar medium"></span>
        </div>
      ) : (
        <>
          <div className="demand-row">
            <span>Current Demand</span>
            <strong>{supplyDemand.currentDemand} m³/h</strong>
          </div>
          <div className="demand-row">
            <span>Current Supply</span>
            <strong>{supplyDemand.currentSupply} m³/h</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${supplyFill}%` }}></div>
          </div>
          <p className={`status-note ${supplyIsHealthy ? 'healthy' : 'risk'}`}>{supplyDemand.status}</p>
          <p className="forecast-copy">{supplyDemand.forecast}</p>
        </>
      )}
    </section>
  );
}

export default DemandPanel;
