import React from 'react';
import { FiUpload, FiExternalLink } from 'react-icons/fi';

function BackupDemandPage({
  backupDemandUpload,
  backupDemandPreviewUrl,
  canInlineBackupDemandPreview,
  handleBackupDemandUpload,
  formatFileSize,
  uploadedBackupDemandTimestamp,
}) {
  return (
    <div className="main-column logs-view">
      <section className="panel logs-panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">Backup & Demand</p>
            <span>Simulation-Based Evaluation of a Hospital Oxygen Supply System.</span>
          </div>
          {backupDemandUpload && backupDemandPreviewUrl ? (
            <div className="panel-actions">
              <a
                className="icon-chip"
                href={backupDemandPreviewUrl}
                download={backupDemandUpload.name}
              >
                <FiExternalLink aria-hidden="true" />
              </a>
            </div>
          ) : null}
        </div>

        <div className="logs-upload-grid">
          <label className="upload-dropzone" htmlFor="backup-demand-file-input">
            <FiUpload aria-hidden="true" />
            <p>Drag and drop or click to upload</p>
            <span>Supported formats: DOCX, PDF, XLSX, CSV, TXT</span>
            <input
              id="backup-demand-file-input"
              type="file"
              accept=".docx,.pdf,.xlsx,.xls,.csv,.txt,.json"
              onChange={handleBackupDemandUpload}
            />
          </label>

          <div className="logs-file-meta">
            {backupDemandUpload ? (
              <>
                <p className="meta-heading">{backupDemandUpload.name}</p>
                <ul>
                  <li>
                    <span>Type</span>
                    <strong>{backupDemandUpload.type}</strong>
                  </li>
                  <li>
                    <span>Size</span>
                    <strong>{formatFileSize(backupDemandUpload.size)}</strong>
                  </li>
                  <li>
                    <span>Last modified</span>
                    <strong>{uploadedBackupDemandTimestamp}</strong>
                  </li>
                </ul>
              </>
            ) : (
              <div className="logs-empty">
                <p>Upload your backup demand file to keep it available for review here.</p>
                <p className="logs-hint">For DOCX files, use the open button to view in a new tab.</p>
              </div>
            )}
          </div>
        </div>

        {backupDemandUpload && backupDemandPreviewUrl ? (
          <div className="logs-preview">
            {canInlineBackupDemandPreview ? (
              <iframe
                title={`Backup demand preview for ${backupDemandUpload.name}`}
                src={backupDemandPreviewUrl}
                aria-label="Uploaded backup demand file preview"
              ></iframe>
            ) : (
              <div className="logs-preview-fallback">
                <p>Inline preview is not available for this file type.</p>
                <a href={backupDemandPreviewUrl} target="_blank" rel="noreferrer">
                  Open in a new tab
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="logs-placeholder-copy">No backup demand file has been uploaded yet.</p>
        )}
      </section>
    </div>
  );
}

export default BackupDemandPage;
