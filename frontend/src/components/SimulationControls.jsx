import React from 'react';
import { FiPlay, FiPause, FiSquare, FiRefreshCw } from 'react-icons/fi';

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x',   value: 1   },
  { label: '2x',   value: 2   },
  { label: '4x',   value: 4   },
];

function SimulationControls({
  isSimulationRunning,
  isSimulationPaused,
  simulationSpeed,
  onPlay,
  onPause,
  onStop,
  onReset,
  onSpeedChange,
}) {
  const isStopped = !isSimulationRunning && !isSimulationPaused;
  const isRunning  = isSimulationRunning && !isSimulationPaused;

  return (
    <div className="sim-controls">
      <button
        className="sim-btn sim-btn--play"
        title="Play"
        aria-label="Play simulation"
        disabled={isRunning || isStopped}
        onClick={onPlay}
      >
        <FiPlay />
      </button>

      <button
        className="sim-btn sim-btn--pause"
        title="Pause"
        aria-label="Pause simulation"
        disabled={!isRunning}
        onClick={onPause}
      >
        <FiPause />
      </button>

      <button
        className="sim-btn sim-btn--stop"
        title="Stop"
        aria-label="Stop simulation"
        disabled={isStopped}
        onClick={onStop}
      >
        <FiSquare />
      </button>

      <button
        className="sim-btn sim-btn--reset"
        title="Reset simulation"
        aria-label="Reset simulation"
        onClick={onReset}
      >
        <FiRefreshCw />
      </button>

      <select
        className="sim-speed-select"
        aria-label="Simulation speed"
        value={simulationSpeed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
      >
        {SPEED_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SimulationControls;
