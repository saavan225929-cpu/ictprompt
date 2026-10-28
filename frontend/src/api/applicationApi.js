import axios from 'axios';

// Configure Axios instance using the Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

/**
 * Helper to extract human-readable error messages from API responses
 */
export const extractErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.request) {
    return 'Unable to connect to the backend server. Please verify the backend is running.';
  }
  return error.message || 'An unexpected error occurred.';
};

/**
 * Fetch all applications with optional backend search and status filters
 */
export const fetchApplications = async ({ status = '', search = '' } = {}) => {
  const params = {};
  if (status && status !== 'All') {
    params.status = status;
  }
  if (search && search.trim() !== '') {
    params.search = search.trim();
  }

  const response = await apiClient.get('/applications', { params });
  return response.data;
};

/**
 * Fetch a single application by its MongoDB _id or custom applicationId
 */
export const fetchApplicationById = async (id) => {
  const response = await apiClient.get(`/applications/${id}`);
  return response.data;
};

/**
 * Submit a new job application
 */
export const createApplication = async (applicationData) => {
  const response = await apiClient.post('/applications', applicationData);
  return response.data;
};

/**
 * Update editable fields of an existing application
 */
export const updateApplication = async (id, applicationData) => {
  const response = await apiClient.put(`/applications/${id}`, applicationData);
  return response.data;
};

/**
 * Update application status through the workflow transition engine
 */
export const updateApplicationStatus = async (id, newStatus) => {
  const response = await apiClient.patch(`/applications/${id}/status`, { status: newStatus });
  return response.data;
};

/**
 * Delete an application (only allowed if status is Applied, Rejected, Accepted, or Declined)
 */
export const deleteApplication = async (id) => {
  const response = await apiClient.delete(`/applications/${id}`);
  return response.data;
};

export default apiClient;
