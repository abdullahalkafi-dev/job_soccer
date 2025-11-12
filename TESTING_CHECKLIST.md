# Quick Start Checklist - Chat & Messaging System

## ✅ Pre-Implementation Checklist (Completed)

- [x] Chat model created with blocking functionality
- [x] Message model created with all message types
- [x] Chat service with all business logic
- [x] Message service with all business logic
- [x] HTTP endpoints for chat operations
- [x] HTTP endpoints for message operations
- [x] Socket.IO server configuration
- [x] Socket authentication middleware
- [x] Socket event handlers for messaging
- [x] Error handling utilities
- [x] Data validation (DTOs)
- [x] Routes registered in main router
- [x] Comprehensive documentation

## 📋 Testing Checklist

### 1. Start the Server
```bash
# Development mode
npm run dev
# or
make dev
```

- [ ] Server starts without errors
- [ ] Socket.IO initializes successfully
- [ ] MongoDB connection established
- [ ] Routes are registered correctly

### 2. Test Authentication
```bash
# Login to get JWT token
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

- [ ] Login successful
- [ ] JWT token received
- [ ] Token saved for subsequent requests

### 3. Test Chat HTTP Endpoints

#### Create Chat
```bash
POST http://localhost:5000/api/chat/create-or-get
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "otherUserId": "OTHER_USER_ID"
}
```

- [ ] Chat created successfully
- [ ] Chat ID received
- [ ] Users array contains both user IDs

#### Get User Chats
```bash
GET http://localhost:5000/api/chat/my-chats?page=1&limit=20
Authorization: Bearer YOUR_TOKEN
```

- [ ] Chats list returned
- [ ] Pagination works
- [ ] Latest messages populated

#### Block User
```bash
POST http://localhost:5000/api/chat/CHAT_ID/block
Authorization: Bearer YOUR_TOKEN
```

- [ ] User blocked successfully
- [ ] Chat marked as blocked
- [ ] blockedBy field set correctly

#### Unblock User
```bash
POST http://localhost:5000/api/chat/CHAT_ID/unblock
Authorization: Bearer YOUR_TOKEN
```

- [ ] User unblocked successfully
- [ ] Chat blocking removed

### 4. Test Message HTTP Endpoints

#### Send Message
```bash
POST http://localhost:5000/api/message/send
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "chatId": "CHAT_ID",
  "receiverId": "RECEIVER_ID",
  "content": "Hello, this is a test message!",
  "messageType": "text"
}
```

- [ ] Message sent successfully
- [ ] Message ID returned
- [ ] Chat's latest message updated

#### Get Messages
```bash
GET http://localhost:5000/api/message/chat/CHAT_ID?page=1&limit=50
Authorization: Bearer YOUR_TOKEN
```

- [ ] Messages returned
- [ ] Pagination works
- [ ] Messages sorted by date

#### Mark as Read
```bash
POST http://localhost:5000/api/message/chat/CHAT_ID/mark-read
Authorization: Bearer YOUR_TOKEN
```

- [ ] Messages marked as read
- [ ] isRead flag updated in database

#### Get Unread Count
```bash
GET http://localhost:5000/api/message/unread-count
Authorization: Bearer YOUR_TOKEN
```

- [ ] Unread count returned
- [ ] Count is accurate

### 5. Test Socket.IO Connection

Open browser console or use the HTML test client:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connected', (data) => {
  console.log('Connected:', data);
});
```

- [ ] Connection successful
- [ ] 'connected' event received
- [ ] User ID in response data

### 6. Test Socket Events

#### Send Message via Socket
```javascript
socket.emit('send_message', {
  chatId: 'CHAT_ID',
  receiverId: 'RECEIVER_ID',
  content: 'Test socket message',
  messageType: 'text'
}, (response) => {
  console.log('Response:', response);
});
```

- [ ] Message sent successfully
- [ ] Callback received with message data
- [ ] 'message_sent' event received

#### Receive Messages
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
});
```

- [ ] Event listener set up
- [ ] Receives messages from other users
- [ ] Message data is complete

#### Typing Indicators
```javascript
socket.emit('typing_start', {
  chatId: 'CHAT_ID',
  receiverId: 'RECEIVER_ID'
});

socket.on('user_typing', (data) => {
  console.log('User typing:', data.userId);
});
```

- [ ] Typing start emitted
- [ ] Other user receives 'user_typing' event
- [ ] Typing stop works similarly

#### Block User via Socket
```javascript
socket.emit('block_user', {
  chatId: 'CHAT_ID'
}, (response) => {
  console.log('Response:', response);
});

socket.on('you_were_blocked', (data) => {
  console.log('Blocked by:', data.blockedByUserId);
});
```

- [ ] Block successful
- [ ] Blocked user receives notification
- [ ] Cannot send messages when blocked

#### Online Status
```javascript
socket.emit('get_online_users', (response) => {
  console.log('Online users:', response.onlineUsers);
});

socket.on('user_online', (data) => {
  console.log('User online:', data.userId);
});

