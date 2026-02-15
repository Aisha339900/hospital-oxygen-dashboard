import React from 'react';

function BackupPanel({ isTrendsView, backup, formatTimeAgo, backupPanelPulse }) {
  if (!backup) {
    return null;
  }

  return (
    <section className={`right-card backup-panel ${backupPanelPulse ? 'pulse' : ''}`}>
      <h4>{isTrendsView ? <span className="placeholder-bar short" aria-hidden="true"></span> : 'Backup Oxygen Status'}</h4>
      {isTrendsView ? (
        <div className="placeholder-grid" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, idx) => (
            <span key={`backup-placeholder-${idx}`} className="placeholder-bar tiny"></span>
          ))}
        </div>
      ) : (
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
      )}
    </section>
  );
}

export default BackupPanel;
