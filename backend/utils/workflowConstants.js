/**
 * Application status workflow rules and state definitions.
 */

const ALLOWED_TRANSITIONS = {
  Applied: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Accepted', 'Declined'],
  Accepted: [],
  Declined: [],
  Rejected: []
};

const ACTIVE_STATUSES = ['Applied', 'Interview', 'Offer'];
const FINAL_STATUSES = ['Rejected', 'Accepted', 'Declined'];
const DELETABLE_STATUSES = ['Applied', 'Rejected', 'Accepted', 'Declined'];
const NON_DELETABLE_STATUSES = ['Interview', 'Offer'];

/**
 * Checks whether a transition from currentStatus to targetStatus is allowed.
 *
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {boolean}
 */
const canTransition = (currentStatus, targetStatus) => {
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowedNext.includes(targetStatus);
};

/**
 * Checks if a status is in a final, immutable state.
 *
 * @param {string} status
 * @returns {boolean}
 */
const isFinalStatus = (status) => {
  return FINAL_STATUSES.includes(status);
};

/**
 * Checks if an application in a given status can be deleted.
 * Applications in "Interview" or "Offer" cannot be deleted.
 *
 * @param {string} status
 * @returns {boolean}
 */
const canDelete = (status) => {
  return DELETABLE_STATUSES.includes(status) && !NON_DELETABLE_STATUSES.includes(status);
};

module.exports = {
  ALLOWED_TRANSITIONS,
  ACTIVE_STATUSES,
  FINAL_STATUSES,
  DELETABLE_STATUSES,
  NON_DELETABLE_STATUSES,
  canTransition,
  isFinalStatus,
  canDelete
};
