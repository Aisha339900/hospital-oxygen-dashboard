import React, { useState, useEffect } from 'react';
import { FiSun, FiBell, FiMoon } from 'react-icons/fi';

function StatusHeader({ isTrendsView, unacknowledgedAlarms, lastUpdated, currentStreamLabel }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);

    if (newIsDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

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
           <button 
              className="icon-btn" 
              aria-label="Toggle theme"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FiSun /> : <FiMoon />}
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
