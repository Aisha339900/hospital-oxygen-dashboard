import React from "react";

function StatusProgressBar({
  label,
  valueText,
  progressPercent,
  status,
  message,
}) {
  const width = Math.min(Math.max(Number(progressPercent) || 0, 0), 100);

  return (
    <div className="status-progress" role="group" aria-label={label}>
      <div className="status-progress__header">
        <p>{label}</p>
        <strong>{valueText}</strong>
      </div>
      <div className="progress-track status-progress__track" aria-hidden="true">
        <div
          className={`progress-fill status-progress__fill ${status}`}
          style={{ width: `${width}%` }}
        ></div>
      </div>
      <p className={`status-progress__message ${status}`}>{message}</p>
    </div>
  );
}

export default StatusProgressBar;
