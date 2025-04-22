# CareAI API Documentation

This document outlines the Supabase API endpoints used in CareAI.

## Authentication

### Sign Up
```typescript
POST /auth/v1/signup
Content-Type: application/json
{
  "email": string,
  "password": string,
  "data": {
    "name": string,
    "role": "senior" | "caregiver" | "medical"
  }
}
```

### Sign In
```typescript
POST /auth/v1/token?grant_type=password
Content-Type: application/json
{
  "email": string,
  "password": string
}
```

### Password Reset
```typescript
POST /auth/v1/recover
Content-Type: application/json
{
  "email": string
}
```

## Chat

### Get Chat History
```typescript
GET /rest/v1/chat_messages
?select=*
&user_id=eq.{userId}
&order=created_at.desc
Authorization: Bearer {access_token}
```

### Send Message
```typescript
POST /rest/v1/chat_messages
Content-Type: application/json
Authorization: Bearer {access_token}
{
  "user_id": string,
  "content": string,
  "type": "text" | "audio" | "image",
  "metadata": object
}
```

## Reminders

### Get Reminders
```typescript
GET /rest/v1/reminders
?select=*
&user_id=eq.{userId}
&active=eq.true
Authorization: Bearer {access_token}
```

### Create Reminder
```typescript
POST /rest/v1/reminders
Content-Type: application/json
Authorization: Bearer {access_token}
{
  "user_id": string,
  "title": string,
  "description": string,
  "type": "medication" | "appointment" | "general",
  "schedule": {
    "type": "once" | "daily" | "weekly" | "monthly",
    "time": string,
    "days"?: number[],
    "date"?: string
  },
  "metadata": object
}
```

### Update Reminder
```typescript
PATCH /rest/v1/reminders
?id=eq.{reminderId}
Content-Type: application/json
Authorization: Bearer {access_token}
{
  "title"?: string,
  "description"?: string,
  "schedule"?: object,
  "active"?: boolean
}
```

## SOS

### Get Emergency Contacts
```typescript
GET /rest/v1/emergency_contacts
?select=*
&user_id=eq.{userId}
Authorization: Bearer {access_token}
```

### Create Emergency Contact
```typescript
POST /rest/v1/emergency_contacts
Content-Type: application/json
Authorization: Bearer {access_token}
{
  "user_id": string,
  "name": string,
  "phone": string,
  "relationship": string,
  "type": "primary" | "backup",
  "notification_preferences": {
    "sms": boolean,
    "call": boolean,
    "email": boolean
  }
}
```

### Trigger SOS
```typescript
POST /rest/v1/rpc/trigger_sos
Content-Type: application/json
Authorization: Bearer {access_token}
{
  "user_id": string,
  "location": {
    "latitude": number,
    "longitude": number
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 401  | Unauthorized - Invalid or expired token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Resource already exists |
| 422  | Validation Error - Invalid request data |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

## Rate Limits

- Authentication endpoints: 20 requests per minute
- Chat endpoints: 60 requests per minute
- Reminder endpoints: 30 requests per minute
- SOS endpoints: 10 requests per minute

## Authentication Headers

All authenticated endpoints require:
```typescript
Authorization: Bearer {access_token}
apikey: {anon_key}
```

## Response Format

Success response:
```typescript
{
  "data": T[],
  "error": null
}
```

Error response:
```typescript
{
  "data": null,
  "error": {
    "message": string,
    "code": number,
    "details"?: string
  }
}
``` 