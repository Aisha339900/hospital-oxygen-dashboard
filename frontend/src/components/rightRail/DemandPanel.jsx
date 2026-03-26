import React from 'react';
import { useMeasurements } from '../../hooks/useMeasurements';
import {LoadingSpinner} from '../LoadingSpinner';

function DemandPanel({ demandPanelPulse }) {
  // REPLACED: Fetch supply/demand data from API instead of props
  const { data: measurements, loading, error } = useMeasurements(5000);

  if (loading) {
    return (
      <section className={`right-card demand-panel demand ${demandPanelPulse ? 'pulse' : ''}`}>
        <h4>Demand vs Supply</h4>
        <div style={{ padding: '20px' }}>
          <LoadingSpinner message="Loading demand data..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`right-card demand-panel demand ${demandPanelPulse ? 'pulse' : ''}`}>
        <h4>Demand vs Supply</h4>
        <p style={{ color: '#ef4444' }}>Error loading demand data: {error}</p>
      </section>
    );
  }

  const supplyDemand = measurements?.supplyDemand || {
    currentSupply: 0,
    currentDemand: 0,
    status: 'Unknown',
    forecast: 'No forecast available',
  };

  const isHealthy =
    parseFloat(supplyDemand.currentSupply) >=
    parseFloat(supplyDemand.currentDemand);

  const supplyFill = Math.min(
    (parseFloat(supplyDemand.currentSupply) /
      parseFloat(supplyDemand.currentDemand)) *
      100,
    140,
  );

  const constrainedFill = Math.min(Math.max(supplyFill || 0, 0), 100);

  return (
    <section className={`right-card demand-panel demand ${demandPanelPulse ? 'pulse' : ''}`}>
      <h4>Demand vs Supply</h4>
      <div className="demand-row">
        <span>Current Demand</span>
        <strong>
          {typeof supplyDemand.currentDemand === 'number'
            ? supplyDemand.currentDemand.toFixed(2)
            : supplyDemand.currentDemand}{' '}
          m³/h
        </strong>
      </div>
      <div className="demand-row">
        <span>Current Supply</span>
        <strong>
          {typeof supplyDemand.currentSupply === 'number'
            ? supplyDemand.currentSupply.toFixed(2)
            : supplyDemand.currentSupply}{' '}
          m³/h
        </strong>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${constrainedFill}%`,
            backgroundColor: isHealthy ? '#10b981' : '#ef4444',
          }}
        />
      </div>
      <p className={`status-note ${isHealthy ? 'healthy' : 'risk'}`}>
        {supplyDemand.status || (isHealthy ? 'Supply is healthy' : 'Supply is at risk')}
      </p>
      <p className="forecast-copy">{supplyDemand.forecast || 'No forecast available'}</p>
    </section>
  );
}

export default DemandPanel;