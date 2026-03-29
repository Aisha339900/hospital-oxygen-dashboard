import React from 'react';
import { FiSun, FiBell, FiMoon } from 'react-icons/fi';

function StatusHeader({
  unacknowledgedAlarms,
  lastUpdated,
  currentStreamLabel,
  isDarkMode,
  onToggleTheme,
}) {
  return (
    <header className="status-bar">
      <div className="status-left">
        <span className="status-pill neutral">Stream: {currentStreamLabel}</span>
        <span className="status-pill accent">Alarms: {unacknowledgedAlarms || 0}</span>
        <span className="status-pill neutral">Last update {lastUpdated}</span>
      </div>
      <div className="status-right">
        <button
          className="icon-btn"
          type="button"
          aria-label="Toggle theme"
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
        </button>
        <button className="icon-btn" type="button" aria-label="Notifications">
          <FiBell aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default StatusHeader;
