# Frontend Integration Guide - Socket.IO Chat System

## Quick Start

### 1. Installation

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

### 2. Basic Connection

```javascript
import { io } from 'socket.io-client';

// Get JWT token from your auth system
const token = localStorage.getItem('authToken');

// Connect to socket server
const socket = io('http://localhost:5000', {
  auth: {
    token: token // or 'Bearer ' + token
  },
  transports: ['websocket', 'polling']
});

// Listen for connection success
socket.on('connected', (data) => {
  console.log('Connected:', data.userId);
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});
```

## Essential Events

### 1. Sending Messages

```javascript
function sendMessage(chatId, receiverId, message) {
  socket.emit('send_message', {
    chatId: chatId,
    receiverId: receiverId,
    content: message,
    messageType: 'text'
  }, (response) => {
    if (response.error) {
      alert('Error: ' + response.error.message);
    } else {
      console.log('Message sent:', response.message);
    }
  });
}
```

### 2. Receiving Messages

```javascript
socket.on('new_message', (data) => {
  const message = data.message;
  // Add message to UI
  addMessageToChat(message);
  // Show notification
  showNotification('New message from ' + message.senderId.firstName);
});
```

### 3. Typing Indicators

```javascript
// Start typing
function onTypingStart(chatId, receiverId) {
  socket.emit('typing_start', { chatId, receiverId });
}

// Stop typing (call after 2 seconds of no typing)
function onTypingStop(chatId, receiverId) {
  socket.emit('typing_stop', { chatId, receiverId });
}

// Receive typing events
socket.on('user_typing', (data) => {
  showTypingIndicator(data.chatId, data.userId);
});

socket.on('user_stopped_typing', (data) => {
  hideTypingIndicator(data.chatId, data.userId);
});
```

### 4. Mark Messages as Read

```javascript
function markAsRead(chatId) {
  socket.emit('mark_messages_read', { chatId }, (response) => {
    if (response.success) {
      console.log('Messages marked as read');
    }
  });
}

// When other user reads your messages
socket.on('messages_read_by_other', (data) => {
  updateMessageReadStatus(data.chatId);
});
```

### 5. Block/Unblock Users

```javascript
// Block user
function blockUser(chatId) {
  socket.emit('block_user', { chatId }, (response) => {
    if (response.error) {
      alert('Error: ' + response.error.message);
    } else {
      disableChat(chatId);
      alert('User blocked successfully');
    }
  });
}

// Unblock user
function unblockUser(chatId) {
  socket.emit('unblock_user', { chatId }, (response) => {
    if (response.success) {
      enableChat(chatId);
      alert('User unblocked successfully');
    }
  });
}

// When you get blocked
socket.on('you_were_blocked', (data) => {
  disableChat(data.chatId);
  showMessage('You have been blocked by this user');
});

// When you get unblocked
socket.on('you_were_unblocked', (data) => {
  enableChat(data.chatId);
  showMessage('You have been unblocked');
});
```

### 6. Online/Offline Status

```javascript
// Get online users
socket.emit('get_online_users', (response) => {
  updateOnlineStatus(response.onlineUsers);
});

// User comes online
socket.on('user_online', (data) => {
  setUserOnline(data.userId);
});

// User goes offline
socket.on('user_offline', (data) => {
  setUserOffline(data.userId);
});
```

## React Hook Example

```javascript
import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connected', () => {
      setConnected(true);
    });

    newSocket.on('user_online', (data) => {
      setOnlineUsers(prev => [...prev, data.userId]);
    });

    newSocket.on('user_offline', (data) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const sendMessage = useCallback((chatId, receiverId, content, messageType = 'text') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('send_message', {
        chatId,
        receiverId,
        content,
        messageType
      }, (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.message);
        }
      });
    });
  }, [socket]);

  const markAsRead = useCallback((chatId) => {
    if (!socket) return;
    socket.emit('mark_messages_read', { chatId });
  }, [socket]);

  const blockUser = useCallback((chatId) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('block_user', { chatId }, (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.chat);
        }
      });
    });
  }, [socket]);

  return {
    socket,
    connected,
    onlineUsers,
    sendMessage,
    markAsRead,
    blockUser
  };
}

// Usage in component
function ChatComponent({ token, chatId, receiverId }) {
  const { socket, connected, sendMessage } = useSocket(token);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket]);

  const handleSend = async (content) => {
    try {
      const message = await sendMessage(chatId, receiverId, content);
      setMessages(prev => [...prev, message]);
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    }
  };

  return (
    <div>
      <div>Status: {connected ? 'Connected' : 'Disconnected'}</div>
      {/* Your chat UI */}
    </div>
  );
}
```

