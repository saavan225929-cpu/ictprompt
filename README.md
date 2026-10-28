# Job Application Tracker (MERN Stack)

A full-stack web application designed for students and job seekers to track job applications, manage application lifecycle workflows, monitor follow-up dates, and prevent duplicate submissions.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Folder Structure](#project-folder-structure)
- [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
- [Environment Configuration](#environment-configuration)
- [Installation and Running](#installation-and-running)
- [REST API Reference](#rest-api-reference)
- [Status Workflow Rules](#status-workflow-rules)
- [Business Logic & Validation Rules](#business-logic--validation-rules)
- [Screenshots & UI Showcase](#screenshots--ui-showcase)
- [Viva & Technical Discussion Notes](#viva--technical-discussion-notes)

---

## 🎯 Project Overview

During campus placements and job searches, students frequently submit applications across dozens of job boards and company portals. Managing interview rounds, tracking statuses, and remembering to send follow-up emails becomes difficult without a dedicated system.

**Job Application Tracker** provides a centralized platform that:
1. Enforces structured lifecycle transitions (e.g., `Applied` → `Interview` → `Offer` → `Accepted`).
2. Calculates follow-up deadlines automatically (7 days from application date) and flags overdue actions.
3. Automatically generates customized Application IDs (e.g., `JA-INF-001`, `JA-GOO-001`).
4. Prevents duplicate active applications for the same company and role.
5. Keeps an immutable chronological audit trail of all status transitions.

---

## ✨ Key Features

- **Automated Custom Application IDs**: Format `JA-<FIRST 3 COMPANY LETTERS>-<3 DIGIT SEQUENCE>`, auto-incremented independently per company.
- **Strict Status Workflow Engine**: Transitions are strictly enforced on the backend. Final states (`Accepted`, `Declined`, `Rejected`) cannot be modified.
- **Status Audit History**: Visual timeline showing every stage change with accurate date and time stamps.
- **Automated Follow-up Calculation**: Follow-up date is automatically computed (`appliedDate + 7 days`). When an application remains in `Applied` status beyond this date, a red **Follow-up Overdue** badge is displayed.
- **Duplicate Prevention Rule**: Active applications (`Applied`, `Interview`, `Offer`) with identical company and job role combinations are rejected with HTTP 409 Conflict (case-insensitive).
- **Backend Search and Filtering**: Query parameters (`?status=...&search=...`) are processed on the server with database-level regex and aggregation counts.
- **Protected Editing & Deletion Rules**:
  - Application ID, Applied Date, Follow-up Date, and Status History cannot be altered via the edit form.
  - Applications in active candidate evaluation (`Interview`, `Offer`) cannot be deleted.
- **Responsive UI & Clean Feedback**: Built with pure modern CSS, loading indicators, deletion confirmation modals, and user-friendly error banners.

---

## 💻 Technology Stack

### Frontend
- **React.js 18** (Modern functional components & hooks)
- **Vite** (Next-generation lightning-fast build tool)
- **React Router DOM v6** (Client-side routing)
- **Axios** (Promise-based HTTP client)
- **Custom Plain CSS** (Responsive design, custom properties, modern cards, and badges)

### Backend
- **Node.js** (JavaScript runtime)
- **Express.js** (REST API framework)
- **MongoDB Atlas & Mongoose** (Cloud NoSQL database and schema modeling)
- **cors** (Cross-Origin Resource Sharing)
- **dotenv** (Environment variable management)
- **nodemon** (Development auto-reload)

---

## 📂 Project Folder Structure

```
job-application-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                       # Mongoose Atlas connection logic
│   ├── controllers/
│   │   └── applicationController.js    # Business logic & request handling
│   ├── middleware/
│   │   └── errorHandler.js             # 404 handler and global error middleware
│   ├── models/
│   │   └── Application.js              # Mongoose schema, validation & virtuals
│   ├── routes/
│   │   └── applicationRoutes.js        # RESTful API route definitions
│   ├── utils/
│   │   ├── idGenerator.js              # Custom sequential ID generator
│   │   └── workflowConstants.js        # State transition rules & definitions
│   ├── .env                            # Backend environment configuration
│   ├── .env.example                    # Template for environment variables
│   ├── package.json                    # Backend dependencies & scripts
│   └── server.js                       # Express app entry point
├── frontend/
│   ├── public/
│   │   └── favicon.svg                 # Application favicon
│   ├── src/
│   │   ├── api/
│   │   │   └── applicationApi.js       # Centralized Axios API services
│   │   ├── components/
│   │   │   ├── ApplicationCard.jsx     # Card component for dashboard view
│   │   │   ├── ConfirmModal.jsx        # Deletion confirmation modal
│   │   │   ├── LoadingSpinner.jsx      # Animated loader
│   │   │   ├── Navbar.jsx              # Responsive header navigation
│   │   │   ├── StatsSummary.jsx        # Clickable status metrics cards
│   │   │   ├── StatusBadge.jsx         # Colored status & overdue badges
│   │   │   └── ToastAlert.jsx          # Notification alert banner
│   │   ├── pages/
│   │   │   ├── AddApplication.jsx      # Form to create new application
│   │   │   ├── ApplicationDetails.jsx  # Details, history timeline & status updater
│   │   │   ├── EditApplication.jsx     # Form to modify editable fields
│   │   │   ├── Dashboard.jsx           # Main dashboard with search/filters
│   │   │   └── NotFound.jsx            # 404 page
│   │   ├── utils/
│   │   │   └── formatters.js           # Date formatting and status helpers
│   │   ├── App.css                     # Primary UI stylesheet
│   │   ├── App.jsx                     # Route declarations and layout
│   │   ├── index.css                   # Global reset and CSS variables
│   │   └── main.jsx                    # React DOM entry point
│   ├── .env                            # Frontend environment variables
│   ├── .env.example                    # Template for frontend environment
│   ├── index.html                      # HTML5 template
│   ├── package.json                    # Frontend dependencies & scripts
│   └── vite.config.js                  # Vite configuration
├── .gitignore
└── README.md
```

---

## ☁️ MongoDB Atlas Setup Guide

To connect to your cloud database in MongoDB Atlas:

1. **Sign in / Register**: Navigate to [mongodb.com/atlas](https://www.mongodb.com/atlas) and log in.
2. **Create a Free Cluster**: Select the free **M0 Sandbox** shared tier.
3. **Database User Credentials**:
   - Go to **Security** → **Database Access**.
   - Click **Add New Database User**.
   - Create a username and password (e.g., `dbUser` and `securePassword123`).
4. **Network Access / IP Whitelist**:
   - Go to **Security** → **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. **Get Connection String**:
   - Go to **Deployments** → **Database** → Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/job_application_tracker?retryWrites=true&w=majority
     ```
6. **Paste into `backend/.env`**:
   Replace `<username>` and `<password>` with your database user credentials.

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/job_application_tracker?retryWrites=true&w=majority
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation and Running

### Prerequisites
- Node.js (version 18 or higher)
- npm or pnpm

### Step 1: Open in VS Code
Open the `job-application-tracker` folder in VS Code.

### Step 2: Backend Setup
Open a terminal in the root or `backend` folder:
```bash
cd backend
npm install
npm run dev
```
> The backend server will start on `http://localhost:5000` with nodemon auto-restart enabled.

### Step 3: Frontend Setup
Open a second terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
> Vite will start the frontend development server on `http://localhost:5173`. Open this URL in your web browser.

---

## 📡 REST API Reference

All responses follow a consistent standardized JSON structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "An active application already exists for this company and job role",
  "data": null
}
```

### Endpoints Table

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/applications` | Create a new job application | `201`, `400`, `409` |
| `GET` | `/api/applications` | Get all applications with search/status filters & counts | `200` |
| `GET` | `/api/applications/:id` | Get details of a single application by ID or custom ID | `200`, `404` |
| `PUT` | `/api/applications/:id` | Update editable fields of an application | `200`, `400`, `404`, `409` |
| `PATCH` | `/api/applications/:id/status` | Advance application status via workflow engine | `200`, `400`, `404` |
| `DELETE` | `/api/applications/:id` | Delete application (Blocked if in Interview or Offer) | `200`, `400`, `404` |
| `GET` | `/api/health` | Service health status | `200` |

### Query Parameters for `GET /api/applications`:
- `?status=Applied` (Filters by status: `Applied`, `Interview`, `Offer`, `Accepted`, `Declined`, `Rejected`)
- `?search=google` (Performs case-insensitive company name search on the backend)

---

## 🔄 Status Workflow Rules

The application enforces a deterministic finite state machine (FSM):

```
                  ┌──────────────┐
                  │   Applied    │
                  └──────┬───────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
    ┌──────────────┐            ┌──────────────┐
    │  Interview   │            │   Rejected   │ (Final)
    └──────┬───────┘            └──────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌──────────┐ ┌──────────┐
│  Offer   │ │ Rejected │ (Final)
└────┬─────┘ └──────────┘
     │
 ┌───┴───┐
 ▼       ▼
┌────────┐ ┌──────────┐
│Accepted│ │ Declined │ (Both Final)
└────────┘ └──────────┘
```

- **Allowed transitions**:
  - `Applied` → `Interview` or `Rejected`
  - `Interview` → `Offer` or `Rejected`
  - `Offer` → `Accepted` or `Declined`
- **Final states**: `Accepted`, `Declined`, `Rejected`. Once reached, no further transitions are permitted.
- The UI dynamically computes allowed next options and disables invalid buttons.
- The backend independently validates transitions and returns HTTP 400 if an illegal step is attempted.

---

## 🛡️ Business Logic & Validation Rules

1. **Applied Date Validation**:
   - `appliedDate` cannot be in the future.
   - Enforced client-side (max date picker attribute and validation function) and server-side.
2. **Sequential Custom Application ID**:
   - Format: `JA-<3 LETTERS>-<3 DIGITS>`.
   - Sequence increments per company (e.g., `JA-INF-001`, `JA-INF-002`, `JA-GOO-001`).
   - Generated purely on the backend with duplicate-safe incrementation.
3. **Follow-up Date Calculation**:
   - Automatically computed as `appliedDate + 7 days`.
   - If `status === 'Applied'` AND `current date > followUpDate`, `isOverdue` evaluates to `true`.
   - An eye-catching red **Follow-up Overdue** badge is shown.
4. **Duplicate Active Application Rule**:
   - A candidate cannot have multiple simultaneous active applications (`Applied`, `Interview`, `Offer`) for the same Company + Job Role combination.
   - Case-insensitive comparison (`"Google" + "Software Engineer"` == `"google" + "software engineer"`).
   - Rejections return HTTP 409 Conflict with an informative message.
5. **Deletion Rules**:
   - Allowed only when status is `Applied`, `Rejected`, `Accepted`, or `Declined`.
   - Forbidden when status is `Interview` or `Offer`. Deletion button is disabled on the frontend and blocked with HTTP 400 on the backend.
   - Requires user confirmation via modal before executing.

---

## 📸 Screenshots & UI Showcase

> *Instructions: After running the application, capture screenshots of the screens below and place the images in an `assets/` or `screenshots/` directory, updating the paths below.*

### 1. Dashboard & Status Summary Cards
> *Screenshot placeholder: Displays the status summary metrics, search bar, status dropdown filter, and application cards with status badges and overdue flags.*
```
[ PLACEHOLDER: Add screenshot of Dashboard (e.g. ./screenshots/01-dashboard.png) ]
```

### 2. Add New Application Form
> *Screenshot placeholder: Shows form fields with client-side validation, today's date picker limit, and duplicate detection alert.*
```
[ PLACEHOLDER: Add screenshot of Add Application Form (e.g. ./screenshots/02-add-application.png) ]
```

### 3. Application Details & Audit Timeline
> *Screenshot placeholder: Highlights the full application data, 7-day follow-up overdue warning banner, workflow transition dropdown, and chronological status history.*
```
[ PLACEHOLDER: Add screenshot of Details & Timeline (e.g. ./screenshots/03-application-details.png) ]
```

### 4. Edit Application Page
> *Screenshot placeholder: Displays pre-filled fields for company, role, type, salary, and notes, while highlighting protected read-only system fields (ID, Applied Date, Status).*
```
[ PLACEHOLDER: Add screenshot of Edit Page (e.g. ./screenshots/04-edit-application.png) ]
```

### 5. Delete Confirmation Modal
> *Screenshot placeholder: Demonstrates the deletion confirmation modal with application details and safety warnings.*
```
[ PLACEHOLDER: Add screenshot of Delete Modal (e.g. ./screenshots/05-delete-modal.png) ]
```

---

## 🎓 Viva & Technical Discussion Notes

During a viva examination, be prepared to answer questions on the following architectural choices:

1. **Why validate business rules on both Frontend and Backend?**
   - Frontend validation gives instant feedback and improves user experience.
   - Backend validation is essential for security and data integrity because malicious actors can bypass the UI and make direct HTTP requests (e.g., using Postman or curl).
2. **How is the sequential Application ID generated safely?**
   - The backend extracts the first 3 letters of the company name, searches the database for all existing IDs matching `JA-<CODE>-<SEQ>`, finds the highest sequence number, increments it, and runs a conflict verification check before saving.
3. **How does the duplicate application prevention work?**
   - When a user submits an application, the backend searches for existing applications with the same company and job role (using case-insensitive regex `^name$`) whose status is in the active set `['Applied', 'Interview', 'Offer']`. If a match is found, an HTTP 409 Conflict error is returned.
4. **How are status counts calculated efficiently?**
   - The backend uses MongoDB's aggregation pipeline (`$group` on `status` with `$sum: 1`) to calculate counts directly in the database engine in a single query rather than transferring all documents to Node.js memory.
5. **How does the Status History work?**
   - The `Application` model contains an embedded array of subdocuments `statusHistory`. Whenever a status transition occurs, the new status and current timestamp are pushed to this array, providing a complete chronological audit trail.

---

## 📄 License
This project was created for educational purposes as an academic assessment.
