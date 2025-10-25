
# Employer API Documentation

## Overview

The Employer API provides endpoints to search and retrieve employer profiles across different categories.

## Endpoints

### 1. Search Employers

**Endpoint:** `GET /api/v1/employers/search`

**Description:** Search employers by name, category, and country with pagination support.

**Query Parameters:**

- `searchTerm` (optional): Search by first name or last name
- `role` (optional): Filter by employer category
  - `"Professional Club"`
  - `"Academy"`
  - `"Amateur Club"`
  - `"Consulting Company"`
  - `"High School"`
  - `"College/University"`
  - `"Agent"`
- `country` (optional): Filter by country (e.g., "Australia", "Spain")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: "-createdAt")

**Example Request:**

```http
GET /api/v1/employers/search?searchTerm=barcelona&role=Professional Club&country=Spain&page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employers retrieved successfully",
  "data": [
    {
      "_id": "68fca86045f49ff2f840393a",
      "firstName": "FC",
      "lastName": "Barcelona",
      "email": "contact@fcbarcelona.com",
      "role": "Professional Club",
      "profileImage": "/uploads/profiles/club-logo.jpg",
      "userType": "employer",
      "profile": {
        "country": "Spain",
        "address": "Camp Nou, Barcelona",
        "location": "Barcelona, Spain",
        "level": "La Liga",
        "founded": "1899",
        "website": "https://www.fcbarcelona.com",
        "nationality": "Spanish",
        "phoneNumber": "+34 93 496 36 00",
        "clubName": "FC Barcelona",
        "clubContact": "contact@fcbarcelona.com",
        "clubDescription": "One of the most successful football clubs..."
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPage": 3
  }
}
```

---

### 2. Get Featured Employers

**Endpoint:** `GET /api/v1/employers/featured`

**Description:** Get top 4 employers from each category, sorted by most recent.

**Query Parameters:** None

**Example Request:**

```http
GET /api/v1/employers/featured
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Featured employers retrieved successfully",
  "data": {
    "ProfessionalClub": [
      {
        "_id": "68fca86045f49ff2f840393a",
        "firstName": "FC",
        "lastName": "Barcelona",
        "email": "contact@fcbarcelona.com",
        "role": "Professional Club",
        "profileImage": "/uploads/profiles/club-logo.jpg",
        "userType": "employer",
        "profile": { /* full profile data */ }
      }
      // ... up to 3 more employers
    ],
    "Academy": [
      // ... up to 4 employers
    ],
    "AmateurClub": [
      // ... up to 4 employers
    ],
    "ConsultingCompany": [
      // ... up to 4 employers
    ],
    "HighSchool": [
      // ... up to 4 employers
    ],
    "CollegeUniversity": [
      // ... up to 4 employers
    ],
    "Agent": [
      // ... up to 4 employers
    ]
  }
}
```

---

### 3. Get Employer by ID

**Endpoint:** `GET /api/v1/employers/:id`

**Description:** Get a specific employer's full profile details by their user ID.

**URL Parameters:**

- `id`: User ID of the employer

**Example Request:**

```http
GET /api/v1/employers/68fca86045f49ff2f840393a
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employer retrieved successfully",
  "data": {
    "_id": "68fca86045f49ff2f840393a",
    "firstName": "FC",
    "lastName": "Barcelona",
    "email": "contact@fcbarcelona.com",
    "role": "Professional Club",
    "profileImage": "/uploads/profiles/club-logo.jpg",
    "userType": "employer",
    "isVerified": true,
    "profile": {
      "country": "Spain",
      "address": "Camp Nou, Barcelona",
      "location": "Barcelona, Spain",
      "level": "La Liga",
      "founded": "1899",
      "website": "https://www.fcbarcelona.com",
      "nationality": "Spanish",
      "phoneNumber": "+34 93 496 36 00",
      "clubName": "FC Barcelona",
      "clubContact": "contact@fcbarcelona.com",
      "clubDescription": "One of the most successful football clubs in the world..."
    }
  }
}
```

---

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Employer not found"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "statusCode": 400,
  "message": "User is not an employer"
}
```

---

## Implementation Details

### Files Created/Modified:

1. `employer.service.ts` - Business logic for employer operations
2. `employer.controller.ts` - Request handlers
3. `employer.route.ts` - Route definitions
4. `employer.dto.ts` - Validation schemas
5. `routes/index.ts` - Added employer routes to main router

### Features:

- ✅ Search by name (firstName or lastName)
- ✅ Filter by employer category/role
- ✅ Filter by country
- ✅ Pagination support
- ✅ Sorting by creation date (default) or other fields
- ✅ Featured employers grouped by category (max 4 per category)
- ✅ Get individual employer details
- ✅ Only returns employers with complete profiles
- ✅ Excludes deleted users

### Database Models Used:

- `User` - Base user information
- `ProfessionalClubEmp` - Professional club profiles
- `AcademyEmp` - Academy profiles
- `AmateurClubEmp` - Amateur club profiles
- `ConsultingCompanyEmp` - Consulting company profiles
- `HighSchoolEmp` - High school profiles
- `CollegeOrUniversityEmp` - College/University profiles
- `AgentEmp` - Agent profiles
