# CampusCare Table Definitions

## Overview
The CampusCare backend utilizes a relational database (PostgreSQL/Supabase) to manage users, maintenance issues, tracking history, and notifications. Below are the detailed table definitions, column types, constraints, and relationships.

---

## 1. \`users\`
Stores all registered individuals interacting with the platform, including community members, workers, facility managers, and administrators.

| Column | Type | Constraints | Description |
|---|---|---|---|
| \`id\` | \`UUID\` | \`PRIMARY KEY\`, Default: \`uuid_generate_v4()\` | Unique identifier for the user. |
| \`name\` | \`VARCHAR(100)\` | \`NOT NULL\` | User's full name. |
| \`email\` | \`VARCHAR(255)\` | \`UNIQUE\`, \`NOT NULL\` | User's email address (used for login). |
| \`password_hash\` | \`VARCHAR(255)\` | \`NOT NULL\` | Bcrypt hashed password. |
| \`role\` | \`VARCHAR(20)\` | \`NOT NULL\`, \`CHECK\` (community_member, facility_manager, worker, admin) | Role-based access control level. |
| \`status\` | \`VARCHAR(20)\` | Default: 'active', \`CHECK\` (active, inactive, pending_approval) | Current account standing. |
| \`employee_id\` | \`VARCHAR(50)\` | Optional | Internal employee/staff ID for workers or managers. |
| \`availability\` | \`VARCHAR(20)\` | Default: 'available', \`CHECK\` (available, busy, off_duty) | Worker availability status. |
| \`profile_photo_url\`| \`TEXT\` | Optional | URL to the uploaded profile picture bucket. |
| \`push_token\` | \`TEXT\` | Optional | Device token for push notifications. |
| \`created_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of account creation. |
| \`updated_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of last account update. |

---

## 2. \`categories\`
Defines the types/classifications of maintenance issues available in the system.

| Column | Type | Constraints | Description |
|---|---|---|---|
| \`id\` | \`UUID\` | \`PRIMARY KEY\`, Default: \`uuid_generate_v4()\` | Unique identifier. |
| \`name\` | \`VARCHAR(100)\` | \`UNIQUE\`, \`NOT NULL\` | Name of the category (e.g., 'Electrical', 'Plumbing'). |
| \`icon\` | \`VARCHAR(50)\` | Default: 'alert-circle' | UI Icon reference name (e.g., Lucide or Expo icons). |
| \`is_archived\` | \`BOOLEAN\` | Default: \`FALSE\` | Flags if a category is deprecated and shouldn't be selectable. |
| \`created_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of creation. |

---

## 3. \`issues\`
The core entity of the system. Tracks the submission, assignment, and status of maintenance requests.

| Column | Type | Constraints | Description |
|---|---|---|---|
| \`id\` | \`UUID\` | \`PRIMARY KEY\`, Default: \`uuid_generate_v4()\` | Internal unique identifier. |
| \`tracking_id\` | \`VARCHAR(20)\` | \`UNIQUE\`, \`NOT NULL\` | User-facing readable ID (e.g., \`ISS-12345\`). |
| \`title\` | \`VARCHAR(200)\` | \`NOT NULL\` | Brief headline of the issue. |
| \`description\` | \`TEXT\` | \`CHECK\` (length <= 500) | Detailed explanation of the problem. |
| \`category_id\` | \`UUID\` | \`REFERENCES categories(id)\` | Foreign key linking to the issue category. |
| \`status\` | \`VARCHAR(20)\` | Default: 'pending', \`CHECK\` (pending, assigned, in_progress, resolved, closed) | Current lifecycle stage. |
| \`location_type\` | \`VARCHAR(10)\` | \`NOT NULL\`, \`CHECK\` (indoor, outdoor) | Broad location context. |
| \`building\` | \`VARCHAR(100)\` | Optional | Name or identifier of the building. |
| \`room_floor\` | \`VARCHAR(100)\` | Optional | Specific room number or floor. |
| \`location_description\`| \`TEXT\` | Optional | Additional details helping locate the issue. |
| \`latitude\` | \`DOUBLE PRECISION\`| Optional | GPS Coordinate for map plotting. |
| \`longitude\` | \`DOUBLE PRECISION\`| Optional | GPS Coordinate for map plotting. |
| \`photo_url\` | \`TEXT\` | Optional | Primary evidence photo URL. |
| \`submitted_by\` | \`UUID\` | \`NOT NULL\`, \`REFERENCES users(id)\` | Foreign key to the user who reported the issue. |
| \`assigned_to\` | \`UUID\` | \`REFERENCES users(id)\` | Foreign key to the worker handling the issue. |
| \`resolved_at\` | \`TIMESTAMPTZ\` | Optional | Timestamp when a worker marked it resolved. |
| \`closed_at\` | \`TIMESTAMPTZ\` | Optional | Timestamp when a manager officially closed it. |
| \`created_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of issue submission. |
| \`updated_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of last modification. |

---

## 4. \`issue_photos\`
A 1-to-many relationship table allowing multiple photos to be attached to a single issue over time.

| Column | Type | Constraints | Description |
|---|---|---|---|
| \`id\` | \`UUID\` | \`PRIMARY KEY\`, Default: \`uuid_generate_v4()\` | Unique identifier. |
| \`issue_id\` | \`UUID\` | \`NOT NULL\`, \`REFERENCES issues(id) ON DELETE CASCADE\` | Foreign key to the parent issue. |
| \`photo_url\` | \`TEXT\` | \`NOT NULL\` | Cloud storage URL of the uploaded image. |
| \`type\` | \`VARCHAR(20)\` | Default: 'submission', \`CHECK\` (submission, resolution) | Categorizes when/why the photo was added. |
| \`uploaded_by\` | \`UUID\` | \`NOT NULL\`, \`REFERENCES users(id)\` | The user who uploaded the photo. |
| \`created_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Upload timestamp. |

---

## 5. \`status_history\`
An audit trail capturing every state transition of an issue (e.g., Pending -> Assigned).

| Column | Type | Constraints | Description |
|---|---|---|---|
| \`id\` | \`UUID\` | \`PRIMARY KEY\`, Default: \`uuid_generate_v4()\` | Unique identifier. |
| \`issue_id\` | \`UUID\` | \`NOT NULL\`, \`REFERENCES issues(id) ON DELETE CASCADE\` | Foreign key to the parent issue. |
| \`old_status\` | \`VARCHAR(20)\` | Optional | Previous status state. |
| \`new_status\` | \`VARCHAR(20)\` | \`NOT NULL\` | Updated status state. |
| \`changed_by\` | \`UUID\` | \`NOT NULL\`, \`REFERENCES users(id)\` | The user who triggered the status change. |
| \`comment\` | \`TEXT\` | Optional | A system or user note justifying the change. |
| \`created_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of the state transition. |

---

## 6. \`comments\`
User-generated communication threads linked to specific issues.

| Column | Type | Constraints | Description |
|---|---|---|---|
| \`id\` | \`UUID\` | \`PRIMARY KEY\`, Default: \`uuid_generate_v4()\` | Unique identifier. |
| \`issue_id\` | \`UUID\` | \`NOT NULL\`, \`REFERENCES issues(id) ON DELETE CASCADE\` | Foreign key to the parent issue. |
| \`user_id\` | \`UUID\` | \`NOT NULL\`, \`REFERENCES users(id)\` | Author of the comment. |
| \`text\` | \`TEXT\` | \`NOT NULL\` | Content of the message. |
| \`created_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of message posting. |

---

## 7. \`notifications\`
System-generated alerts pushed to users regarding updates relevant to them.

| Column | Type | Constraints | Description |
|---|---|---|---|
| \`id\` | \`UUID\` | \`PRIMARY KEY\`, Default: \`uuid_generate_v4()\` | Unique identifier. |
| \`user_id\` | \`UUID\` | \`NOT NULL\`, \`REFERENCES users(id) ON DELETE CASCADE\` | Recipient of the notification. |
| \`title\` | \`VARCHAR(200)\` | \`NOT NULL\` | Subject line/headline of the alert. |
| \`body\` | \`TEXT\` | Optional | Detailed message content. |
| \`type\` | \`VARCHAR(30)\` | Default: 'status_change', \`CHECK\` (status_change, assignment, comment, system) | Categorizes the notification trigger. |
| \`is_read\` | \`BOOLEAN\` | Default: \`FALSE\` | Tracks if the user has viewed the alert. |
| \`issue_id\` | \`UUID\` | \`REFERENCES issues(id) ON DELETE SET NULL\` | Optional link to a specific issue context. |
| \`created_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of generation. |

---

## 8. \`audit_log\`
Administrative tracking for high-level system actions (useful for compliance and debugging).

| Column | Type | Constraints | Description |
|---|---|---|---|
| \`id\` | \`UUID\` | \`PRIMARY KEY\`, Default: \`uuid_generate_v4()\` | Unique identifier. |
| \`actor_id\` | \`UUID\` | \`REFERENCES users(id)\` | The administrator or user performing the action. |
| \`action\` | \`VARCHAR(100)\` | \`NOT NULL\` | Description of the event (e.g., \`USER_ROLE_UPDATED\`). |
| \`target_type\` | \`VARCHAR(50)\` | Optional | Entity type affected (e.g., \`user\`, \`system\`). |
| \`target_id\` | \`UUID\` | Optional | ID of the specific entity affected. |
| \`details\` | \`JSONB\` | Optional | Deep storage of action metadata or before/after deltas. |
| \`ip_address\`| \`VARCHAR(45)\` | Optional | Captured IP of the actor. |
| \`created_at\` | \`TIMESTAMPTZ\` | Default: \`NOW()\` | Timestamp of the logged event. |

---

## Key Indexes (Performance Optimizations)
To ensure rapid query execution, particularly for common dashboard and filtering views, the following indices are maintained:
- \`issues.status\`
- \`issues.submitted_by\`
- \`issues.assigned_to\`
- \`issues.category_id\`
- \`issues.created_at\`
- \`notifications\` (Compound: \`user_id\` + \`is_read\`)
- \`status_history.issue_id\`
- \`comments.issue_id\`
- \`users.role\`
- \`users.email\`
