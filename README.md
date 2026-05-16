# CampusCare — GIU Facility Management Mobile Application

## 📱 Project Overview

CampusCare is a mobile application designed for the German International University (GIU) community. It enables students, faculty, and staff to report campus infrastructure issues (broken doors, flickering lights, malfunctioning equipment, etc.) and empowers the Facility Management team to efficiently track, assign, and resolve them.

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile App** | React Native + Expo SDK 54 |
| **Navigation** | React Navigation v6 (Stack + Bottom Tabs) |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL via Supabase |
| **Authentication** | JWT + bcrypt |
| **Image Storage** | Supabase Storage |
| **API Client** | Axios |

## 📁 Project Structure

```
SWE_PROJ/
├── backend/                    # Node.js Express API
│   ├── config/
│   │   ├── db.js              # Supabase connection
│   │   └── schema.sql         # Database schema
│   ├── controllers/
│   │   ├── auth.controller.js     # Auth logic
│   │   ├── issues.controller.js   # Issue CRUD
│   │   ├── manager.controller.js  # Worker management
│   │   └── admin.controller.js    # Admin operations
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── roleCheck.js       # RBAC middleware
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── issues.routes.js
│   │   ├── manager.routes.js
│   │   ├── admin.routes.js
│   │   └── notifications.routes.js
│   ├── utils/
│   │   ├── validators.js      # Input validation
│   │   └── helpers.js         # Utility functions
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/                   # React Native Expo App
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── IssueCard.js
│   │   │   └── SharedComponents.js
│   │   ├── config/
│   │   │   └── api.js         # Axios config
│   │   ├── constants/
│   │   │   └── theme.js       # Design system
│   │   ├── context/
│   │   │   └── AuthContext.js  # Auth state
│   │   ├── navigation/
│   │   │   └── AppNavigator.js # Navigation setup
│   │   └── screens/
│   │       ├── auth/          # Login, Register
│   │       ├── community/     # Home, Submit, MyIssues
│   │       ├── manager/       # Dashboard, AssignWorker
│   │       ├── worker/        # Dashboard, History
│   │       └── shared/        # IssueDetail, Notifications, Profile
│   ├── App.js
│   └── package.json
│
└── README.md
```

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v18+ and npm
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app on your mobile device (iOS/Android)
- A **Supabase** account ([supabase.com](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_REPO/campuscare.git
cd campuscare
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure Environment Variables:**
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

**Set up Database:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `backend/config/schema.sql`
3. Run the SQL to create all tables

**Create Storage Bucket:**
1. Go to Supabase Dashboard → Storage
2. Create a bucket named `issue-photos` with **public access**

**Start the Backend:**
```bash
npm run dev
```
Server runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Configure API URL:**
Edit `src/config/api.js` and set `API_BASE_URL` to:
- **Android Emulator:** `http://10.0.2.2:5000/api`
- **iOS Simulator:** `http://localhost:5000/api`
- **Physical Device:** `http://YOUR_MACHINE_IP:5000/api`

**Start the App:**
```bash
npx expo start
```

Scan the QR code with Expo Go to run on your device.

## 👥 User Roles

| Role | Description | Registration |
|------|-------------|-------------|
| **Community Member** | Students, faculty, staff who report issues | Self-registration |
| **Facility Manager** | Manages, assigns, and tracks issues | Self-registration (needs admin approval) |
| **Worker** | Resolves assigned maintenance tasks | Created by admin |
| **Admin** | Full system control | Pre-configured |

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Issues
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/issues` | Submit new issue | Community Member |
| GET | `/api/issues` | Get all issues | FM / Admin |
| GET | `/api/issues/my` | Get my submissions | Community Member |
| GET | `/api/issues/assigned` | Get assigned tasks | Worker |
| GET | `/api/issues/:id` | Get issue details | All (auth) |
| PUT | `/api/issues/:id/status` | Update status | FM / Worker |
| PUT | `/api/issues/:id/assign` | Assign worker | FM |
| PUT | `/api/issues/:id/close` | Close issue | FM |
| POST | `/api/issues/:id/comments` | Add comment | Worker / FM |
| POST | `/api/issues/:id/photo` | Upload photo | Worker |
| DELETE | `/api/issues/:id` | Delete issue | FM / Admin |
| GET | `/api/issues/stats` | Get statistics | FM / Admin |
| GET | `/api/issues/categories` | Get categories | All |

### Manager
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manager/workers` | List all workers |
| PUT | `/api/manager/workers/:id/status` | Activate/deactivate worker |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user account |
| PUT | `/api/admin/users/:id/status` | Activate/deactivate user |
| PUT | `/api/admin/users/:id/role` | Change user role |
| GET | `/api/admin/pending-approvals` | Get pending FM approvals |
| PUT | `/api/admin/approve/:id` | Approve/reject registration |
| GET | `/api/admin/audit-log` | View audit trail |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

## 📊 Database Schema

See `backend/config/schema.sql` for the complete schema. Key tables:

- **users** — All user accounts with roles and availability
- **issues** — Submitted campus issues with status tracking
- **categories** — Issue classification (Electrical, Plumbing, etc.)
- **comments** — Worker/FM comments on issues
- **issue_photos** — Submission and resolution photos
- **status_history** — Complete audit trail of status changes
- **notifications** — In-app notification records
- **audit_log** — System-wide audit trail

## 📄 License

This project is developed as part of INCS 617 — Software Engineering for Business Informatics at the German International University (GIU), SS 2026.