socket.on('user_offline', (data) => {
  console.log('User offline:', data.userId);
});
```

- [ ] Online users list received
- [ ] User online events work
- [ ] User offline events work

### 7. Test Error Handling

#### Invalid Token
```javascript
const badSocket = io('http://localhost:5000', {
  auth: { token: 'invalid_token' }
});

badSocket.on('connect_error', (error) => {
  console.log('Error:', error.message);
});
```

- [ ] Connection rejected
- [ ] Error message received
- [ ] Socket not connected

#### Invalid Data
```javascript
socket.emit('send_message', {
  chatId: '',
  receiverId: ''
}, (response) => {
  console.log('Error:', response.error);
});
```

- [ ] Validation error returned
- [ ] Clear error message
- [ ] No server crash

#### Blocked User Scenario
```javascript
// User A blocks User B, then User B tries to send message
socket.emit('send_message', {
  chatId: 'CHAT_ID',
  receiverId: 'USER_A_ID',
  content: 'This should fail'
}, (response) => {
  console.log('Expected error:', response.error);
});
```

- [ ] Message rejected
- [ ] "Blocked" error message
- [ ] Chat functionality disabled

### 8. Test Two-User Scenario

Open two browsers/tabs with different users:

**User 1:**
```javascript
socket1.emit('send_message', {
  chatId: 'CHAT_ID',
  receiverId: 'USER_2_ID',
  content: 'Hello User 2!'
}, (response) => {
  console.log('Sent:', response);
});
```

**User 2:**
```javascript
socket2.on('new_message', (data) => {
  console.log('Received:', data.message.content);
  // Should log: "Hello User 2!"
});
```

- [ ] User 1 sends message
- [ ] User 2 receives message in real-time
- [ ] User 2 sends reply
- [ ] User 1 receives reply
- [ ] Chat updates on both sides

### 9. Test Blocking Flow

**User 1 blocks User 2:**
```javascript
socket1.emit('block_user', { chatId: 'CHAT_ID' });
```

- [ ] User 1 blocks successfully
- [ ] User 2 receives 'you_were_blocked' event

**User 2 tries to send message:**
```javascript
socket2.emit('send_message', {
  chatId: 'CHAT_ID',
  receiverId: 'USER_1_ID',
  content: 'Can you see this?'
}, (response) => {
  console.log('Expected error:', response.error);
});
```

- [ ] Message fails
- [ ] Error indicates blocking

**User 1 unblocks User 2:**
```javascript
socket1.emit('unblock_user', { chatId: 'CHAT_ID' });
```

- [ ] Unblock successful
- [ ] User 2 receives 'you_were_unblocked' event
- [ ] User 2 can send messages again

### 10. Performance Testing

- [ ] Load test with HTML client
- [ ] Test with 10+ concurrent connections
- [ ] Monitor server memory usage
- [ ] Check database query performance
- [ ] Test message delivery latency

## 🚀 Production Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection secure
- [ ] JWT secret is strong and secret
- [ ] CORS configured for production domain
- [ ] Socket.IO transports configured
- [ ] Error logging set up
- [ ] Rate limiting implemented (future)
- [ ] SSL/TLS enabled
- [ ] MongoDB indexes created
- [ ] Backup strategy in place

## 📊 Monitoring Checklist

- [ ] Server logs monitored
- [ ] Socket connection count tracked
- [ ] Message delivery rate monitored
- [ ] Error rate monitored
- [ ] Database performance monitored
- [ ] User feedback collected

## 🔍 Common Issues to Check

- [ ] Server port not in use
- [ ] MongoDB is running
- [ ] JWT tokens not expired
- [ ] Correct user IDs in requests
- [ ] Chat IDs exist in database
- [ ] WebSocket not blocked by firewall
- [ ] CORS allows your frontend domain

## 📚 Documentation References

When you encounter issues, refer to:

1. **CHAT_IMPLEMENTATION_SUMMARY.md** - Overview of what's implemented
2. **SOCKET_DOCUMENTATION.md** - Complete API reference
3. **FRONTEND_INTEGRATION_DOCS/SOCKET_INTEGRATION_GUIDE.md** - Frontend integration
4. **FRONTEND_INTEGRATION_DOCS/SOCKET_TESTING_GUIDE.md** - Testing guide

## ✅ Sign-off Checklist

Before considering the implementation complete:

- [ ] All HTTP endpoints tested
- [ ] All socket events tested
- [ ] Error handling verified
- [ ] Blocking functionality works
- [ ] Real-time delivery confirmed
- [ ] Two-user scenarios tested
- [ ] Documentation reviewed
- [ ] Frontend team briefed
- [ ] Test credentials provided
- [ ] Production deployment planned

## 🎯 Next Steps After Testing

1. [ ] Integrate with frontend application
2. [ ] Add file upload for media messages
3. [ ] Implement push notifications
4. [ ] Add message reactions (optional)
5. [ ] Consider group chat (optional)
6. [ ] Set up monitoring and alerts
7. [ ] Plan for scaling (Redis adapter)

---

**Status**: Ready for Testing
**Last Updated**: November 10, 2025
**Implementation**: Complete ✅
