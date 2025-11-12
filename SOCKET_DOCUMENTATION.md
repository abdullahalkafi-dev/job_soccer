# Socket.IO Chat & Messaging System

## Overview

This is a complete real-time chat and messaging system built with Socket.IO, featuring authentication, message delivery, typing indicators, blocking functionality, and comprehensive error handling.

## Features

- ✅ Real-time messaging between candidates and employers
- ✅ JWT-based socket authentication
- ✅ User blocking/unblocking functionality
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ Online/offline status tracking
- ✅ Comprehensive error handling
- ✅ Message pagination and search
- ✅ Media message support (images, videos, files)

## Architecture

### Directory Structure

```
src/
├── socket/
│   ├── socketInit.ts           # Socket initialization & authentication
│   ├── socketServer.ts         # Socket.IO server configuration
│   ├── socketErrorHandler.ts  # Error handling utilities
│   └── socketUtils.ts          # Helper functions
├── modules/
│   ├── chat/
│   │   ├── chat.model.ts       # Chat schema & model
│   │   ├── chat.service.ts     # Chat business logic
│   │   ├── chat.controller.ts  # HTTP endpoints
│   │   ├── chat.route.ts       # Route definitions
│   │   ├── chat.interface.ts   # TypeScript interfaces
│   │   └── chat.dto.ts         # Validation schemas
│   └── message/
│       ├── message.model.ts    # Message schema & model
│       ├── message.service.ts  # Message business logic
│       ├── message.controller.ts # HTTP endpoints
│       ├── message.route.ts    # Route definitions
│       ├── message.socket.ts   # Socket event handlers
│       ├── message.interface.ts # TypeScript interfaces
│       └── message.dto.ts      # Validation schemas
```

## API Endpoints

### Chat Endpoints

#### Create or Get Chat
```
POST /api/chat/create-or-get
Auth: Required (candidate, employer)
Body: {
  "otherUserId": "string"
}
```

#### Get User Chats
```
GET /api/chat/my-chats?page=1&limit=20
Auth: Required (candidate, employer)
```

#### Get Chat by ID
```
GET /api/chat/:chatId
Auth: Required (candidate, employer)
```

#### Block User
```
POST /api/chat/:chatId/block
Auth: Required (candidate, employer)
```

#### Unblock User
```
POST /api/chat/:chatId/unblock
Auth: Required (candidate, employer)
```

#### Get Blocked Chats
```
GET /api/chat/blocked
Auth: Required (candidate, employer)
```

#### Delete Chat
```
DELETE /api/chat/:chatId
Auth: Required (candidate, employer)
```

### Message Endpoints

#### Send Message (HTTP)
```
POST /api/message/send
Auth: Required (candidate, employer)
Body: {
  "chatId": "string",
  "receiverId": "string",
  "content": "string (optional)",
  "mediaUrl": "string (optional)",
  "messageType": "text|image|video|file"
}
```

#### Get Messages by Chat
```
GET /api/message/chat/:chatId?page=1&limit=50
Auth: Required (candidate, employer)
```

#### Mark Messages as Read
```
POST /api/message/chat/:chatId/mark-read
Auth: Required (candidate, employer)
```

#### Get Unread Message Count
```
GET /api/message/unread-count
Auth: Required (candidate, employer)
```

#### Search Messages
```
GET /api/message/chat/:chatId/search?searchTerm=keyword
Auth: Required (candidate, employer)
```

#### Delete Message
```
DELETE /api/message/:messageId
Auth: Required (candidate, employer)
```

## Socket.IO Events

### Client to Server Events

#### Connection
```javascript
// Connect with authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'Bearer YOUR_JWT_TOKEN'
  }
});

// Or using headers
const socket = io('http://localhost:5000', {
  extraHeaders: {
    Authorization: 'Bearer YOUR_JWT_TOKEN'
  }
});
```

#### Send Message
```javascript
socket.emit('send_message', {
  chatId: 'chat_id',
  receiverId: 'receiver_user_id',
  content: 'Hello!',
  messageType: 'text'
}, (response) => {
  if (response.error) {
    console.error('Error:', response.error);
  } else {
    console.log('Message sent:', response.message);
  }
});
```

