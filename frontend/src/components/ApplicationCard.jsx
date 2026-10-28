import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge, { OverdueBadge } from './StatusBadge';
import { formatDate, isDeletable } from '../utils/formatters';

const ApplicationCard = ({ application, onDeleteRequest }) => {
  const canDeleteApplication = isDeletable(application.status);

  return (
    <div className={`application-card ${application.isOverdue ? 'has-overdue' : ''}`}>
      <div className="card-top-row">
        <div className="card-id-badge">
          <span className="id-code">{application.applicationId}</span>
          <span className="job-type-pill">{application.jobType}</span>
        </div>
        <div className="card-status-wrapper">
          <StatusBadge status={application.status} />
          {application.isOverdue && <OverdueBadge size="small" />}
        </div>
      </div>

      <div className="card-main-content">
        <h3 className="card-company">{application.companyName}</h3>
        <p className="card-role">{application.jobRole}</p>
      </div>

      <div className="card-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Applied Date</span>
          <span className="meta-value">{formatDate(application.appliedDate)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Follow-up Date</span>
          <span className={`meta-value ${application.isOverdue ? 'text-danger font-semibold' : ''}`}>
            {formatDate(application.followUpDate)}
          </span>
        </div>
        {application.expectedSalary && (
          <div className="meta-item meta-salary">
            <span className="meta-label">Expected Salary</span>
            <span className="meta-value">{application.expectedSalary}</span>
          </div>
        )}
      </div>

      {application.notes && (
        <div className="card-snippet">
          <span className="snippet-icon">📝</span>
          <p className="snippet-text">{application.notes}</p>
        </div>
      )}

      <div className="card-footer">
        <Link
          to={`/applications/${application._id}`}
          className="btn btn-secondary btn-sm"
        >
          View Details
        </Link>
        <div className="card-actions-right">
          <Link
            to={`/applications/${application._id}/edit`}
            className="btn btn-ghost btn-sm"
            title="Edit Application"
          >
            Edit
          </Link>
          <button
            type="button"
            className={`btn btn-danger-outline btn-sm ${!canDeleteApplication ? 'disabled' : ''}`}
            disabled={!canDeleteApplication}
            onClick={() => canDeleteApplication && onDeleteRequest(application)}
            title={
              canDeleteApplication
                ? 'Delete Application'
                : `Cannot delete applications in '${application.status}' stage`
            }
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