## Vue.js Example

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export function useSocket(token) {
  const socket = ref(null);
  const connected = ref(false);

  onMounted(() => {
    socket.value = io('http://localhost:5000', {
      auth: { token: token.value }
    });

    socket.value.on('connected', () => {
      connected.value = true;
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });

  const sendMessage = (chatId, receiverId, content) => {
    return new Promise((resolve, reject) => {
      socket.value.emit('send_message', {
        chatId,
        receiverId,
        content,
        messageType: 'text'
      }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.message);
        }
      });
    });
  };

  return {
    socket,
    connected,
    sendMessage
  };
}
```

## Error Handling

```javascript
socket.on('error', (error) => {
  switch (error.code) {
    case 'AUTHENTICATION_ERROR':
      // Redirect to login
      window.location.href = '/login';
      break;
    case 'BLOCKED_USER':
      // Show blocked message
      showBlockedMessage();
      break;
    case 'VALIDATION_ERROR':
      // Show validation error
      alert(error.message);
      break;
    default:
      // Show generic error
      console.error('Socket error:', error);
  }
});
```

## Best Practices

### 1. Connection Management

```javascript
// Disconnect when user logs out
function logout() {
  if (socket) {
    socket.disconnect();
  }
  // Clear auth token
  localStorage.removeItem('authToken');
  // Redirect to login
  window.location.href = '/login';
}
```

### 2. Reconnection Handling

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server disconnected, manually reconnect
    socket.connect();
  }
  // Otherwise socket will automatically try to reconnect
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Refresh data or resync state
});
```

### 3. Memory Management

```javascript
useEffect(() => {
  // Set up listeners
  socket.on('new_message', handleNewMessage);
  socket.on('user_typing', handleTyping);

  // Clean up listeners
  return () => {
    socket.off('new_message', handleNewMessage);
    socket.off('user_typing', handleTyping);
  };
}, [socket]);
```

### 4. Optimizing Typing Indicators

```javascript
let typingTimeout;

function handleTyping() {
  // Clear previous timeout
  clearTimeout(typingTimeout);
  
  // Emit typing start
  socket.emit('typing_start', { chatId, receiverId });
  
  // Set timeout to emit typing stop
  typingTimeout = setTimeout(() => {
    socket.emit('typing_stop', { chatId, receiverId });
  }, 2000);
}
```

## HTTP API Integration

Use HTTP endpoints alongside sockets for initial data loading:

```javascript
// Fetch initial chat list
async function loadChats() {
  const response = await fetch('http://localhost:5000/api/chat/my-chats', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  const data = await response.json();
  return data.data;
}

// Fetch messages for a chat
async function loadMessages(chatId, page = 1) {
  const response = await fetch(
    `http://localhost:5000/api/message/chat/${chatId}?page=${page}`,
    {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
  );
  const data = await response.json();
  return data.data;
}
```

## Testing

```javascript
// Test connection
function testConnection() {
  socket.emit('ping', (response) => {
    console.log('Ping response:', response);
  });
}

// Test message sending
function testMessage() {
  sendMessage('test_chat_id', 'test_receiver_id', 'Test message')
    .then(msg => console.log('Test successful:', msg))
    .catch(err => console.error('Test failed:', err));
}
```

## Common Issues

### Issue: "Authentication error"
**Solution**: Ensure token is valid and not expired. Check token format.

### Issue: Messages not delivering
**Solution**: Check if chat is blocked. Verify both users are in the chat.

### Issue: Connection keeps dropping
**Solution**: Check network stability. Verify server is running. Check CORS settings.

### Issue: Duplicate messages
**Solution**: Remove old event listeners before adding new ones.

## Support

For issues or questions:
1. Check the main SOCKET_DOCUMENTATION.md
2. Review error messages in browser console
3. Check network tab for socket connections
4. Verify JWT token is valid

## Environment Configuration

```javascript
// config.js
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Use in your code
const socket = io(SOCKET_URL, {
  auth: { token }
});
```