#### Mark Messages as Read
```javascript
socket.emit('mark_messages_read', {
  chatId: 'chat_id'
}, (response) => {
  if (response.success) {
    console.log('Messages marked as read');
  }
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing_start', {
  chatId: 'chat_id',
  receiverId: 'receiver_user_id'
});

// Stop typing
socket.emit('typing_stop', {
  chatId: 'chat_id',
  receiverId: 'receiver_user_id'
});
```

#### Block User
```javascript
socket.emit('block_user', {
  chatId: 'chat_id'
}, (response) => {
  if (response.error) {
    console.error('Error:', response.error);
  } else {
    console.log('User blocked:', response.chat);
  }
});
```

#### Unblock User
```javascript
socket.emit('unblock_user', {
  chatId: 'chat_id'
}, (response) => {
  if (response.success) {
    console.log('User unblocked');
  }
});
```

#### Get Online Users
```javascript
socket.emit('get_online_users', (response) => {
  console.log('Online users:', response.onlineUsers);
  console.log('Count:', response.count);
});
```

#### Ping (Health Check)
```javascript
socket.emit('ping', (response) => {
  console.log('Pong received:', response);
});
```

#### Manual Disconnect
```javascript
socket.emit('manual_disconnect');
```

### Server to Client Events

#### Connection Success
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // { success: true, userId: 'xxx', socketId: 'yyy', message: 'Connected successfully' }
});
```

#### New Message Received
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  // Display notification or update UI
});
```

#### Message Sent Confirmation
```javascript
socket.on('message_sent', (data) => {
  console.log('Message sent successfully:', data.message);
});
```

#### Chat Updated
```javascript
socket.on('chat_updated', (data) => {
  console.log('Chat updated:', data.chatId);
  // Refresh chat list or update specific chat
});
```

#### Messages Marked as Read
```javascript
socket.on('messages_marked_read', (data) => {
  console.log('Messages marked as read in chat:', data.chatId);
});
```

#### Messages Read by Other User
```javascript
socket.on('messages_read_by_other', (data) => {
  console.log('Messages read by:', data.readByUserId);
  // Update UI to show read status
});
```

#### Typing Indicators
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data.userId, 'in chat:', data.chatId);
  // Show typing indicator
});

socket.on('user_stopped_typing', (data) => {
  console.log('User stopped typing:', data.userId);
  // Hide typing indicator
});
```

#### User Blocked
```javascript
socket.on('user_blocked', (data) => {
  console.log('User blocked successfully:', data.chat);
});

socket.on('you_were_blocked', (data) => {
  console.log('You were blocked by:', data.blockedByUserId);
  // Disable messaging in this chat
});
```

#### User Unblocked
```javascript
socket.on('user_unblocked', (data) => {
  console.log('User unblocked successfully');
});

socket.on('you_were_unblocked', (data) => {
  console.log('You were unblocked by:', data.unblockedByUserId);
  // Re-enable messaging in this chat
});
```

#### Online/Offline Status
```javascript
socket.on('user_online', (data) => {
  console.log('User came online:', data.userId);
  // Update user status in UI
});

socket.on('user_offline', (data) => {
  console.log('User went offline:', data.userId);
  // Update user status in UI
});
```

#### Online Users List
```javascript
socket.on('online_users', (data) => {
  console.log('Online users:', data.onlineUsers);
  console.log('Total count:', data.count);
});
```

#### Errors
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // {
  //   code: 'ERROR_CODE',
  //   message: 'Error message',
  //   details: {...},
  //   timestamp: 1234567890
  // }
});
```

