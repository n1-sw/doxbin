# SCXBIN - Complete API Documentation

## Overview
SCXBIN uses both internal REST APIs and real-time WebSocket connections. Here's everything you need to know.

---

## INTERNAL APIs (Backend)

### Authentication APIs

#### 1. Register User
```
POST /api/register
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "securepassword"
}

Response (201):
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

#### 2. Login User
```
POST /api/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (200):
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "is_admin": false
  }
}
```

#### 3. Logout User
```
POST /api/logout
Response (200):
{
  "success": true
}
```

#### 4. Get Current User
```
GET /api/user
Response (200):
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "is_admin": false
  }
}
```

---

### Post APIs

#### 5. Get All Posts
```
GET /api/posts
Response (200):
{
  "posts": [
    {
      "id": 1,
      "title": "Security Vulnerability Report",
      "content": "Details about a critical security issue...",
      "risk_level": "high",
      "uploader_name": "admin",
      "image_url": "/uploads/image1.png",
      "video_url": null,
      "media_type": "image",
      "views": 1250,
      "comments": 5,
      "created_at": "2025-11-22T10:30:00Z"
    }
  ]
}
```

#### 6. Get Single Post
```
GET /api/posts/:id

Response (200):
{
  "post": {
    "id": 1,
    "title": "Security Vulnerability Report",
    "content": "Details...",
    "risk_level": "high",
    "uploader_name": "admin",
    "views": 1251,  // Incremented by 1
    "comments": 5,
    "created_at": "2025-11-22T10:30:00Z"
  }
}
```

#### 7. Create Post (Admin Only)
```
POST /api/posts
Content-Type: multipart/form-data
Authorization: Required (admin only)

Body:
{
  "title": "New Security Alert",
  "content": "Details about the threat...",
  "risk_level": "critical",  // low, medium, high, critical
  "media": <file> (optional - image or video)
}

Response (201):
{
  "success": true,
  "post": {
    "id": 2,
    "title": "New Security Alert",
    "risk_level": "critical",
    ...
  }
}
```

#### 8. Delete Post (Admin Only)
```
DELETE /api/posts/:id
Authorization: Required (admin only)

Response (200):
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### Comment APIs

#### 9. Get Comments for Post
```
GET /api/posts/:id/comments

Response (200):
{
  "comments": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "username": "security_expert",
      "content": "Great analysis, thanks for sharing!",
      "created_at": "2025-11-22T11:00:00Z"
    }
  ]
}
```

#### 10. Create Comment
```
POST /api/posts/:id/comments
Content-Type: application/json
Authorization: Required (authenticated users)

Body:
{
  "content": "This is a valuable insight. Thanks!"
}

Response (201):
{
  "success": true,
  "comment": {
    "id": 2,
    "post_id": 1,
    "user_id": 2,
    "content": "This is a valuable insight. Thanks!",
    "created_at": "2025-11-22T11:05:00Z"
  }
}
```

---

### View Counter API

#### 11. Get Real-time View Count
```
GET /api/posts/:id/views

Response (200):
{
  "views": 1251
}
```

---

## REAL-TIME APIS (WebSocket via Socket.IO)

### Live Chat System

#### 12. Load Previous Messages
```javascript
// Client emits:
socket.emit('load_messages');

// Server responds with:
socket.on('chat_history', (messages) => {
  messages.forEach(msg => {
    console.log(`${msg.username}: ${msg.content}`);
  });
});
```

#### 13. Send Chat Message
```javascript
// Client emits:
socket.emit('send_message', {
  content: 'Hello everyone!'
});

// Server broadcasts to all connected users:
socket.on('new_message', (message) => {
  console.log(`${message.username}: ${message.content}`);
});
```

#### 14. User Connected
```javascript
// Server emits when user joins:
socket.on('user_connected', (userData) => {
  console.log(`${userData.username} joined the chat`);
});
```

---

## OPTIONAL EXTERNAL APIs (Recommended for Enhancement)

### Authentication Services (Optional)

#### OAuth Integration (Google, GitHub)
Currently: Basic email/password  
Recommended: Add OAuth for easier login

```javascript
// Not yet implemented
// Would add:
// - Google Sign-In API
// - GitHub OAuth
// - Microsoft Authentication
```

### Email Service (Optional)

#### SendGrid / Mailgun
```
Purpose: Send email notifications
- User registration confirmation
- Password reset links
- Comment notifications
- Post alerts

Required if implementing:
- Email verification
- Forgot password feature
- Email notifications
```

