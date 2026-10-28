import React, { useEffect } from 'react';

const ConfirmModal = ({ isOpen, title, message, itemDetails, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon warning">⚠️</div>
          <h3 className="modal-title">{title}</h3>
        </div>

        <div className="modal-body">
          <p className="modal-message">{message}</p>
          {itemDetails && (
            <div className="modal-item-box">
              <strong>{itemDetails.title}</strong>
              {itemDetails.subtitle && <span>{itemDetails.subtitle}</span>}
              {itemDetails.badge && <span className="modal-badge">{itemDetails.badge}</span>}
            </div>
          )}
          <p className="modal-warning">This action cannot be undone.</p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