#### Connection Errors
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // Handle authentication or connection issues
});
```

## Error Codes

```typescript
enum SocketErrorCode {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BLOCKED_USER = "BLOCKED_USER",
  RATE_LIMIT = "RATE_LIMIT",
}
```

## Data Models

### Chat Model
```typescript
{
  _id: ObjectId,
  users: [ObjectId, ObjectId],      // Two user IDs
  latestMessage: ObjectId,           // Reference to Message
  isBlocked: boolean,
  blockedBy: ObjectId,               // User who blocked
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```typescript
{
  _id: ObjectId,
  chatId: ObjectId,                  // Reference to Chat
  senderId: ObjectId,                // Reference to User
  receiverId: ObjectId,              // Reference to User
  content: string,                   // Optional
  mediaUrl: string,                  // Optional
  messageType: 'text|image|video|file',
  isRead: boolean,
  isDeleted: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### React/Frontend Example

```javascript
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

function ChatComponent({ authToken, chatId, receiverId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token: authToken }
    });

    newSocket.on('connected', (data) => {
      console.log('Connected to socket server');
    });

    newSocket.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    newSocket.on('user_typing', (data) => {
      if (data.chatId === chatId) {
        setTyping(true);
      }
    });

    newSocket.on('user_stopped_typing', (data) => {
      if (data.chatId === chatId) {
        setTyping(false);
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [authToken, chatId]);

  const sendMessage = () => {
    if (!message.trim() || !socket) return;

    socket.emit('send_message', {
      chatId,
      receiverId,
      content: message,
      messageType: 'text'
    }, (response) => {
      if (response.error) {
        alert(response.error.message);
      } else {
        setMessages(prev => [...prev, response.message]);
        setMessage('');
      }
    });
  };

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing_start', { chatId, receiverId });
    
    // Stop typing after 2 seconds of inactivity
    setTimeout(() => {
      socket.emit('typing_stop', { chatId, receiverId });
    }, 2000);
  };

  const blockUser = () => {
    if (!socket) return;
    socket.emit('block_user', { chatId }, (response) => {
      if (response.error) {
        alert(response.error.message);
      } else {
        alert('User blocked successfully');
      }
    });
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg._id}>{msg.content}</div>
        ))}
        {typing && <div>User is typing...</div>}
      </div>
      
      <input
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
      />
      
      <button onClick={sendMessage}>Send</button>
      <button onClick={blockUser}>Block User</button>
    </div>
  );
}
```

## Security Features

1. **JWT Authentication**: All socket connections require valid JWT tokens
2. **Authorization Checks**: Users can only access their own chats and messages
3. **Block Functionality**: Users can block others from sending them messages
4. **Input Validation**: All inputs are validated using Zod schemas
5. **Error Handling**: Comprehensive error handling with proper error codes

## Performance Optimizations

1. **Database Indexes**: Optimized queries with proper indexing
2. **Pagination**: Messages and chats are paginated
3. **Connection Management**: Automatic cleanup of disconnected users
4. **Efficient Lookups**: Fast user lookup using Maps

## Testing

Use the Socket.IO client test tool or create a simple HTML test page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Socket.IO Chat Test</h1>
  <div id="status">Disconnected</div>
  <button onclick="connect()">Connect</button>
  <button onclick="sendMessage()">Send Message</button>
  
  <script>
    let socket;
    
    function connect() {
      const token = prompt('Enter JWT token:');
      socket = io('http://localhost:5000', {
        auth: { token: token }
      });
      
      socket.on('connected', (data) => {
        document.getElementById('status').textContent = 'Connected: ' + data.userId;
      });
      
      socket.on('new_message', (data) => {
        console.log('New message:', data);
      });
    }
    
    function sendMessage() {
      const chatId = prompt('Enter chat ID:');
      const receiverId = prompt('Enter receiver ID:');
      const content = prompt('Enter message:');
      
      socket.emit('send_message', {
        chatId,
        receiverId,
        content,
        messageType: 'text'
      }, (response) => {
        console.log('Response:', response);
      });
    }
  </script>
</body>
</html>
```

## Troubleshooting

### Connection Issues
- Ensure JWT token is valid and not expired
- Check CORS configuration in socketServer.ts
- Verify the server is running and accessible

### Message Delivery Issues
- Check if both users are in the same chat
- Verify the chat is not blocked
- Check socket connection status

### Authentication Errors
- Ensure token is passed correctly in auth or headers
- Verify token format: "Bearer TOKEN" or just "TOKEN"
- Check token expiration

## Future Enhancements

- [ ] Message encryption
- [ ] File upload progress tracking
- [ ] Voice/video call support
- [ ] Message reactions
- [ ] Group chat support
- [ ] Message forwarding
- [ ] Push notifications integration
- [ ] Rate limiting per user
- [ ] Redis adapter for horizontal scaling
