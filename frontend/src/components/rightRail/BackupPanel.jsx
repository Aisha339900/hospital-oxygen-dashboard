import React from 'react';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import {LoadingSpinner} from '../LoadingSpinner';

function BackupPanel({ backupPanelPulse }) {
  // REPLACED: Fetch backup data from API instead of props
  const { data: healthData, loading, error } = useSystemHealth(5000);

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
      <section className={`right-card backup-panel ${backupPanelPulse ? 'pulse' : ''}`}>
        <h4>Backup Oxygen Status</h4>
        <div style={{ padding: '20px' }}>
          <LoadingSpinner message="Loading backup status..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`right-card backup-panel ${backupPanelPulse ? 'pulse' : ''}`}>
        <h4>Backup Oxygen Status</h4>
        <p style={{ color: '#ef4444' }}>Error loading backup data: {error}</p>
      </section>
    );
  }

  const health = healthData?.data || healthData || {};
  const backup = {
    mode: health.backupMode || 'STANDBY',
    level: health.backupLevel || 0,
    remainingHours: health.remainingHours || 0,
    lastChecked: health.lastCheck || new Date().getTime(),
  };

  return (
    <section className={`right-card backup-panel ${backupPanelPulse ? 'pulse' : ''}`}>
      <h4>Backup Oxygen Status</h4>
      <div className="right-grid">
        <div>
          <p>Mode</p>
          <strong>{backup.mode.toUpperCase()}</strong>
        </div>
        <div>
          <p>Level</p>
          <strong>{typeof backup.level === 'number' ? backup.level.toFixed(1) : backup.level}%</strong>
        </div>
        <div>
          <p>Coverage</p>
          <strong>{typeof backup.remainingHours === 'number' ? backup.remainingHours.toFixed(1) : backup.remainingHours} h</strong>
        </div>
        <div>
          <p>Last checked</p>
          <strong>{formatTimeAgo(backup.lastChecked)}</strong>
        </div>
      </div>
    </section>
  );
}

export default BackupPanel;