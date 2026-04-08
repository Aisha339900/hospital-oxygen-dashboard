import React, { useEffect, useId, useRef } from 'react';
import { FiX } from 'react-icons/fi';

function DetailModal({ detailView, onClose }) {
  const titleId = useId();
  const closeBtnRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!detailView) {
      return undefined;
    }
    previouslyFocusedRef.current = document.activeElement;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [detailView, onClose]);

  if (!detailView) {
    return null;
  }

  return (
    <div className="detail-modal-backdrop" onClick={onClose}>
      <div
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="detail-modal-header">
          <div>
            <p className="detail-modal-label">Detail preview</p>
            <h3 id={titleId}>{detailView.title}</h3>
          </div>
          <button
            ref={closeBtnRef}
            className="icon-chip"
            type="button"
            aria-label="Close detail"
            onClick={onClose}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        {detailView.description && <p className="detail-description">{detailView.description}</p>}
        {detailView.meta && (
          <dl className="detail-meta-grid">
            {detailView.meta
              .filter((item) => item?.value !== null && item?.value !== undefined && item?.value !== "")
              .map((item) => (
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
