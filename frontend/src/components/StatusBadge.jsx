import React from 'react';

const StatusBadge = ({ status, size = 'medium' }) => {
  const statusLower = (status || '').toLowerCase();

  return (
    <span className={`status-badge status-${statusLower} size-${size}`}>
      <span className="badge-dot"></span>
      {status || 'Unknown'}
    </span>
  );
};

export const OverdueBadge = ({ size = 'medium' }) => {
  return (
    <span className={`overdue-badge size-${size}`} title="Follow-up date has passed for this applied role">
      <span className="overdue-icon">⚠️</span>
      Follow-up Overdue
    </span>
  );
};

export default StatusBadge;
