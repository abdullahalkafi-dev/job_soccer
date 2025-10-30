# Follow System API Documentation

## Overview
The Follow System allows both candidates and employers to follow employers within the platform. This feature enables users to stay updated with specific employers they're interested in.

## Base URL
```
/api/v1/follow
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Endpoints

### 1. Follow an Employer

**POST** `/api/v1/follow`

Follow a specific employer.

#### Request Headers
- `Authorization: Bearer <token>` (Required)

#### Request Body
```json
{
  "employerId": "507f1f77bcf86cd799439011"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Employer followed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "followerId": "507f1f77bcf86cd799439013",
    "followerType": "candidate",
    "followerRole": "professionalPlayer",
    "followingId": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "employer@example.com",
      "role": "professionalClub",
      "userType": "employer",
      "createdAt": "2025-01-15T10:00:00.000Z"
    },
    "followingRole": "professionalClub",
    "createdAt": "2025-01-20T14:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Cannot follow yourself
```json
{
  "success": false,
  "message": "You cannot follow yourself"
}
```

**400 Bad Request** - Can only follow employers
```json
{
  "success": false,
  "message": "You can only follow employers"
}
```

**404 Not Found** - Employer doesn't exist
```json
{
  "success": false,
  "message": "Employer not found"
}
```

**409 Conflict** - Already following
```json
{
  "success": false,
  "message": "Already following this employer"
}
```

---

### 2. Unfollow an Employer

**DELETE** `/api/v1/follow/:employerId`

Unfollow a specific employer.

#### Request Headers
- `Authorization: Bearer <token>` (Required)

#### URL Parameters
- `employerId` (string, required) - The MongoDB ObjectId of the employer to unfollow

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Employer unfollowed successfully",
  "data": null
}
```

#### Error Responses

**404 Not Found** - Not following or employer doesn't exist
```json
{
  "success": false,
  "message": "Follow relationship not found or already removed"
}
```

---

### 3. Get Following List

**GET** `/api/v1/follow/following`

Get list of all employers that the authenticated user is following.

#### Request Headers
- `Authorization: Bearer <token>` (Required)

#### Query Parameters
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 10) - Items per page
- `followingRole` (string, optional) - Filter by employer role (e.g., "professionalClub", "academy", etc.)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Following list retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "followerId": "507f1f77bcf86cd799439013",
      "followerType": "candidate",
      "followerRole": "professionalPlayer",
      "followingId": {
        "_id": "507f1f77bcf86cd799439011",
        "email": "employer@example.com",
        "role": "professionalClub",
        "userType": "employer",
        "createdAt": "2025-01-15T10:00:00.000Z"
      },
      "followingRole": "professionalClub",
      "createdAt": "2025-01-20T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPage": 1,
    "total": 1
  }
}
```

---

### 4. Get Followers List

**GET** `/api/v1/follow/followers/:employerId`

Get list of all users following a specific employer. This endpoint is public.

#### URL Parameters
- `employerId` (string, required) - The MongoDB ObjectId of the employer

#### Query Parameters
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 10) - Items per page
- `followerType` (string, optional) - Filter by follower type ("candidate" or "employer")
- `followerRole` (string, optional) - Filter by follower role

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Followers list retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "followerId": {
        "_id": "507f1f77bcf86cd799439013",
        "email": "candidate@example.com",
        "role": "professionalPlayer",
        "userType": "candidate",
        "createdAt": "2025-01-10T08:00:00.000Z"
      },
      "followerType": "candidate",
      "followerRole": "professionalPlayer",
      "followingId": "507f1f77bcf86cd799439011",
      "followingRole": "professionalClub",
      "createdAt": "2025-01-20T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPage": 1,
    "total": 5
  }
}
```

---

### 5. Check if Following

**GET** `/api/v1/follow/check/:employerId`

Check if the authenticated user is following a specific employer.

#### Request Headers
- `Authorization: Bearer <token>` (Required)

#### URL Parameters
- `employerId` (string, required) - The MongoDB ObjectId of the employer

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Follow status retrieved successfully",
  "data": {
    "isFollowing": true
  }
}
```

---

### 6. Get Following Count

**GET** `/api/v1/follow/following/count`

Get the total count of employers that the authenticated user is following.

#### Request Headers
- `Authorization: Bearer <token>` (Required)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Following count retrieved successfully",
  "data": {
    "count": 15
  }
}
```

---

### 7. Get Followers Count

**GET** `/api/v1/follow/followers/:employerId/count`

Get the total count of followers for a specific employer. This endpoint is public.

#### URL Parameters
- `employerId` (string, required) - The MongoDB ObjectId of the employer

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Followers count retrieved successfully",
  "data": {
    "count": 42
  }
}
```

---

## Data Models

### Follow Object
```typescript
{
  _id: ObjectId;                    // Unique identifier for the follow relationship
  followerId: ObjectId;             // User who is following
  followerType: "candidate" | "employer";  // Type of the follower
  followerRole: string;             // Role of the follower
  followingId: ObjectId;            // Employer being followed
  followingRole: string;            // Role of the employer
  createdAt: Date;                  // When the follow was created
}
```

---

## User Roles

### Candidate Roles
- `professionalPlayer`
- `amateurPlayer`
- `collegeOrUniversity`
- `highSchool`
- `officeStaff`
- `onFieldStaff`

### Employer Roles
- `professionalClub`
- `amateurClub`
- `academy`
- `collegeOrUniversity`
- `highSchool`
- `agent`
- `consultingCompany`

---

## Use Cases

### 1. Candidate Following an Employer
A professional player follows a professional club to stay updated with their job postings.

```bash
POST /api/v1/follow
{
  "employerId": "507f1f77bcf86cd799439011"
}
```

### 2. Employer Following Another Employer
An academy follows a professional club to stay informed about their activities.

```bash
POST /api/v1/follow
{
  "employerId": "507f1f77bcf86cd799439015"
}
```

### 3. Getting Popular Employers
Retrieve employers with the most followers:

```bash
# For each employer, get their follower count
GET /api/v1/follow/followers/:employerId/count
```

### 4. Checking Follow Status Before Displaying UI
Before showing "Follow" or "Unfollow" button:

```bash
GET /api/v1/follow/check/:employerId
```

### 5. View All Employers a User Follows
```bash
GET /api/v1/follow/following?page=1&limit=20
```

### 6. Filter Following by Role
Get only professional clubs that a user follows:

```bash
GET /api/v1/follow/following?followingRole=professionalClub
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Successfully created (followed) |
| 400 | Bad request (invalid data, cannot follow self, etc.) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not found (employer doesn't exist, not following) |
| 409 | Conflict (already following) |
| 500 | Internal server error |

---

## Rate Limiting
Consider implementing rate limiting for follow/unfollow actions to prevent abuse.

## Future Enhancements
1. **Notifications**: Send notifications when someone follows an employer
2. **Recommendations**: Suggest employers to follow based on user preferences
3. **Mutual Follows**: Identify when two employers follow each other
4. **Follow Activity Feed**: Show recent follow activities
5. **Batch Operations**: Allow following multiple employers at once
6. **Analytics**: Track follow trends over time
