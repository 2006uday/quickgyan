# quickGyan — Backend API Documentation

> **Platform:** IGNOU BCA Study Platform  
> **Database:** MongoDB Atlas (`quickgyan_db`)  
> **Collections:** `users`, `courses`, `semesters`, `resources`, `ai_chats`, `admins`  
> **Auth:** JWT + OTP (email verification)  
> **Base URL:** `https://api.quickgyan.com/api/v1`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Summary Table](#api-summary-table)
4. [Authentication APIs](#1-authentication-apis-5-endpoints)
5. [User APIs](#2-user-apis-4-endpoints)
6. [Course APIs](#3-course-apis-5-endpoints)
7. [Resource APIs](#4-resource-apis-6-endpoints)
8. [AI Chat APIs](#5-ai-chat-apis-3-endpoints)
9. [Announcements APIs](#6-announcements-apis-3-endpoints)
10. [Admin APIs](#7-admin-apis-7-endpoints)
11. [Data Models](#data-models)
12. [Error Codes](#error-codes)

---

## Overview

quickGyan is an educational platform for IGNOU BCA students. The backend exposes **33 REST APIs** grouped into **7 categories**:

| Category | Endpoints | Description |
|---|---|---|
| Authentication | 5 | Login, OTP, Signup, Logout, Password reset |
| Users | 4 | Profile, Settings, Notifications, Delete |
| Courses | 5 | List, Get, Create, Update, Delete |
| Resources | 6 | List, Get, Upload, Download, Preview, Delete |
| AI Chat | 3 | Ask question, History, Clear |
| Announcements | 3 | List, Create, Delete |
| Admin | 7 | Dashboard stats, User management, Platform settings |

**Total: 33 API Endpoints**

---

## Authentication

All protected routes require a **Bearer JWT token** in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

Roles:
- `student` — access to dashboard, courses, resources, AI chat
- `admin` — full access including user management and upload

---

## API Summary Table

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/auth/login` | ❌ | — | Login with email/enrollment + password |
| 2 | POST | `/auth/verify-otp` | ❌ | — | Verify OTP after login |
| 3 | POST | `/auth/signup` | ❌ | — | Register new student |
| 4 | POST | `/auth/logout` | ✅ | Any | Logout (invalidate session) |
| 5 | POST | `/auth/forgot-password` | ❌ | — | Request password reset |
| 6 | GET | `/users/me` | ✅ | Any | Get current user profile |
| 7 | PUT | `/users/me` | ✅ | Any | Update profile (name, email) |
| 8 | PUT | `/users/me/notifications` | ✅ | Any | Update notification preferences |
| 9 | DELETE | `/users/me` | ✅ | Any | Delete own account |
| 10 | GET | `/courses` | ✅ | Any | List all courses (grouped by semester) |
| 11 | GET | `/courses/:id` | ✅ | Any | Get a single course by ID |
| 12 | GET | `/courses/semester/:semesterId` | ✅ | Any | Get all courses in a semester |
| 13 | POST | `/courses` | ✅ | Admin | Create a new course |
| 14 | PUT | `/courses/:id` | ✅ | Admin | Update a course |
| 15 | DELETE | `/courses/:id` | ✅ | Admin | Delete a course |
| 16 | GET | `/resources` | ✅ | Any | List resources (filter by semester, type, course) |
| 17 | GET | `/resources/:id` | ✅ | Any | Get a single resource metadata |
| 18 | GET | `/resources/:id/download` | ✅ | Any | Download resource file |
| 19 | GET | `/resources/:id/preview` | ✅ | Any | Preview resource (PDF URL) |
| 20 | POST | `/resources` | ✅ | Admin | Upload a new resource |
| 21 | PUT | `/resources/:id` | ✅ | Admin | Update resource metadata |
| 22 | DELETE | `/resources/:id` | ✅ | Admin | Delete a resource |
| 23 | POST | `/ai/chat` | ✅ | Student | Send a question to AI |
| 24 | GET | `/ai/chat/history` | ✅ | Student | Get user's AI chat history |
| 25 | DELETE | `/ai/chat/history` | ✅ | Student | Clear AI chat history |
| 26 | GET | `/announcements` | ✅ | Any | List all announcements |
| 27 | POST | `/announcements` | ✅ | Admin | Create an announcement |
| 28 | DELETE | `/announcements/:id` | ✅ | Admin | Delete an announcement |
| 29 | GET | `/admin/stats` | ✅ | Admin | Dashboard stats (users, resources, AI queries) |
| 30 | GET | `/admin/users` | ✅ | Admin | List all registered users |
| 31 | PUT | `/admin/users/:id/status` | ✅ | Admin | Suspend or reactivate a user |
| 32 | DELETE | `/admin/users/:id` | ✅ | Admin | Delete a user account |
| 33 | PUT | `/admin/settings` | ✅ | Admin | Update platform settings |

---

## 1. Authentication APIs (5 Endpoints)

### `POST /auth/login`
Login with email or enrollment number and password. Returns a pending state requiring OTP.

**Request Body:**
```json
{
  "email": "uday@example.com",
  "password": "yourpassword"
}
```
> `email` can be either the user's email address or their IGNOU enrollment number.

**Response `200 OK`:**
```json
{
  "success": true,
  "requiresOtp": true,
  "message": "OTP sent to your registered email"
}
```

**Response `401 Unauthorized`:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### `POST /auth/verify-otp`
Verify the 6-digit OTP sent to email after login. Returns a JWT token on success.

**Request Body:**
```json
{
  "email": "uday@example.com",
  "otp": "123456"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "Uday Choursiya",
    "email": "uday@example.com",
    "enrollmentNo": "2350539605",
    "role": "student",
    "createdAt": "2024-01-15"
  }
}
```

---

### `POST /auth/signup`
Register a new student account.

**Request Body:**
```json
{
  "name": "Uday Choursiya",
  "email": "uday@example.com",
  "enrollmentNo": "2350539605",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `password` must be at least 6 characters, contain 1 uppercase letter and 1 number
- `enrollmentNo` must be unique (IGNOU enrollment number)

**Response `201 Created`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123",
    "name": "Uday Choursiya",
    "email": "uday@example.com",
    "enrollmentNo": "2350539605",
    "role": "student",
    "createdAt": "2026-03-04T11:44:00Z"
  }
}
```

**Response `409 Conflict`:**
```json
{
  "success": false,
  "error": "User already exists with this email or enrollment number"
}
```

---

### `POST /auth/logout`
Invalidate the user's session/token.

**Headers:** `Authorization: Bearer <token>`

**Response `200 OK`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### `POST /auth/forgot-password`
Initiate password reset via email.

**Request Body:**
```json
{ "email": "uday@example.com" }
```

**Response `200 OK`:**
```json
{ "success": true, "message": "Password reset link sent to your email" }
```

---

## 2. User APIs (4 Endpoints)

### `GET /users/me`
Get the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response `200 OK`:**
```json
{
  "id": "1",
  "name": "Uday Choursiya",
  "email": "uday@example.com",
  "enrollmentNo": "2350539605",
  "role": "student",
  "createdAt": "2024-01-15"
}
```

---

### `PUT /users/me`
Update the user's profile information (name and email only; enrollment number cannot be changed).

**Request Body:**
```json
{
  "name": "Uday Choursiya",
  "email": "uday.new@example.com"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "name": "Uday Choursiya",
    "email": "uday.new@example.com",
    "enrollmentNo": "2350539605",
    "role": "student"
  }
}
```

---

### `PUT /users/me/notifications`
Update notification preferences for the user.

**Request Body:**
```json
{
  "email": true,
  "newResources": true,
  "announcements": false
}
```

**Response `200 OK`:**
```json
{ "success": true, "message": "Notification preferences updated" }
```

---

### `DELETE /users/me`
Permanently delete the authenticated user's account and all associated data.

**Response `200 OK`:**
```json
{ "success": true, "message": "Account deleted successfully" }
```

---

## 3. Course APIs (5 Endpoints)

### `GET /courses`
List all courses, organized by semester.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Filter by course name or code |
| `semester` | number | Filter by semester number (1–6) |

**Response `200 OK`:**
```json
{
  "semesters": [
    {
      "id": 1,
      "name": "Semester 1",
      "courses": [
        { "id": "bcs-011", "code": "BCS-011", "name": "Computer Basics and PC Software", "credits": 4, "semester": 1 }
      ]
    }
  ]
}
```

---

### `GET /courses/:id`
Get a single course by its ID.

**Response `200 OK`:**
```json
{ "id": "bcs-011", "code": "BCS-011", "name": "Computer Basics and PC Software", "credits": 4, "semester": 1 }
```

---

### `GET /courses/semester/:semesterId`
Get all courses for a specific semester.

**Response `200 OK`:**
```json
{
  "semester": { "id": 1, "name": "Semester 1" },
  "courses": [...]
}
```

---

### `POST /courses` *(Admin only)*
Create a new course.

**Request Body:**
```json
{
  "code": "MCS-011",
  "name": "Problem Solving and Programming",
  "credits": 3,
  "semester": 2
}
```

**Response `201 Created`:**
```json
{ "success": true, "course": { "id": "mcs-011", "code": "MCS-011", "name": "Problem Solving and Programming", "credits": 3, "semester": 2 } }
```

---

### `PUT /courses/:id` *(Admin only)*
Update an existing course.

**Request Body:** *(any subset of course fields)*
```json
{ "name": "Updated Course Name", "credits": 4 }
```

**Response `200 OK`:**
```json
{ "success": true, "course": { ... } }
```

---

### `DELETE /courses/:id` *(Admin only)*
Delete a course by ID.

**Response `200 OK`:**
```json
{ "success": true, "message": "Course deleted successfully" }
```

---

## 4. Resource APIs (6 Endpoints)

### `GET /resources`
List all resources with optional filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Filter by title, course code, or course name |
| `semester` | number | Filter by semester (1–6) |
| `type` | string | Filter by type: `book`, `notes`, or `paper` |
| `courseCode` | string | Filter by course code (e.g., `MCS-011`) |

**Response `200 OK`:**
```json
{
  "resources": [
    {
      "id": "res-1",
      "title": "Introduction to Computer Basics - Complete Guide",
      "type": "book",
      "courseCode": "BCS-011",
      "courseName": "Computer Basics and PC Software",
      "semester": 1,
      "fileSize": "12.5 MB",
      "uploadDate": "2024-08-15"
    }
  ],
  "total": 15
}
```

---

### `GET /resources/:id`
Get metadata of a single resource.

**Response `200 OK`:**
```json
{
  "id": "res-1",
  "title": "Introduction to Computer Basics - Complete Guide",
  "type": "book",
  "courseCode": "BCS-011",
  "courseName": "Computer Basics and PC Software",
  "semester": 1,
  "fileSize": "12.5 MB",
  "uploadDate": "2024-08-15",
  "fileUrl": "https://storage.quickgyan.com/res-1.pdf"
}
```

---

### `GET /resources/:id/download`
Download a resource file. Returns file stream or pre-signed download URL.

**Response `200 OK`:**
```json
{ "downloadUrl": "https://storage.quickgyan.com/signed/res-1.pdf?expires=..." }
```

---

### `GET /resources/:id/preview`
Get a preview URL for the resource (e.g., for PDF viewer).

**Response `200 OK`:**
```json
{ "previewUrl": "https://storage.quickgyan.com/preview/res-1.pdf" }
```

---

### `POST /resources` *(Admin only)*
Upload a new resource. Accepts `multipart/form-data`.

**Form Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Resource title |
| `type` | string | ✅ | `book`, `notes`, or `paper` |
| `semester` | number | ✅ | Semester number (1–6) |
| `courseCode` | string | ✅ | Associated course code |
| `file` | file | ✅ | PDF file to upload |

**Response `201 Created`:**
```json
{
  "success": true,
  "resource": {
    "id": "res-16",
    "title": "New Study Material",
    "type": "notes",
    "courseCode": "MCS-011",
    "semester": 2,
    "fileSize": "4.2 MB",
    "uploadDate": "2026-03-04"
  }
}
```

---

### `PUT /resources/:id` *(Admin only)*
Update resource metadata (e.g., title, type).

**Request Body:**
```json
{ "title": "Updated Resource Title", "type": "book" }
```

**Response `200 OK`:**
```json
{ "success": true, "resource": { ... } }
```

---

### `DELETE /resources/:id` *(Admin only)*
Delete a resource and its associated file from storage.

**Response `200 OK`:**
```json
{ "success": true, "message": "Resource deleted successfully" }
```

---

## 5. AI Chat APIs (3 Endpoints)

### `POST /ai/chat`
Send a question to the AI assistant and receive an answer.

**Request Body:**
```json
{ "question": "Explain inheritance in OOP" }
```

**Response `200 OK`:**
```json
{
  "id": "msg-001",
  "question": "Explain inheritance in OOP",
  "answer": "Inheritance is one of the four fundamental pillars of OOP...",
  "timestamp": "2026-03-04T11:44:00Z"
}
```

---

### `GET /ai/chat/history`
Retrieve the authenticated user's full AI chat history.

**Response `200 OK`:**
```json
{
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "Explain inheritance in OOP",
      "timestamp": "2026-03-04T11:44:00Z"
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "Inheritance is one of the four fundamental pillars...",
      "timestamp": "2026-03-04T11:44:02Z"
    }
  ]
}
```

---

### `DELETE /ai/chat/history`
Clear all AI chat messages for the authenticated user.

**Response `200 OK`:**
```json
{ "success": true, "message": "Chat history cleared" }
```

---

## 6. Announcements APIs (3 Endpoints)

### `GET /announcements`
Get all platform announcements, newest first.

**Response `200 OK`:**
```json
{
  "announcements": [
    {
      "id": "ann-001",
      "title": "New Exam Dates Released",
      "content": "TEE December 2025 results have been announced.",
      "date": "2026-01-25T00:00:00Z"
    }
  ]
}
```

---

### `POST /announcements` *(Admin only)*
Create a new announcement.

**Request Body:**
```json
{
  "title": "Semester 4 Notes Added",
  "content": "Complete notes for MCS-041 and MCS-042 are now available."
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "announcement": {
    "id": "ann-002",
    "title": "Semester 4 Notes Added",
    "content": "Complete notes for MCS-041 and MCS-042 are now available.",
    "date": "2026-03-04T11:44:00Z"
  }
}
```

---

### `DELETE /announcements/:id` *(Admin only)*
Delete an announcement by ID.

**Response `200 OK`:**
```json
{ "success": true, "message": "Announcement deleted" }
```

---

## 7. Admin APIs (7 Endpoints)

### `GET /admin/stats`
Get platform-wide dashboard statistics.

**Response `200 OK`:**
```json
{
  "totalUsers": 1247,
  "userGrowth": "+12%",
  "totalResources": 526,
  "resourceGrowth": "+8%",
  "activeCourses": 24,
  "aiQueriesToday": 3842,
  "aiGrowth": "+23%",
  "systemStatus": {
    "api": "online",
    "database": "connected",
    "aiService": "active",
    "fileStorageUsed": "45%"
  }
}
```

---

### `GET /admin/users`
List all registered users with search support.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Filter by name, email, or enrollment number |
| `status` | string | Filter by `active` or `suspended` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response `200 OK`:**
```json
{
  "users": [
    {
      "id": "1",
      "name": "Uday Choursiya",
      "email": "uday@example.com",
      "enrollmentNo": "2350539605",
      "role": "student",
      "status": "active",
      "joinedAt": "2024-01-15",
      "lastActive": "2 hours ago"
    }
  ],
  "total": 1247,
  "page": 1,
  "limit": 20
}
```

---

### `PUT /admin/users/:id/status`
Suspend or reactivate a user account.

**Request Body:**
```json
{ "status": "suspended" }
```

> `status` must be either `"active"` or `"suspended"`

**Response `200 OK`:**
```json
{ "success": true, "message": "User suspended successfully" }
```

---

### `DELETE /admin/users/:id`
Permanently delete a user account and all associated data.

**Response `200 OK`:**
```json
{ "success": true, "message": "User deleted successfully" }
```

---

### `POST /admin/users/:id/email` *(Admin only)*
Send an email to a specific user.

**Request Body:**
```json
{
  "subject": "Important Update",
  "message": "Your account requires attention..."
}
```

**Response `200 OK`:**
```json
{ "success": true, "message": "Email sent successfully" }
```

---

### `PUT /admin/settings`
Update global platform settings.

**Request Body:**
```json
{
  "general": {
    "platformName": "quickGyan",
    "platformUrl": "https://quickgyan.vercel.app",
    "description": "Your One-Stop Platform for Academic Learning"
  },
  "security": {
    "requireEmailVerification": true,
    "requireOtpOnLogin": true,
    "sessionTimeoutHours": 24
  },
  "notifications": {
    "notifyOnNewUser": true,
    "notifyOnResourceUpload": true,
    "notifyOnMaintenance": false
  },
  "email": {
    "smtpHost": "smtp.example.com",
    "smtpPort": 587,
    "smtpUser": "no-reply@quickgyan.com",
    "smtpPassword": "secret"
  }
}
```

**Response `200 OK`:**
```json
{ "success": true, "message": "Settings updated successfully" }
```

---

### `GET /admin/settings`
Get current platform settings.

**Response `200 OK`:**
```json
{
  "general": { ... },
  "security": { ... },
  "notifications": { ... }
}
```

---

## Data Models

### User
```ts
{
  id: string
  name: string
  email: string
  enrollmentNo: string
  role: "student" | "admin"
  status: "active" | "suspended"
  createdAt: string   // ISO 8601
  lastActive?: string
}
```

### Course
```ts
{
  id: string
  code: string         // e.g., "MCS-011"
  name: string
  credits: number
  semester: number     // 1 – 6
}
```

### Resource
```ts
{
  id: string
  title: string
  type: "book" | "notes" | "paper"
  courseCode: string
  courseName: string
  semester: number
  fileSize: string     // e.g., "12.5 MB"
  uploadDate: string   // ISO 8601 date
  year?: number        // for question papers
  fileUrl?: string     // signed URL
}
```

### AI Chat Message
```ts
{
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string    // ISO 8601
}
```

### Announcement
```ts
{
  id: string
  title: string
  content: string
  date: string         // ISO 8601
}
```

---

## Error Codes

| HTTP Status | Code | Description |
|---|---|---|
| `400` | `BAD_REQUEST` | Invalid request body or missing required fields |
| `401` | `UNAUTHORIZED` | Missing or invalid JWT token |
| `403` | `FORBIDDEN` | Insufficient role permissions (e.g., student accessing admin route) |
| `404` | `NOT_FOUND` | Resource, user, course, or announcement not found |
| `409` | `CONFLICT` | Duplicate email or enrollment number on signup |
| `422` | `VALIDATION_ERROR` | Request data failed validation (e.g., weak password) |
| `500` | `INTERNAL_ERROR` | Unexpected server error |

**Error Response Format:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

---

## Notes for Backend Implementation

- **OTP Flow:** After a successful credential check, send a 6-digit OTP to the user's registered email. OTPs should expire after **10 minutes**.
- **Enrollment Number:** Cannot be changed after registration — it is used for IGNOU student identity validation.
- **File Storage:** Use a cloud storage provider (e.g., AWS S3, Cloudinary) for resource PDF files; store file URLs in MongoDB.
- **AI Integration:** The `/ai/chat` endpoint should integrate with a language model API (e.g., Google Gemini, OpenAI) to generate academic responses.
- **Password Reset:** Send a time-limited reset link; the link should expire after **30 minutes**.
- **Admin-only routes** must be protected by both JWT authentication and role verification middleware.
