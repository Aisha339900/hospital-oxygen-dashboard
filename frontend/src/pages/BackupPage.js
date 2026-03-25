import React, { useEffect, useState } from "react";
import { useBackup } from "../hooks/useBackup";

function BackupPage() {
  const {
    backups,
    backupStatus,
    loading,
    error,
    fetchBackups,
    fetchBackupStatus,
    startBackup,
    restoreBackup,
  } = useBackup();

  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchBackups();
    fetchBackupStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartBackup = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await startBackup({});
      setActionSuccess("Backup started successfully.");
      fetchBackups();
      fetchBackupStatus();
    } catch (err) {
      setActionError(err?.message || "Failed to start backup.");
    }
  };

  const handleRestore = async (id) => {
    setActionError(null);
    setActionSuccess(null);
    if (!window.confirm("Restore from this backup? This may overwrite current data.")) return;
    try {
      await restoreBackup(id);
      setActionSuccess("Restore initiated successfully.");
    } catch (err) {
      setActionError(err?.message || "Failed to restore backup.");
    }
  };

  return (
    <div className="page backup-page">
      <div className="page-header">
        <h2>Backup Management</h2>
        <p className="page-subtitle">Create and restore data backups</p>
        <button
          className="btn btn-primary"
          onClick={handleStartBackup}
          disabled={loading}
        >
          {loading ? "Working…" : "Start New Backup"}
        </button>
      </div>

      {(error || actionError) && (
        <div className="alert alert-error" role="alert">
          {error || actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="alert alert-success" role="status">
          {actionSuccess}
        </div>
      )}

      {backupStatus && (
        <div className="status-banner">
          <span>
            Last Backup:{" "}
            <strong>
              {backupStatus.lastBackup
                ? new Date(backupStatus.lastBackup).toLocaleString()
                : "Never"}
            </strong>
          </span>
          {backupStatus.status && (
            <span>
              Status: <strong>{backupStatus.status}</strong>
            </span>
          )}
          {backupStatus.totalBackups !== undefined && (
            <span>
              Total: <strong>{backupStatus.totalBackups}</strong>
            </span>
          )}
        </div>
      )}

      {loading && backups.length === 0 ? (
        <div className="loading-state">Loading backups…</div>
      ) : backups.length === 0 ? (
        <div className="empty-state">
          <p>No backups found. Start your first backup above.</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup._id}>
                  <td>
                    {backup.createdAt
                      ? new Date(backup.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td>{backup.type || "manual"}</td>
                  <td>
                    {backup.size
                      ? `${(backup.size / 1024 / 1024).toFixed(2)} MB`
                      : "—"}
                  </td>
                  <td>
                    <span className={`badge badge-status-${backup.status}`}>
                      {backup.status || "—"}
                    </span>
                  </td>
                  <td>
                    {backup.status === "completed" && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleRestore(backup._id)}
                        disabled={loading}
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BackupPage;
