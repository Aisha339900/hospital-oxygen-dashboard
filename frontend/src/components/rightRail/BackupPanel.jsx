import React from 'react';
import StatusProgressBar from './StatusProgressBar';
import {
  clampStorageLevelPercent,
  formatStorageLevelPercent,
  getStorageLevelStatus,
} from '../../utils/backupStorageLevel';

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
  const { level, status, message } = getStorageLevelStatus(backup.storageLevel);
  const storageLevelText = formatStorageLevelPercent(level);
  const storageLevelFill = clampStorageLevelPercent(level);

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
      <StatusProgressBar
        label="Storage Level"
        valueText={storageLevelText}
        progressPercent={storageLevelFill}
        status={status}
        message={message}
      />
    </section>
  );
}

export default BackupPanel;
