import React from 'react';
import { FiSun, FiBell } from 'react-icons/fi';

function StatusHeader({ unacknowledgedAlarms, lastUpdated, currentStreamLabel }) {
  return (
    <header className="status-bar">
      <div className="status-left">
        <span className="status-pill neutral">Stream: {currentStreamLabel}</span>
        <span className="status-pill accent">Alarms: {unacknowledgedAlarms || 0}</span>
        <span className="status-pill neutral">Last update {lastUpdated}</span>
      </div>
      <div className="status-right">
        <button className="icon-btn" aria-label="Toggle theme">
          <FiSun />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <FiBell />
        </button>
      </div>
    </header>
  );
}

export default StatusHeader;
