# API Endpoints - Fitness Tracker App

Base URL: `http://localhost:3000/api`

## Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Check server health status | No |

---

## Users

Base: `/api/users`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/users/register` | Register new user | No | - |
| POST | `/users/login` | User login | No | - |
| GET | `/users/me` | Get current user profile | Yes | user |
| PATCH | `/users/:id` | Update user | Yes | user/admin |
| PATCH | `/users/me/password` | Change password | Yes | user |
| GET | `/users` | List all users (paginated) | Yes | admin |
| GET | `/users/:id` | Get user by ID | Yes | admin |
| DELETE | `/users/softDelete/:id` | Soft delete user | Yes | admin |
| DELETE | `/users/hardDelete/:id` | Hard delete user | Yes | admin |

---

## Exercises

Base: `/api/exercises`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/exercises` | List exercises with filters | No | - |
| GET | `/exercises/stats` | Get exercise statistics | No | - |
| GET | `/exercises/:id` | Get exercise by ID | No | - |
| POST | `/exercises` | Create new exercise | Yes | admin |
| PATCH | `/exercises/:id` | Update exercise | Yes | admin |
| DELETE | `/exercises/:id` | Delete exercise | Yes | admin |

### Query Parameters for GET /exercises
- `page` - Page number
- `limit` - Items per page
- `difficulty` - Filter by difficulty
- `muscleGroup` - Filter by muscle group
- `type` - Filter by exercise type
- `tagIds` - Filter by tag IDs
- `searchTerm` - Search term

---

## Tags

Base: `/api/tags`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/tags` | List all tags | No | - |
| GET | `/tags/:id` | Get tag by ID | No | - |
| POST | `/tags` | Create new tag | Yes | admin |
| DELETE | `/tags/:id` | Delete tag | Yes | admin |

---

## Workout Sessions

Base: `/api/workoutSessions`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/workoutSessions` | List sessions with filters | Yes |
| GET | `/workoutSessions/stats` | Get session statistics | Yes |
| GET | `/workoutSessions/recent` | Get recent sessions | Yes |
| GET | `/workoutSessions/date-range` | Get sessions by date range | Yes |
| GET | `/workoutSessions/:id` | Get session by ID | Yes |
| POST | `/workoutSessions` | Create new session | Yes |
| POST | `/workoutSessions/from-template` | Create session from template | Yes |
| POST | `/workoutSessions/:id/duplicate` | Duplicate session | Yes |
| PATCH | `/workoutSessions/:id` | Update session | Yes |
| DELETE | `/workoutSessions/:id` | Delete session | Yes |

### Query Parameters for GET /workoutSessions
- `page` - Page number
- `limit` - Items per page
- `startDate` - Filter start date
- `endDate` - Filter end date

### Query Parameters for GET /workoutSessions/date-range
- `startDate` - Start date (required)
- `endDate` - End date (required)

---

## Workout Templates

Base: `/api/workoutTemplates`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/workoutTemplates` | List templates with filters | Yes |
| GET | `/workoutTemplates/:id` | Get template by ID | Yes |
| POST | `/workoutTemplates` | Create new template | Yes |
| PATCH | `/workoutTemplates/:id` | Update template | Yes |
| DELETE | `/workoutTemplates/:id` | Delete template | Yes |
| POST | `/workoutTemplates/:id/duplicate` | Duplicate template | Yes |
| PATCH | `/workoutTemplates/:id/favorite` | Toggle favorite | Yes |

### Query Parameters for GET /workoutTemplates
- `page` - Page number
- `limit` - Items per page
- `isFavorite` - Filter by favorite

---

## Personal Records

Base: `/api/personal-records`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/personal-records` | List PRs with filters | Yes |
| GET | `/personal-records/stats` | Get PR statistics | Yes |
| GET | `/personal-records/exercise/:exerciseId` | Get PR by exercise | Yes |
| GET | `/personal-records/:id` | Get PR by ID | Yes |
| POST | `/personal-records` | Create or update PR | Yes |
| PATCH | `/personal-records/:id` | Update PR manually | Yes |
| DELETE | `/personal-records/:id` | Delete PR | Yes |

### Query Parameters for GET /personal-records
- `page` - Page number
- `limit` - Items per page
- `exerciseId` - Filter by exercise
- `muscleGroup` - Filter by muscle group
- `difficulty` - Filter by difficulty
- `type` - Filter by type

---

## Notes

- All protected endpoints require a valid JWT token in the `Authorization` header: `Bearer <token>`
- Admin-only endpoints are restricted to users with `admin` role
- Public endpoints do not require authentication
- All timestamps are in ISO 8601 format
