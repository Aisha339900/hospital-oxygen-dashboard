import React from 'react';

function BackupPanel({ backup, formatTimeAgo, backupPanelPulse }) {
  if (!backup) {
    return null;
  }

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
          <strong>{backup.level.toFixed(1)}%</strong>
        </div>
        <div>
          <p>Coverage</p>
          <strong>{backup.remainingHours.toFixed(1)} h</strong>
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
