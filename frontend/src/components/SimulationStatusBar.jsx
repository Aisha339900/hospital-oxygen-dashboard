import React from 'react';

function formatElapsedTime(ms) {
  if (ms <= 0) return 'Day 0, 00:00 UTC';
  const days    = Math.floor(ms / 86400000);
  const rem     = ms % 86400000;
  const hours   = Math.floor(rem / 3600000);
  const minutes = Math.floor((rem % 3600000) / 60000);
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `Day ${days}, ${hh}:${mm} UTC`;
}

function SimulationStatusBar({ isSimulationRunning, isSimulationPaused, simulationSpeed, elapsedSimulationTime }) {
  const isStopped = !isSimulationRunning && !isSimulationPaused;
  const isPaused  = isSimulationRunning && isSimulationPaused;

  let statusLabel = 'Running';
  let statusClass = 'sim-status--running';
  if (isStopped) {
    statusLabel = 'Stopped';
    statusClass = 'sim-status--stopped';
  } else if (isPaused) {
    statusLabel = 'Paused';
    statusClass = 'sim-status--paused';
  }

  return (
    <div className="sim-status-bar">
      <span className={`sim-status-pill ${statusClass}`}>{statusLabel}</span>
      <span className="sim-status-item sim-status-time">
        {formatElapsedTime(elapsedSimulationTime)}
      </span>
      <span className="sim-status-item sim-status-speed">
        {simulationSpeed}x
      </span>
    </div>
  );
}

export default SimulationStatusBar;
