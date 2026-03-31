import React from 'react';

function BackupPanel({ backup, backupPanelPulse }) {
  if (!backup) {
    return null;
  }

  const utilizationValue = Number(backup.utilization);
  const utilization = Number.isFinite(utilizationValue)
    ? utilizationValue
    : 0;
  const remainingValue = Number(backup.remainingLiters);
  const remainingLiters = Number.isFinite(remainingValue) ? remainingValue : 0;
  const formattedRemaining = `${Math.round(remainingLiters).toLocaleString()} L`;
  const modeLabel =
    typeof backup.mode === "string" && backup.mode.length
      ? backup.mode.toUpperCase()
      : "STANDBY";

  return (
    <section className={`right-card backup-panel ${backupPanelPulse ? 'pulse' : ''}`}>
      <h4>Backup Oxygen Status</h4>
      <div className="right-grid">
        <div>
          <p>Mode</p>
          <strong>{modeLabel}</strong>
        </div>
        <div>
          <p>Utilization</p>
          <strong>{utilization.toFixed(1)}%</strong>
        </div>
        <div>
          <p>Backup Remaining</p>
          <strong>{formattedRemaining}</strong>
        </div>
      </div>
    </section>
  );
}

export default BackupPanel;
