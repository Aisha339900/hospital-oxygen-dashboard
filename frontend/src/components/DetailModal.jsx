import React from 'react';
import { FiX } from 'react-icons/fi';

function DetailModal({ detailView, onClose }) {
  if (!detailView) {
    return null;
  }

  return (
    <div className="detail-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="detail-modal" role="document" onClick={(event) => event.stopPropagation()}>
        <div className="detail-modal-header">
          <div>
            <p className="detail-modal-label">Detail preview</p>
            <h3>{detailView.title}</h3>
          </div>
          <button className="icon-chip" type="button" aria-label="Close detail" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </div>
        {detailView.description && <p className="detail-description">{detailView.description}</p>}
        {detailView.meta && (
          <dl className="detail-meta-grid">
            {detailView.meta.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {detailView.dataset && detailView.dataset.length > 0 && (
          <div className="detail-data-preview">
            <p className="detail-modal-label">Recent data preview</p>
            <pre>{JSON.stringify(detailView.dataset, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailModal;
