# CampusCare API Documentation

## Overview
This document outlines the RESTful API endpoints for the CampusCare platform. The backend is built using Node.js and Express, connected to a PostgreSQL/Supabase database.

## Base URL
\`\`\`text
http://localhost:5000/api
\`\`\`
*(Replace \`localhost:5000\` with the production URL upon deployment.)*

## Authentication
Most endpoints require a JSON Web Token (JWT) provided in the \`Authorization\` header.
\`\`\`http
Authorization: Bearer <your_jwt_token>
\`\`\`
Role-based access control (RBAC) is implemented across the API, restricting access based on user roles: \`community_member\`, \`worker\`, \`facility_manager\`, and \`admin\`.

---

## 1. System Health
### Check API Status
- **URL**: \`/health\`
- **Method**: \`GET\`
- **Access**: Public
- **Description**: Returns the current operational status, timestamp, and version of the API.
- **Response**: \`200 OK\` (JSON object with success message).

---

## 2. Authentication (\`/auth\`)

### Register New User
- **URL**: \`/auth/register\`
- **Method**: \`POST\`
- **Access**: Public
- **Description**: Registers a new user account.
- **Request Body**:
  - \`name\` (String, Required)
  - \`email\` (String, Required, Valid Email)
  - \`password\` (String, Required, Min 6 characters)
  - \`role\` (Enum: 'community_member', 'facility_manager', 'worker', 'admin')

### Login User
- **URL**: \`/auth/login\`
- **Method**: \`POST\`
- **Access**: Public
- **Description**: Authenticates a user and returns a JWT token along with user details.
- **Request Body**:
  - \`email\` (String, Required)
  - \`password\` (String, Required)

### Logout User
- **URL**: \`/auth/logout\`
- **Method**: \`POST\`
- **Access**: Protected (All authenticated users)
- **Description**: Logs out the current user (client-side token removal, server-side tracking if applicable).

### Get Current User Profile
- **URL**: \`/auth/me\`
- **Method**: \`GET\`
- **Access**: Protected (All authenticated users)
- **Description**: Retrieves the profile data of the currently authenticated user.

### Update Profile
- **URL**: \`/auth/profile\`
- **Method**: \`PUT\`
- **Access**: Protected (All authenticated users)
- **Description**: Updates the user's name or other general profile details.

### Update Profile Photo
- **URL**: \`/auth/profile-photo\`
- **Method**: \`PUT\`
- **Access**: Protected (All authenticated users)
- **Content-Type**: \`multipart/form-data\`
- **Description**: Uploads a new profile photo (max 5MB, image files only).

---

## 3. Issues Management (\`/issues\`)

### Get All Categories
- **URL**: \`/issues/categories\`
- **Method**: \`GET\`
- **Access**: Protected (All authenticated users)
- **Description**: Retrieves a list of available issue categories.

### Get Issue Statistics
- **URL**: \`/issues/stats\`
- **Method**: \`GET\`
- **Access**: Protected (Facility Manager, Admin)
- **Description**: Returns aggregated statistics on issues (e.g., pending vs resolved counts) for dashboards.

### Create a New Issue
- **URL**: \`/issues\`
- **Method**: \`POST\`
- **Access**: Protected (Community Member)
- **Content-Type**: \`multipart/form-data\` (If photo included)
- **Description**: Submits a new maintenance/facility issue.
- **Request Body**:
  - \`title\` (String, Required)
  - \`description\` (String, Optional)
  - \`category_id\` (UUID, Required)
  - \`location_type\` (Enum: 'indoor', 'outdoor', Required)
  - \`building\` / \`room_floor\` / \`location_description\` (Details)
  - \`photo\` (File, Optional)

### Get My Submitted Issues
- **URL**: \`/issues/my\`
- **Method**: \`GET\`
- **Access**: Protected (Community Member)
- **Description**: Retrieves a list of issues submitted by the logged-in community member.

### Get Assigned Issues (Worker)
- **URL**: \`/issues/assigned\`
- **Method**: \`GET\`
- **Access**: Protected (Worker)
- **Description**: Retrieves all active issues assigned to the logged-in worker.

### Get Worker History
- **URL**: \`/issues/worker-history\`
- **Method**: \`GET\`
- **Access**: Protected (Worker)
- **Description**: Retrieves historical (resolved/closed) issues assigned to the worker.

### Get All Issues
- **URL**: \`/issues\`
- **Method**: \`GET\`
- **Access**: Protected (Facility Manager, Admin)
- **Description**: Retrieves a complete list of issues across the campus, with optional filtering/pagination.

### Get Issue Details
- **URL**: \`/issues/:id\`
- **Method**: \`GET\`
- **Access**: Protected (All authenticated users)
- **Description**: Retrieves full details of a specific issue by its UUID.

### Update Issue Status
- **URL**: \`/issues/:id/status\`
- **Method**: \`PUT\`
- **Access**: Protected (Facility Manager, Worker, Admin)
- **Description**: Updates the lifecycle status of an issue (e.g., 'in_progress', 'resolved').
- **Request Body**:
  - \`status\` (String, Required)
  - \`comment\` (String, Optional)

### Assign Worker to Issue
- **URL**: \`/issues/:id/assign\`
- **Method**: \`PUT\`
- **Access**: Protected (Facility Manager, Admin)
- **Description**: Assigns a specific worker to an issue.
- **Request Body**:
  - \`worker_id\` (UUID, Required)

### Close Issue
- **URL**: \`/issues/:id/close\`
- **Method**: \`PUT\`
- **Access**: Protected (Facility Manager, Admin)
- **Description**: Marks an issue as formally 'closed'.

### Add Comment to Issue
- **URL**: \`/issues/:id/comments\`
- **Method**: \`POST\`
- **Access**: Protected (Worker, Facility Manager, Admin)
- **Description**: Adds a text comment/update to an issue thread.
- **Request Body**:
  - \`text\` (String, Required)

### Upload Issue Photo
- **URL**: \`/issues/:id/photo\`
- **Method**: \`POST\`
- **Access**: Protected (Worker, Community Member)
- **Content-Type**: \`multipart/form-data\`
- **Description**: Adds a supplementary photo (e.g., resolution proof) to an existing issue.

### Delete Issue
- **URL**: \`/issues/:id\`
- **Method**: \`DELETE\`
- **Access**: Protected (Facility Manager, Admin)
- **Description**: Permanently deletes an issue from the system.

---

## 4. Manager Tools (\`/manager\`)

### Get All Workers
- **URL**: \`/manager/workers\`
- **Method**: \`GET\`
- **Access**: Protected (Facility Manager, Admin)
- **Description**: Retrieves a list of all maintenance workers and their current availability.

### Update Worker Status
- **URL**: \`/manager/workers/:id/status\`
- **Method**: \`PUT\`
- **Access**: Protected (Facility Manager, Admin)
- **Description**: Overrides or updates a worker's availability status.

---

## 5. Administrator Tools (\`/admin\`)

### Get All Users
- **URL**: \`/admin/users\`
- **Method**: \`GET\`
- **Access**: Protected (Admin)
- **Description**: Retrieves a list of all registered users across the platform.

### Create User (Admin Override)
- **URL**: \`/admin/users\`
- **Method**: \`POST\`
- **Access**: Protected (Admin)
- **Description**: Creates a user directly, bypassing public registration flows.

### Update User Status
- **URL**: \`/admin/users/:id/status\`
- **Method**: \`PUT\`
- **Access**: Protected (Admin)
- **Description**: Activates, suspends, or deactivates a user account.

### Update User Role
- **URL**: \`/admin/users/:id/role\`
- **Method**: \`PUT\`
- **Access**: Protected (Admin)
- **Description**: Upgrades or downgrades a user's role (e.g., promoting a member to manager).

### Get Pending Registration Approvals
- **URL**: \`/admin/pending-approvals\`
- **Method**: \`GET\`
- **Access**: Protected (Admin)
- **Description**: Retrieves accounts (like Facility Managers) that require admin approval before becoming active.

### Approve Registration
- **URL**: \`/admin/approve/:id\`
- **Method**: \`PUT\`
- **Access**: Protected (Admin)
- **Description**: Approves a pending user account.

### Get Audit Logs
- **URL**: \`/admin/audit-log\`
- **Method**: \`GET\`
- **Access**: Protected (Admin)
- **Description**: Retrieves system audit logs of administrative actions.

---

## 6. Notifications (\`/notifications\`)

### Get My Notifications
- **URL**: \`/notifications\`
- **Method**: \`GET\`
- **Access**: Protected (All authenticated users)
- **Description**: Retrieves the recent notifications for the logged-in user.

### Mark Notification as Read
- **URL**: \`/notifications/:id/read\`
- **Method**: \`PUT\`
- **Access**: Protected (All authenticated users)
- **Description**: Flags a specific notification as 'read'.

### Mark All as Read
- **URL**: \`/notifications/read-all\`
- **Method**: \`PUT\`
- **Access**: Protected (All authenticated users)
- **Description**: Flags all unread notifications for the user as 'read'.
