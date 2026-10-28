import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchApplicationById,
  updateApplication,
  extractErrorMessage
} from '../api/applicationApi';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/formatters';

const EditApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Original application object (for read-only fields)
  const [originalApp, setOriginalApp] = useState(null);

  // Editable form fields
  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    jobType: 'Full-time',
    expectedSalary: '',
    notes: ''
  });

  // Load existing application data
  const loadApplication = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApplicationById(id);
      if (res.success && res.data) {
        const app = res.data;
        setOriginalApp(app);
        setFormData({
          companyName: app.companyName || '',
          jobRole: app.jobRole || '',
          jobType: app.jobType || 'Full-time',
          expectedSalary: app.expectedSalary || '',
          notes: app.notes || ''
        });
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name cannot be empty';
    }
    if (!formData.jobRole.trim()) {
      errors.jobRole = 'Job role cannot be empty';
    }
    if (!formData.jobType) {
      errors.jobType = 'Job type must be selected';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updateApplication(id, {
        companyName: formData.companyName.trim(),
        jobRole: formData.jobRole.trim(),
        jobType: formData.jobType,
        expectedSalary: formData.expectedSalary.trim(),
        notes: formData.notes.trim()
      });

      if (res.success) {
        navigate(`/applications/${id}`, {
          state: { message: 'Application details updated successfully!' }
        });
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-page">
        <LoadingSpinner text="Loading application data..." />
      </div>
    );
  }

  if (!originalApp && !loading) {
    return (
      <div className="form-page">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">Application Not Found</h3>
          <p className="empty-desc">Cannot edit an application that does not exist.</p>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <Link to={`/applications/${id}`} className="back-link">
            ← Back to Application Details
          </Link>
          <div className="edit-title-row">
            <h2 className="form-title">Edit Application</h2>
            <span className="badge-locked">ID: {originalApp.applicationId}</span>
          </div>
          <p className="form-subtitle">
            Update company, role, type, salary, or notes. Read-only fields are protected per system rules.
          </p>
        </div>

        {serverError && (
          <div className="alert-box alert-error">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">
              <strong>Update Failed:</strong> {serverError}
            </div>
          </div>
        )}

        {/* Read-Only Information Summary Box */}
        <div className="readonly-notice-card">
          <h4 className="readonly-heading">Protected System Fields (Read-Only)</h4>
          <div className="readonly-grid">
            <div className="readonly-item">
              <span className="readonly-label">Application ID</span>
              <span className="readonly-value font-mono">{originalApp.applicationId}</span>
            </div>
            <div className="readonly-item">
              <span className="readonly-label">Applied Date</span>
              <span className="readonly-value">{formatDate(originalApp.appliedDate)}</span>
            </div>
            <div className="readonly-item">
              <span className="readonly-label">Current Status</span>
              <div className="mt-1">
                <StatusBadge status={originalApp.status} size="small" />
              </div>
            </div>
            <div className="readonly-item">
              <span className="readonly-label">Follow-up Date</span>
              <span className="readonly-value">{formatDate(originalApp.followUpDate)}</span>
            </div>
          </div>
          <p className="readonly-tip">
            💡 To change the status, use the status transition workflow on the application details page.
          </p>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Company Name */}
          <div className="form-group">
            <label htmlFor="companyName" className="form-label required">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              className={`form-input ${fieldErrors.companyName ? 'input-error' : ''}`}
              value={formData.companyName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.companyName && (
              <span className="field-error-text">{fieldErrors.companyName}</span>
            )}
          </div>

          {/* Job Role */}
          <div className="form-group">
            <label htmlFor="jobRole" className="form-label required">
              Job Role
            </label>
            <input
              type="text"
              id="jobRole"
              name="jobRole"
              className={`form-input ${fieldErrors.jobRole ? 'input-error' : ''}`}
              value={formData.jobRole}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {fieldErrors.jobRole && (
              <span className="field-error-text">{fieldErrors.jobRole}</span>
            )}
          </div>

          {/* Job Type & Expected Salary */}
          <div className="form-row">
            <div className="form-group col-half">
              <label htmlFor="jobType" className="form-label required">
                Job Type
              </label>
              <select
                id="jobType"
                name="jobType"
                className={`form-select ${fieldErrors.jobType ? 'input-error' : ''}`}
                value={formData.jobType}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
              {fieldErrors.jobType && (
                <span className="field-error-text">{fieldErrors.jobType}</span>
              )}
            </div>

            <div className="form-group col-half">
              <label htmlFor="expectedSalary" className="form-label">
                Expected Salary <span className="optional-tag">(Optional)</span>
              </label>
              <input
                type="text"
                id="expectedSalary"
                name="expectedSalary"
                className="form-input"
                placeholder="e.g. $85,000 / yr, 8 LPA"
                value={formData.expectedSalary}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/applications/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditApplication;
