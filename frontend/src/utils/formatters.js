/**
 * Format an ISO date string into a readable format (e.g., Oct 24, 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format an ISO date string into date + time (e.g., Oct 24, 2026, 04:30 PM)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Returns today's date formatted as YYYY-MM-DD for HTML input max attribute
 */
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Allowed status transitions map according to system specification
 */
export const STATUS_TRANSITIONS = {
  Applied: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Accepted', 'Declined'],
  Accepted: [],
  Declined: [],
  Rejected: []
};

/**
 * Get permitted next statuses for an application
 */
export const getNextAllowedStatuses = (currentStatus) => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};

/**
 * Check if the application can be deleted
 * Applications in "Interview" or "Offer" cannot be deleted
 */
export const isDeletable = (status) => {
  return status !== 'Interview' && status !== 'Offer';
};
