const mongoose = require('mongoose');
const Application = require('../models/Application');
const { generateApplicationId } = require('../utils/idGenerator');
const {
  ALLOWED_TRANSITIONS,
  ACTIVE_STATUSES,
  isFinalStatus,
  canTransition,
  canDelete
} = require('../utils/workflowConstants');

/**
 * Escapes characters for safe regular expression matching
 */
const escapeRegex = (str = '') => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Helper to find an application by either its MongoDB _id or custom applicationId
 */
const findApplicationByIdOrCustomId = async (idParam) => {
  if (mongoose.isValidObjectId(idParam)) {
    const foundById = await Application.findById(idParam);
    if (foundById) return foundById;
  }
  return await Application.findOne({ applicationId: idParam.toUpperCase() });
};

/**
 * @desc    Create a new job application
 * @route   POST /api/applications
 * @access  Public
 */
const createApplication = async (req, res, next) => {
  try {
    const { companyName, jobRole, jobType, appliedDate, expectedSalary, notes } = req.body;

    // 1. Basic field presence validation
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company Name is required',
        data: null
      });
    }

    if (!jobRole || !jobRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job Role is required',
        data: null
      });
    }

    const validJobTypes = ['Full-time', 'Internship', 'Contract'];
    if (!jobType || !validJobTypes.includes(jobType)) {
      return res.status(400).json({
        success: false,
        message: 'Job Type must be Full-time, Internship, or Contract',
        data: null
      });
    }

    if (!appliedDate) {
      return res.status(400).json({
        success: false,
        message: 'Applied Date is required',
        data: null
      });
    }

    // 2. Validate Applied Date cannot be in the future
    const parsedAppliedDate = new Date(appliedDate);
    if (isNaN(parsedAppliedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Applied Date is invalid',
        data: null
      });
    }

    const now = new Date();
    // Compare against the end of current day to allow any time today
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (parsedAppliedDate > endOfToday) {
      return res.status(400).json({
        success: false,
        message: 'Applied Date cannot be in the future',
        data: null
      });
    }

    // 3. Duplicate application check:
    // A user cannot create another application with same Company + Job Role when an earlier application is still active.
    // Case-insensitive comparison.
    const trimmedCompany = companyName.trim();
    const trimmedRole = jobRole.trim();

    const existingActive = await Application.findOne({
      companyName: { $regex: new RegExp(`^${escapeRegex(trimmedCompany)}$`, 'i') },
      jobRole: { $regex: new RegExp(`^${escapeRegex(trimmedRole)}$`, 'i') },
      status: { $in: ACTIVE_STATUSES }
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: `An active application already exists for "${trimmedCompany}" as "${trimmedRole}" (Application ID: ${existingActive.applicationId}, Status: ${existingActive.status}).`,
        data: null
      });
    }

    // 4. Follow-up date calculation: appliedDate + 7 days
    const calculatedFollowUpDate = new Date(parsedAppliedDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 5. Generate unique Application ID on the backend
    const applicationId = await generateApplicationId(trimmedCompany);

    // 6. Assemble the application record (initial status always Applied, initial history entry)
    const newApplication = new Application({
      applicationId,
      companyName: trimmedCompany,
      jobRole: trimmedRole,
      jobType,
      appliedDate: parsedAppliedDate,
      expectedSalary: expectedSalary ? String(expectedSalary).trim() : '',
      notes: notes ? String(notes).trim() : '',
      status: 'Applied',
      followUpDate: calculatedFollowUpDate,
      statusHistory: [
        {
          status: 'Applied',
          changedAt: new Date()
        }
      ]
    });

    const savedApp = await newApplication.save();

    return res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: savedApp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications with backend filtering, search, and status counts
 * @route   GET /api/applications
 * @access  Public
 */
const getApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    // Filter by status if provided and not "All"
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Filter by company name (case-insensitive search)
    if (search && search.trim() !== '') {
      filter.companyName = {
        $regex: escapeRegex(search.trim()),
        $options: 'i'
      };
    }

    // Fetch filtered applications sorted newest first
    const applications = await Application.find(filter).sort({ createdAt: -1 });

    // Calculate global counts across all statuses
    const statusCountsAgg = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      total: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Accepted: 0,
      Declined: 0,
      Rejected: 0
    };

    statusCountsAgg.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(counts, item._id)) {
        counts[item._id] = item.count;
      }
      counts.total += item.count;
    });

    return res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: {
        applications,
        counts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application by ID
 * @route   GET /api/applications/:id
 * @access  Public
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await findApplicationByIdOrCustomId(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application retrieved successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application editable fields (Company, Role, Type, Salary, Notes)
 *          Does NOT allow editing ID, Applied Date, Status, Follow-up Date, or History.
 * @route   PUT /api/applications/:id
 * @access  Public
 */
const updateApplication = async (req, res, next) => {
  try {
    const application = await findApplicationByIdOrCustomId(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        data: null
      });
    }

    const { companyName, jobRole, jobType, expectedSalary, notes } = req.body;

    // Validation
    if (companyName !== undefined && !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company Name cannot be empty',
        data: null
      });
    }

    if (jobRole !== undefined && !jobRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job Role cannot be empty',
        data: null
      });
    }

    if (jobType !== undefined) {
      const validJobTypes = ['Full-time', 'Internship', 'Contract'];
      if (!validJobTypes.includes(jobType)) {
        return res.status(400).json({
          success: false,
          message: 'Job Type must be Full-time, Internship, or Contract',
          data: null
        });
      }
    }

    const newCompany = companyName !== undefined ? companyName.trim() : application.companyName;
    const newRole = jobRole !== undefined ? jobRole.trim() : application.jobRole;

    // Check duplicate if company or role is being modified while currently in active state
    if (
      ACTIVE_STATUSES.includes(application.status) &&
      (newCompany.toLowerCase() !== application.companyName.toLowerCase() ||
        newRole.toLowerCase() !== application.jobRole.toLowerCase())
    ) {
      const conflictingApp = await Application.findOne({
        _id: { $ne: application._id },
        companyName: { $regex: new RegExp(`^${escapeRegex(newCompany)}$`, 'i') },
        jobRole: { $regex: new RegExp(`^${escapeRegex(newRole)}$`, 'i') },
        status: { $in: ACTIVE_STATUSES }
      });

      if (conflictingApp) {
        return res.status(409).json({
          success: false,
          message: `Another active application already exists for "${newCompany}" as "${newRole}".`,
          data: null
        });
      }
    }

    // Apply allowed updates only
    if (companyName !== undefined) application.companyName = newCompany;
    if (jobRole !== undefined) application.jobRole = newRole;
    if (jobType !== undefined) application.jobType = jobType;
    if (expectedSalary !== undefined) application.expectedSalary = String(expectedSalary).trim();
    if (notes !== undefined) application.notes = String(notes).trim();

    const updatedApp = await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status according to the status workflow
 * @route   PATCH /api/applications/:id/status
 * @access  Public
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status: targetStatus } = req.body;

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: 'New status is required',
        data: null
      });
    }

    const application = await findApplicationByIdOrCustomId(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        data: null
      });
    }

    const currentStatus = application.status;

    // Check if currently in a final state
    if (isFinalStatus(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status cannot be changed. Application is in a final state ('${currentStatus}').`,
        data: null
      });
    }

    // Check if the requested transition is valid
    if (!canTransition(currentStatus, targetStatus)) {
      const validOptions = ALLOWED_TRANSITIONS[currentStatus] || [];
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed next statuses: ${validOptions.join(', ') || 'None'}.`,
        data: null
      });
    }

    // Transition is valid - update status and record history
    application.status = targetStatus;
    application.statusHistory.push({
      status: targetStatus,
      changedAt: new Date()
    });

    const updatedApp = await application.save();

    return res.status(200).json({
      success: true,
      message: `Status updated to '${targetStatus}' successfully`,
      data: updatedApp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete application (Forbidden if in Interview or Offer stage)
 * @route   DELETE /api/applications/:id
 * @access  Public
 */
const deleteApplication = async (req, res, next) => {
  try {
    const application = await findApplicationByIdOrCustomId(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        data: null
      });
    }

    // Check deletion eligibility rule
    if (!canDelete(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Applications in '${application.status}' stage cannot be deleted. Only applications with status 'Applied', 'Rejected', 'Accepted', or 'Declined' can be deleted.`,
        data: null
      });
    }

    await Application.findByIdAndDelete(application._id);

    return res.status(200).json({
      success: true,
      message: `Application ${application.applicationId} deleted successfully`,
      data: {
        id: application._id,
        applicationId: application.applicationId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
};
