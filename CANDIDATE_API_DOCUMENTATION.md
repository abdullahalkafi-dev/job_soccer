# Candidate API Documentation

## Overview
The Candidate API provides endpoints to search and retrieve candidate profiles across different categories.

## Endpoints

### 1. Search Candidates
**Endpoint:** `GET /api/v1/candidates/search`

**Description:** Search candidates by name, category, and country with pagination support.

**Query Parameters:**
- `searchTerm` (optional): Search by first name or last name
- `role` (optional): Filter by candidate category
  - `"Professional Player"`
  - `"Amateur Player"`
  - `"High School"`
  - `"College/University"`
  - `"On field staff"`
  - `"Office Staff"`
- `country` (optional): Filter by country (e.g., "Australia", "Spain")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: "-profileAIScore")

**Example Request:**
```
GET /api/v1/candidates/search?searchTerm=john&role=Professional Player&country=Australia&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Candidates retrieved successfully",
  "data": [
    {
      "_id": "68fca86045f49ff2f840393a",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "Professional Player",
      "profileImage": "/uploads/profiles/image.jpg",
      "profileAIScore": 85,
      "userType": "candidate",
      "profile": {
        "dateOfBirth": "1995-07-15T00:00:00.000Z",
        "placeOfBirth": "Madrid, Spain",
        "nationality": "Spanish",
        "country": "Australia",
        "position": "Forward",
        "currentClub": "Real Madrid CF",
        // ... other profile fields
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

### 2. Get Featured Candidates
**Endpoint:** `GET /api/v1/candidates/featured`

**Description:** Get top 4 candidates from each category, sorted by AI score.

**Query Parameters:** None

**Example Request:**
```
GET /api/v1/candidates/featured
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Featured candidates retrieved successfully",
  "data": {
    "ProfessionalPlayer": [
      {
        "_id": "68fca86045f49ff2f840393a",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "Professional Player",
        "profileImage": "/uploads/profiles/image.jpg",
        "profileAIScore": 95,
        "userType": "candidate",
        "profile": { /* full profile data */ }
      },
      // ... up to 3 more candidates
    ],
    "AmateurPlayer": [
      // ... up to 4 candidates
    ],
    "HighSchool": [
      // ... up to 4 candidates
    ],
    "College/University": [
      // ... up to 4 candidates
    ],
    "OnfieldStaff": [
      // ... up to 4 candidates
    ],
    "OfficeStaff": [
      // ... up to 4 candidates
    ]
  }
}
```

---

### 3. Get Candidate by ID
**Endpoint:** `GET /api/v1/candidates/:id`

**Description:** Get a specific candidate's full profile details by their user ID.

**URL Parameters:**
- `id`: User ID of the candidate

**Example Request:**
```
GET /api/v1/candidates/68fca86045f49ff2f840393a
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Candidate retrieved successfully",
  "data": {
    "_id": "68fca86045f49ff2f840393a",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "Professional Player",
    "profileImage": "/uploads/profiles/image.jpg",
    "profileAIScore": 85,
    "userType": "candidate",
    "isVerified": true,
    "profile": {
      "dateOfBirth": "1995-07-15T00:00:00.000Z",
      "placeOfBirth": "Madrid, Spain",
      "nationality": "Spanish",
      "phoneNumber": "+34612345678",
      "gender": "Male",
      "height": { "size": 182, "unit": "cm" },
      "weight": { "size": 78, "unit": "kg" },
      "position": "Forward",
      "currentClub": "Real Madrid CF",
      "division": "La Liga",
      "country": "Australia",
      "videos": [
        {
          "url": "/uploads/videos/video1.mp4",
          "duration": 120,
          "title": "Best Goals Compilation"
        }
      ]
      // ... other profile fields
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
  "message": "Candidate not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "User is not a candidate"
}
```

---

## Implementation Details

### Files Created/Modified:
1. `candidate.service.ts` - Business logic for candidate operations
2. `candidate.controller.ts` - Request handlers
3. `candidate.route.ts` - Route definitions
4. `candidate.dto.ts` - Validation schemas
5. `routes/index.ts` - Added candidate routes to main router

### Features:
- ✅ Search by name (firstName or lastName)
- ✅ Filter by candidate category/role
- ✅ Filter by country
- ✅ Pagination support
- ✅ Sorting by AI score (default) or other fields
- ✅ Featured candidates grouped by category (max 4 per category)
- ✅ Get individual candidate details
- ✅ Only returns candidates with complete profiles
- ✅ Excludes deleted users

### Database Models Used:
- `User` - Base user information
- `ProfessionalPlayerCan` - Professional player profiles
- `AmateurPlayerCan` - Amateur player profiles
- `HighSchoolCan` - High school student profiles
- `CollegeOrUniversity` - College/University student profiles
- `OnFieldStaffCan` - On-field staff profiles
- `OfficeStaffCan` - Office staff profiles
