import React from 'react';
import { FiUpload, FiExternalLink } from 'react-icons/fi';

function LogsPage({
  logUpload,
  logPreviewUrl,
  canInlineLogPreview,
  handleLogUpload,
  formatFileSize,
  uploadedLogTimestamp
}) {
  return (
    <div className="main-column logs-view">
      <section className="panel logs-panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">Raw Data Logs</p>
            <span>Attach the original exported file to keep it beside the dashboard view.</span>
          </div>
          {logUpload && logPreviewUrl && (
            <div className="panel-actions">
              <a className="icon-chip" href={logPreviewUrl} download={logUpload.name}>
                <FiExternalLink aria-hidden="true" />
              </a>
            </div>
          )}
        </div>

        <div className="logs-upload-grid">
          <label className="upload-dropzone" htmlFor="log-file-input">
            <FiUpload aria-hidden="true" />
            <p>Drag & drop or click to upload</p>
            <span>Supported formats: PDF, CSV, TXT, XLSX</span>
            <input
              id="log-file-input"
              type="file"
              accept=".pdf,.csv,.txt,.xlsx,.xls,.json"
              onChange={handleLogUpload}
            />
          </label>

          <div className="logs-file-meta">
            {logUpload ? (
              <>
                <p className="meta-heading">{logUpload.name}</p>
                <ul>
                  <li>
                    <span>Type</span>
                    <strong>{logUpload.type}</strong>
                  </li>
                  <li>
                    <span>Size</span>
                    <strong>{formatFileSize(logUpload.size)}</strong>
                  </li>
                  <li>
                    <span>Last modified</span>
                    <strong>{uploadedLogTimestamp}</strong>
                  </li>
                </ul>
              </>
            ) : (
              <div className="logs-empty">
                <p>Upload the daily export (like the sample PDF) to archive the raw readings.</p>
                <p className="logs-hint">Once uploaded, the file stays available for review here.</p>
              </div>
            )}
          </div>
        </div>

        {logUpload && logPreviewUrl ? (
          <div className="logs-preview">
            {canInlineLogPreview ? (
              <iframe
                title={`Log preview for ${logUpload.name}`}
                src={logPreviewUrl}
                aria-label="Uploaded log preview"
              ></iframe>
            ) : (
              <div className="logs-preview-fallback">
                <p>Inline preview is not available for this file type.</p>
                <a href={logPreviewUrl} target="_blank" rel="noreferrer">
                  Open in a new tab
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="logs-placeholder-copy">No log has been uploaded yet.</p>
        )}
      </section>
    </div>
  );
}

export default LogsPage;