### File Storage (Required for Cloudflare)

#### Cloudflare R2 / AWS S3
```
Purpose: Store uploaded images and videos
Current: Local file storage (/public/uploads/)
For production: Use R2 or S3

API Example:
POST https://r2-bucket.example.com/upload
- Upload image files
- Upload video files
- Generate presigned URLs
```

### Analytics (Optional)

#### Google Analytics / Mixpanel
```
Purpose: Track user behavior
- Page views
- User interactions
- Post engagement
- Comment activity

Would require: Tracking pixel / SDK integration
```

### Search (Optional)

#### Elasticsearch / Algolia
```
Purpose: Search posts and comments
Current: None implemented
If added: Full-text search functionality

API Example:
GET /api/search?q="security vulnerability"
```

---

## INTERNAL DATABASE APIs

### PostgreSQL (Current Production)

**Tables:**
- `users` - User accounts and admin flags
- `posts` - Blog posts with media
- `comments` - User comments on posts
- `session` - Express session storage
- `chat_messages` - Live chat messages (if enabled)

### MongoDB (Optional - Not Yet Integrated)

**Collections:**
- `useradmins` - User/admin profile data
- `websitedata` - Settings and configuration
- `analytics` - Event logging

**Currently:** Can be enabled with `MONGODB_URL` environment variable

### Cloudflare D1 (For Workers Deployment)

**Tables:** Same as PostgreSQL (converted to SQLite)
- `users`
- `posts`
- `comments`
- `chat_messages`

---

## AUTHENTICATION FLOW

```
1. User registers → /api/register
   ↓
2. User logs in → /api/login → Session created
   ↓
3. Authenticated requests include session cookie
   ↓
4. Protected endpoints check requireAuth middleware
   ↓
5. Admin-only endpoints check requireAdmin middleware
```

**Session Management:**
- Cookie-based (express-session)
- Stored in PostgreSQL
- 30-day expiration
- httpOnly flag for security

---

## ERROR CODES & RESPONSES

### Success Responses
```
200 OK          - Request successful
201 Created     - Resource created
204 No Content  - Request successful, no response body
```

### Error Responses
```
400 Bad Request      - Invalid input
401 Unauthorized     - Not authenticated
403 Forbidden        - Authenticated but not authorized
404 Not Found        - Resource doesn't exist
500 Server Error     - Internal error
```

**Error Response Format:**
```json
{
  "error": "Description of what went wrong"
}
```

---

## RATE LIMITING (Recommended)

**Currently:** None implemented

**Recommended limits:**
- Registration: 5 per hour per IP
- Login: 10 per hour per IP
- Comment: 30 per hour per user
- Post creation: 10 per day per admin
- Chat messages: 100 per hour per user

Implementation options:
- Cloudflare Workers (built-in rate limiting)
- Express middleware (express-rate-limit)
- Nginx/Reverse proxy rules

---

## SECURITY HEADERS

**Currently implemented:**
- Cache-Control: no-cache (prevent stale content)
- httpOnly cookies (prevent XSS)
- CORS enabled (allow cross-origin)

**Recommended additions:**
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HTTPS only)
- Content-Security-Policy
- X-XSS-Protection

---

## API VERSIONING

**Current:** v1 (implicit)

**Future consideration:** Add `/api/v2/` endpoints without breaking v1

---

## WEBHOOK APIs (Not Yet Implemented)

### Potential Webhooks
```
POST /webhooks/post-created
POST /webhooks/comment-posted
POST /webhooks/post-deleted
POST /webhooks/user-registered
```

Would allow:
- External services to react to events
- Integration with Discord, Slack
- Automated alerts

---

## TESTING APIS

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"pass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

**Get Posts:**
```bash
curl http://localhost:5000/api/posts
```

**Create Post (Admin):**
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Content","risk_level":"high"}' \
  -b "connect.sid=YOUR_SESSION_COOKIE"
```

---

## SUMMARY

### Currently Available (12 endpoints):
✓ Authentication (register, login, logout, get user)
✓ Posts (get all, get one, create, delete)
✓ Comments (get, create)
✓ View counting
✓ Real-time chat (Socket.IO)

### Recommended Additions:
- Email verification service
- File storage (R2/S3)
- Search functionality
- Rate limiting
- Analytics tracking

### For Cloudflare Deployment:
- Replace PostgreSQL with D1
- Implement JWT tokens (instead of cookies)
- Use R2 for file uploads
- Configure edge caching
