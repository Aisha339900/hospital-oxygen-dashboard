import React from 'react';
import { useAlarms } from '../../hooks/useAlarms';
import {LoadingSpinner} from '../LoadingSpinner';

function AlertsPanel({ alarmPanelPulse }) {
  // REPLACED: Fetch alarms from API instead of props
  const { data: alarmsData, loading, error } = useAlarms(5000);

  const alarms = Array.isArray(alarmsData?.data) ? alarmsData.data : [];

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const diff = Date.now() - new Date(timestamp).getTime();
    const days = Math.floor(diff / 86400000);
    if (days >= 1) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours >= 1) return `${hours}h ago`;
    const minutes = Math.floor(diff / 60000);
    if (minutes >= 1) return `${minutes}m ago`;
    const seconds = Math.floor(diff / 1000);
    if (seconds >= 1) return `${seconds}s ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <section className={`right-card alarm-panel ${alarmPanelPulse ? 'pulse' : ''}`}>
        <h4>Alarm & Alert</h4>
        <div style={{ padding: '20px' }}>
          <LoadingSpinner message="Loading alarms..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`right-card alarm-panel ${alarmPanelPulse ? 'pulse' : ''}`}>
        <h4>Alarm & Alert</h4>
        <p style={{ color: '#ef4444' }}>Error loading alarms: {error}</p>
      </section>
    );
  }

  return (
    <section className={`right-card alarm-panel ${alarmPanelPulse ? 'pulse' : ''}`}>
      <h4>Alarm & Alert</h4>
      {alarms.length === 0 ? (
        <p className="empty-state">All systems stable.</p>
      ) : (
        <ul className="alarm-list">
          {alarms.map((alarm, idx) => (
            <li key={alarm._id || alarm.id || idx}>
              <div>
                <p>{alarm.message}</p>
                <span>{formatTimeAgo(alarm.createdAt || alarm.timestamp)}</span>
              </div>
              <span className={`badge ${alarm.severity?.toLowerCase() || 'info'}`}>
                {alarm.severity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AlertsPanel;