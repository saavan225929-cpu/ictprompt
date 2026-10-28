import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  fetchApplicationById,
  updateApplicationStatus,
  deleteApplication,
  extractErrorMessage
} from '../api/applicationApi';
import StatusBadge, { OverdueBadge } from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import ToastAlert from '../components/ToastAlert';
import {
  formatDate,
  formatDateTime,
  getNextAllowedStatuses,
  isDeletable
} from '../utils/formatters';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Handle flash messages from navigation (e.g., after editing)
  useEffect(() => {
    if (location.state && location.state.message) {
      setToast({ type: 'success', message: location.state.message });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Status transition state
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load application details
  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApplicationById(id);
      if (res.success && res.data) {
        setApplication(res.data);
        setSelectedNextStatus('');
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setToast({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  // Handle status update submission
  const handleStatusChangeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNextStatus) {
      setStatusError('Please select a valid next status from the options');
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setStatusError('');
      const res = await updateApplicationStatus(application._id, selectedNextStatus);

      if (res.success && res.data) {
        setApplication(res.data);
        setSelectedNextStatus('');
        setToast({
          type: 'success',
          message: `Application status transitioned to '${res.data.status}' successfully.`
        });
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setStatusError(errorMsg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle deletion
  const handleConfirmDelete = async () => {
    try {
      setShowDeleteModal(false);
      const res = await deleteApplication(application._id);
      if (res.success) {
        navigate('/', {
          state: { message: `Application ${application.applicationId} was deleted successfully.` }
        });
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setToast({ type: 'error', message: errorMsg });
    }
  };

  if (loading) {
    return (
      <div className="details-page">
        <LoadingSpinner text="Loading application details..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="details-page">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">Application Not Found</h3>
          <p className="empty-desc">
            We could not find the application you were looking for. It may have been deleted or the link is incorrect.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const allowedNextOptions = getNextAllowedStatuses(application.status);
  const canDeleteApplication = isDeletable(application.status);
  const isFinal = allowedNextOptions.length === 0;

  return (
    <div className="details-page">
      {/* Toast Alert */}
      {toast.message && (
        <ToastAlert
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Top Navigation & Actions Bar */}
      <div className="details-top-bar">
        <Link to="/" className="back-link">
          ← Back to Dashboard
        </Link>
        <div className="details-action-buttons">
          <Link
            to={`/applications/${application._id}/edit`}
            className="btn btn-secondary btn-sm"
          >
            Edit Application
          </Link>
          <button
            type="button"
            className={`btn btn-danger-outline btn-sm ${!canDeleteApplication ? 'disabled' : ''}`}
            disabled={!canDeleteApplication}
            onClick={() => canDeleteApplication && setShowDeleteModal(true)}
            title={
              canDeleteApplication
                ? 'Delete this application'
                : `Applications in '${application.status}' stage cannot be deleted`
            }
          >
            Delete Application
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="details-card">
        {/* Header Section */}
        <div className="details-header">
          <div className="details-heading">
            <div className="details-id-row">
              <span className="details-id-badge">{application.applicationId}</span>
              <span className="job-type-pill">{application.jobType}</span>
            </div>
            <h1 className="details-company">{application.companyName}</h1>
            <h2 className="details-role">{application.jobRole}</h2>
          </div>
          <div className="details-status-box">
            <span className="status-label">Current Status:</span>
            <StatusBadge status={application.status} size="large" />
            {application.isOverdue && (
              <div className="mt-2">
                <OverdueBadge size="medium" />
              </div>
            )}
          </div>
        </div>

        {/* Overdue Warning Alert Box */}
        {application.isOverdue && (
          <div className="alert-box alert-warning">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">
              <strong>Follow-up Overdue:</strong> The 7-day follow-up window for this application passed on{' '}
              {formatDate(application.followUpDate)}. It is recommended to send a follow-up email or check the recruiter portal.
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Applied Date</span>
            <span className="detail-value">{formatDate(application.appliedDate)}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Calculated Follow-up Date</span>
            <span className={`detail-value ${application.isOverdue ? 'text-danger font-semibold' : ''}`}>
              {formatDate(application.followUpDate)}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Expected Salary</span>
            <span className="detail-value">{application.expectedSalary || 'Not specified'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Created At</span>
            <span className="detail-value">{formatDateTime(application.createdAt)}</span>
          </div>
        </div>

        {/* Notes Block */}
        <div className="details-notes-section">
          <h4 className="section-title">Application Notes</h4>
          {application.notes ? (
            <div className="notes-box">{application.notes}</div>
          ) : (
            <p className="empty-notes">No notes provided for this application.</p>
          )}
        </div>
      </div>

      {/* Two Column Layout: Status Transition Controller & Status History Timeline */}
      <div className="details-columns">
        {/* Left: Status Workflow Action Controller */}
        <div className="workflow-card">
          <h3 className="card-heading">
            <span className="heading-icon">🔄</span>
            Status Workflow Transition
          </h3>
          <p className="card-subheading">
            Update application status following allowed lifecycle rules.
          </p>

          {statusError && (
            <div className="alert-box alert-error mb-3">
              <span className="alert-icon">⚠️</span>
              <div className="alert-text">{statusError}</div>
            </div>
          )}

          {isFinal ? (
            <div className="final-status-box">
              <div className="final-icon">✓</div>
              <h4 className="final-title">Final State Reached</h4>
              <p className="final-message">
                This application is marked as <strong>{application.status}</strong>. Final statuses cannot be changed further.
              </p>
            </div>
          ) : (
            <form onSubmit={handleStatusChangeSubmit} className="status-update-form">
              <label htmlFor="nextStatus" className="form-label">
                Select Next Valid Status:
              </label>
              <div className="status-select-group">
                <select
                  id="nextStatus"
                  className="form-select"
                  value={selectedNextStatus}
                  onChange={(e) => {
                    setSelectedNextStatus(e.target.value);
                    setStatusError('');
                  }}
                  disabled={isUpdatingStatus}
                >
                  <option value="">-- Choose next status --</option>
                  {allowedNextOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      Transition to: {opt}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedNextStatus || isUpdatingStatus}
                >
                  {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>

              <div className="workflow-helper">
                <span className="helper-label">Allowed from {application.status}:</span>
                <span className="helper-options">
                  {allowedNextOptions.join(', ')}
                </span>
              </div>
            </form>
          )}

          {!canDeleteApplication && (
            <div className="delete-restriction-notice">
              <span className="restriction-icon">ℹ️</span>
              <span>
                Applications in <strong>{application.status}</strong> stage cannot be deleted according to workflow rules.
              </span>
            </div>
          )}
        </div>

        {/* Right: Status History Timeline */}
        <div className="timeline-card">
          <h3 className="card-heading">
            <span className="heading-icon">⏱️</span>
            Status History Timeline
          </h3>
          <p className="card-subheading">
            Complete audit trail of all status transitions for this role.
          </p>

          <div className="timeline-container">
            {application.statusHistory && application.statusHistory.length > 0 ? (
              <ul className="timeline-list">
                {application.statusHistory.map((item, index) => (
                  <li key={index} className="timeline-item">
                    <div className="timeline-marker">
                      <div className="marker-dot"></div>
                      {index < application.statusHistory.length - 1 && (
                        <div className="marker-line"></div>
                      )}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-badge-row">
                        <StatusBadge status={item.status} size="small" />
                        <span className="timeline-step">Step {index + 1}</span>
                      </div>
                      <span className="timeline-time">
                        {formatDateTime(item.changedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-desc">No history records found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Job Application"
        message="Are you sure you want to permanently delete this application?"
        itemDetails={{
          title: `${application.companyName} — ${application.jobRole}`,
          subtitle: `Application ID: ${application.applicationId}`,
          badge: application.status
        }}
        confirmText="Confirm Delete"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default ApplicationDetails;
