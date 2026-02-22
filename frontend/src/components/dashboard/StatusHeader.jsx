import React from 'react';
import { FiSun, FiBell } from 'react-icons/fi';

function StatusHeader({ isTrendsView, unacknowledgedAlarms, lastUpdated, currentStreamLabel }) {
  return (
    <header className="status-bar">
      <div className="status-left">
        {isTrendsView ? (
          <>
            <span className="status-pill placeholder-pill" aria-hidden="true"></span>
            <span className="status-pill placeholder-pill" aria-hidden="true"></span>
            <span className="status-pill placeholder-pill" aria-hidden="true"></span>
          </>
        ) : (
          <>
            <span className="status-pill warn">Warning</span>
            <span className="status-pill neutral">Stream: {currentStreamLabel}</span>
            <span className="status-pill accent">Alarms: {unacknowledgedAlarms || 0}</span>
            <span className="status-pill neutral">Last update {lastUpdated}</span>
          </>
        )}
      </div>
      <div className="status-right">
        {isTrendsView ? (
          <>
            <span className="icon-btn placeholder-circle" aria-hidden="true"></span>
            <span className="icon-btn placeholder-circle" aria-hidden="true"></span>
          </>
        ) : (
          <>
            <button className="icon-btn" aria-label="Toggle theme">
              <FiSun />
            </button>
            <button className="icon-btn" aria-label="Notifications">
              <FiBell />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default StatusHeader;
