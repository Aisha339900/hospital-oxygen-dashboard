import React from 'react';

function AlertsPanel({ isTrendsView, alarms, formatTimeAgo, alarmPanelPulse }) {
  return (
    <section className={`right-card alarm-panel ${alarmPanelPulse ? 'pulse' : ''}`}>
      <h4>{isTrendsView ? <span className="placeholder-bar short" aria-hidden="true"></span> : 'Alarm & Alert'}</h4>
      {isTrendsView ? (
        <div className="placeholder-list" aria-hidden="true">
          <span className="placeholder-bar medium"></span>
          <span className="placeholder-bar medium"></span>
          <span className="placeholder-bar medium"></span>
        </div>
      ) : alarms.length === 0 ? (
        <p className="empty-state">All systems stable.</p>
      ) : (
        <ul className="alarm-list">
          {alarms.map((alarm) => (
            <li key={alarm.id}>
              <div>
                <p>{alarm.message}</p>
                <span>{formatTimeAgo(alarm.timestamp)}</span>
              </div>
              <span className={`badge ${alarm.severity}`}>{alarm.severity}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AlertsPanel;
