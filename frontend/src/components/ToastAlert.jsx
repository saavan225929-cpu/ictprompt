import React, { useEffect } from 'react';

const ToastAlert = ({ type = 'info', message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!message || !duration) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className={`toast-alert toast-${type}`}>
      <div className="toast-icon">
        {isSuccess && '✓'}
        {isError && '✕'}
        {!isSuccess && !isError && 'ℹ'}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default ToastAlert;
