=== API ENDPOINTS: REQUEST AND RESPONSE EXAMPLES ===

1. Authentication
POST /api/auth/register
- Request Body (JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "community_member"
}
- Success Response (201 Created):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "community_member"
  }
}

POST /api/auth/login
- Request Body (JSON):
{
  "email": "john@example.com",
  "password": "password123"
}
- Success Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "role": "community_member"
  }
}

2. Issues Management
POST /api/issues
- Request Body (FormData - requires 'multipart/form-data'):
  - title: "Broken AC"
  - description: "The AC in room 304 is leaking"
  - category_id: "uuid-of-hvac-category"
  - location_type: "indoor"
  - building: "B"
  - room_floor: "304"
  - photo: [Image File]
- Success Response (201 Created):
{
  "message": "Issue created successfully",
  "issue": {
    "id": "issue-uuid-1234",
    "title": "Broken AC",
    "status": "pending",
    "created_at": "2026-05-17T12:00:00Z"
  }
}

GET /api/issues/:id
- Request: URL parameter id
- Success Response (200 OK):
{
  "id": "issue-uuid-1234",
  "title": "Broken AC",
  "description": "The AC in room 304 is leaking",
  "status": "pending",
  "location_type": "indoor",
  "building": "B",
  "room_floor": "304",
  "reporter": { "id": "...", "name": "John Doe" },
  "photo_url": "https://url.to/photo.jpg"
}

PUT /api/issues/:id/status
- Request Body (JSON):
{
  "status": "in_progress",
  "comment": "Parts have been ordered"
}
- Success Response (200 OK):
{
  "message": "Issue status updated",
  "issue": {
    "id": "issue-uuid-1234",
    "status": "in_progress"
  }
}

PUT /api/issues/:id/assign
- Request Body (JSON):
{
  "worker_id": "worker-uuid-5678"
}
- Success Response (200 OK):
{
  "message": "Issue assigned successfully",
  "issue": {
    "id": "issue-uuid-1234",
    "status": "assigned",
    "worker_id": "worker-uuid-5678"
  }
}

3. Admin & Manager Operations
GET /api/admin/users
- Request: Headers { "Authorization": "Bearer <admin-token>" }
- Success Response (200 OK):
[
  {
    "id": "user-uuid-1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "facility_manager",
    "is_approved": true
  }
]

PUT /api/admin/approve/:id
- Request: URL parameter id (for FM registration approval)
- Success Response (200 OK):
{
  "message": "User approved successfully",
  "user": {
    "id": "user-uuid-1",
    "is_approved": true
  }
}
