# API Endpoints

Base URL: `http://localhost:3000/api`

---

## Authentication

All endpoints (except `/users/register` and `/users/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Headers

| Header | Value |
|--------|-------|
| Content-Type | application/json |
| Authorization | Bearer \<token\> |

---

## Users

### Register

**POST** `/users/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login

**POST** `/users/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2025-03-03T12:00:00.000Z"
}
```

### Get Profile

**GET** `/users/me`

Requires authentication.

### Update User

**PATCH** `/users/:id`

Requires authentication.

### Change Password

**PATCH** `/users/me/password`

Requires authentication.

---

## Exercises

### Get Exercise Stats

**GET** `/exercises/stats`

### List Exercises

**GET** `/exercises`

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search by name |
| tagId | string | Filter by tag |
| muscleGroup | string | Filter by muscle group |

### Get Exercise

**GET** `/exercises/:id`

### Create Exercise

**POST** `/exercises`

Requires admin authentication.

```json
{
  "name": "Bench Press",
  "description": "Chest exercise",
  "muscleGroup": "chest",
  "tagIds": ["uuid1", "uuid2"]
}
```

### Update Exercise

**PATCH** `/exercises/:id`

Requires admin authentication.

### Delete Exercise

**DELETE** `/exercises/:id`

Requires admin authentication.

---

## Tags

### List Tags

**GET** `/tags`

### Get Tag

**GET** `/tags/:id`

### Create Tag

**POST** `/tags`

Requires admin authentication.

```json
{
  "name": "strength",
  "color": "#FF5733"
}
```

### Delete Tag

**DELETE** `/tags/:id`

Requires admin authentication.

---

## Personal Records

All endpoints require authentication.

### Get PR Stats

**GET** `/personal-records/stats`

### Create/Update PR

**POST** `/personal-records`

```json
{
  "exerciseId": "uuid",
  "type": "weight",
  "value": 100,
  "reps": 5,
  "sessionId": "uuid"
}
```

### List PRs

**GET** `/personal-records`

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| exerciseId | string | Filter by exercise |
| type | string | Filter by type (weight/reps/duration) |

### Get PRs by Exercise

**GET** `/personal-records/exercise/:exerciseId`

### Get PR

**GET** `/personal-records/:id`

### Update PR

**PATCH** `/personal-records/:id`

### Delete PR

**DELETE** `/personal-records/:id`

---

## Workout Templates

All endpoints require authentication.

### Create Template

**POST** `/workoutTemplates`

```json
{
  "name": "Push Day",
  "description": "Chest, shoulders, triceps",
  "scheduledDayOfWeek": 1,
  "isFavorite": false,
  "exercises": [
    {
      "exerciseId": "uuid",
      "order": 1,
      "sets": [
        { "targetReps": 10, "targetWeight": 50, "order": 1 },
        { "targetReps": 10, "targetWeight": 50, "order": 2 },
        { "targetReps": 10, "targetWeight": 50, "order": 3 }
      ]
    }
  ]
}
```

### List Templates

**GET** `/workoutTemplates`

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| search | string | Search by name |
| isFavorite | boolean | Filter favorites |
| scheduledDayOfWeek | number | Filter by day (0-6) |

### Get Today's Scheduled Template

**GET** `/workoutTemplates/today`

### Get Template

**GET** `/workoutTemplates/:id`

### Update Template

**PATCH** `/workoutTemplates/:id`

### Delete Template

**DELETE** `/workoutTemplates/:id`

### Duplicate Template

**POST** `/workoutTemplates/:id/duplicate`

### Toggle Favorite

**PATCH** `/workoutTemplates/:id/favorite`

---

## Workout Sessions

All endpoints require authentication.

### Get Session Stats

**GET** `/workoutSessions/stats`

### Get Recent Sessions

**GET** `/workoutSessions/recent`

### Get Sessions by Date Range

**GET** `/workoutSessions/date-range`

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date (ISO string) |
| endDate | string | End date (ISO string) |

### Create Session from Template

**POST** `/workoutSessions/from-template`

```json
{
  "templateId": "uuid",
  "sessionDate": "2025-03-03"
}
```

### Create Session

**POST** `/workoutSessions`

```json
{
  "name": "Push Day",
  "sessionDate": "2025-03-03",
  "duration": 60,
  "notes": "Good workout",
  "templateId": "uuid",
  "exercises": [
    {
      "exerciseId": "uuid",
      "order": 1,
      "sets": [
        {
          "order": 1,
          "reps": 10,
          "weight": 50,
          "duration": 0,
          "isCompleted": true
        }
      ]
    }
  ]
}
```

### List Sessions

**GET** `/workoutSessions`

Query parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| startDate | string | Filter start date (YYYY-MM-DD) |
| endDate | string | Filter end date (YYYY-MM-DD) |
| templateId | string | Filter by template |
| search | string | Search by name |

### Get Session

**GET** `/workoutSessions/:id`

### Update Session

**PATCH** `/workoutSessions/:id`

### Delete Session

**DELETE** `/workoutSessions/:id`

### Duplicate Session

**POST** `/workoutSessions/:id/duplicate`

```json
{
  "sessionDate": "2025-03-10"
}
```

---

## Health Check

### Get Health Status

**GET** `/health`

No authentication required.

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-03-03T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```
