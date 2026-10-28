import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { fetchApplications, deleteApplication, extractErrorMessage } from '../api/applicationApi';
import ApplicationCard from '../components/ApplicationCard';
import StatsSummary from '../components/StatsSummary';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import ToastAlert from '../components/ToastAlert';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL query params synced with backend filtering
  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [applications, setApplications] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Handle flash messages passed via router navigation state
  useEffect(() => {
    if (location.state && location.state.message) {
      setToast({ type: 'success', message: location.state.message });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    application: null
  });

  // Load applications from backend
  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApplications({
        status: currentStatus,
        search: currentSearch
      });

      if (res.success && res.data) {
        setApplications(res.data.applications || []);
        setStatusCounts(res.data.counts || {});
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setToast({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  }, [currentStatus, currentSearch]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Keep searchInput in sync if URL param changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Handle company search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  // Handle status filter selection
  const handleStatusFilterChange = (statusKey) => {
    const params = new URLSearchParams(searchParams);
    if (statusKey && statusKey !== 'All') {
      params.set('status', statusKey);
    } else {
      params.delete('status');
    }
    setSearchParams(params);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (app) => {
    setDeleteModal({
      isOpen: true,
      application: app
    });
  };

  // Execute deletion after user confirms
  const handleConfirmDelete = async () => {
    const appToDelete = deleteModal.application;
    if (!appToDelete) return;

    try {
      setDeleteModal({ isOpen: false, application: null });
      const res = await deleteApplication(appToDelete._id);
      if (res.success) {
        setToast({
          type: 'success',
          message: `Application ${appToDelete.applicationId} was deleted successfully.`
        });
        // Reload list to refresh counts and applications
        loadApplications();
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setToast({ type: 'error', message: errorMsg });
    }
  };

  return (
    <div className="dashboard-page">
      {/* Toast Notification */}
      {toast.message && (
        <ToastAlert
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Top Welcome & Add Banner */}
      <section className="dashboard-hero">
        <div className="hero-text">
          <h1 className="hero-title">Job Applications</h1>
          <p className="hero-desc">
            Track interview workflows, monitor follow-ups, and organize your career search.
          </p>
        </div>
        <div className="hero-actions">
          <Link to="/add" className="btn btn-primary">
            <span className="btn-icon">+</span>
            <span>New Application</span>
          </Link>
        </div>
      </section>

      {/* Backend Status Counts Summary Grid */}
      <section className="stats-section">
        <StatsSummary
          counts={statusCounts}
          selectedStatus={currentStatus}
          onSelectStatus={handleStatusFilterChange}
        />
      </section>

      {/* Backend Search & Status Filter Controls */}
      <section className="filter-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by company name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <div className="filter-controls">
          <label htmlFor="status-select" className="filter-label">Status:</label>
          <select
            id="status-select"
            className="filter-select"
            value={currentStatus || 'All'}
            onChange={(e) => handleStatusFilterChange(e.target.value === 'All' ? '' : e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
            <option value="Rejected">Rejected</option>
          </select>

          {(currentStatus || currentSearch) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* Main Content: Applications List or States */}
      <section className="applications-container">
        {loading ? (
          <LoadingSpinner text="Fetching applications from server..." />
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3 className="empty-title">No applications found</h3>
            <p className="empty-desc">
              {currentStatus || currentSearch
                ? 'No applications match your active search or filter criteria. Try clearing filters.'
                : 'You have not added any job applications yet. Click below to add your first one!'}
            </p>
            {currentStatus || currentSearch ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClearFilters}
              >
                Reset Filters
              </button>
            ) : (
              <Link to="/add" className="btn btn-primary">
                Add Your First Application
              </Link>
            )}
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map((app) => (
              <ApplicationCard
                key={app._id}
                application={app}
                onDeleteRequest={handleOpenDeleteModal}
              />
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Job Application"
        message="Are you sure you want to delete this job application? This action cannot be reversed."
        itemDetails={
          deleteModal.application
            ? {
                title: `${deleteModal.application.companyName} — ${deleteModal.application.jobRole}`,
                subtitle: `Application ID: ${deleteModal.application.applicationId}`,
                badge: deleteModal.application.status
              }
            : null
        }
        confirmText="Confirm Delete"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, application: null })}
      />
    </div>
  );
};

export default Dashboard;
