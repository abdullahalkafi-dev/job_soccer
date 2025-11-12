# Socket.IO Testing Guide

## Testing with Postman or Insomnia

### 1. Test HTTP Endpoints First

#### Get JWT Token
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Save the token from the response.

#### Create or Get Chat
```
POST http://localhost:5000/api/chat/create-or-get
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "otherUserId": "OTHER_USER_ID"
}
```

#### Get Your Chats
```
GET http://localhost:5000/api/chat/my-chats?page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Send Message (HTTP)
```
POST http://localhost:5000/api/message/send
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "chatId": "CHAT_ID",
  "receiverId": "RECEIVER_USER_ID",
  "content": "Hello, this is a test message!",
  "messageType": "text"
}
```

## Testing Socket.IO Events

### Option 1: Using Socket.IO Client Test Tool

Install the tool:
```bash
npm install -g socket.io-client
```

Create a test file `test-socket.js`:

```javascript
const io = require('socket.io-client');

const token = 'YOUR_JWT_TOKEN'; // Replace with actual token

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connected', (data) => {
  console.log('✅ Connected:', data);
  
  // Test sending a message
  socket.emit('send_message', {
    chatId: 'CHAT_ID',
    receiverId: 'RECEIVER_ID',
    content: 'Test message from Node.js client',
    messageType: 'text'
  }, (response) => {
    if (response.error) {
      console.error('❌ Error:', response.error);
    } else {
      console.log('✅ Message sent:', response.message);
    }
  });
});

socket.on('new_message', (data) => {
  console.log('📨 New message received:', data.message);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

// Keep the connection alive
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting...');
  socket.disconnect();
  process.exit();
});
```

Run the test:
```bash
node test-socket.js
```

### Option 2: Browser Console Test

Open browser console on any page and paste:

```javascript
// Load Socket.IO client
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
document.head.appendChild(script);

// Wait for script to load
script.onload = () => {
  const token = 'YOUR_JWT_TOKEN';
  
  const socket = io('http://localhost:5000', {
    auth: { token }
  });
  
  socket.on('connected', (data) => {
    console.log('Connected:', data);
  });
  
  socket.on('new_message', (data) => {
    console.log('New message:', data);
  });
  
  socket.on('error', (error) => {
    console.error('Error:', error);
  });
  
  // Make socket available globally for testing
  window.testSocket = socket;
  
  console.log('Socket ready! Use window.testSocket to interact');
};

// After connection, test sending a message:
window.testSocket.emit('send_message', {
  chatId: 'YOUR_CHAT_ID',
  receiverId: 'RECEIVER_ID',
  content: 'Test from browser!',
  messageType: 'text'
}, (response) => {
  console.log('Response:', response);
});
```

### Option 3: HTML Test Page

Create `socket-test.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Socket.IO Test Client</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    input, button, textarea {
      margin: 5px 0;
      padding: 8px;
      width: 100%;
      box-sizing: border-box;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
    #log {
      background: #f5f5f5;
      padding: 10px;
      height: 300px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
    }
    .success { color: green; }
    .error { color: red; }
    .info { color: blue; }
  </style>
</head>
<body>
  <h1>Socket.IO Chat Test Client</h1>
  
  <div class="section">
    <h3>Connection</h3>
    <input type="text" id="token" placeholder="JWT Token">
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()">Disconnect</button>
    <p>Status: <span id="status">Disconnected</span></p>
  </div>
  
  <div class="section">
    <h3>Send Message</h3>
    <input type="text" id="chatId" placeholder="Chat ID">
    <input type="text" id="receiverId" placeholder="Receiver User ID">
    <textarea id="message" rows="3" placeholder="Message content"></textarea>
    <button onclick="sendMessage()">Send Message</button>
  </div>
  
  <div class="section">
    <h3>Other Actions</h3>
    <input type="text" id="actionChatId" placeholder="Chat ID">
    <button onclick="markAsRead()">Mark Messages as Read</button>
    <button onclick="blockUser()">Block User</button>
    <button onclick="unblockUser()">Unblock User</button>
    <button onclick="getOnlineUsers()">Get Online Users</button>
    <button onclick="ping()">Ping Server</button>
  </div>
  
  <div class="section">
    <h3>Event Log</h3>
    <button onclick="clearLog()">Clear Log</button>
    <div id="log"></div>
  </div>

  <script>
    let socket = null;

    function log(message, type = 'info') {
      const logDiv = document.getElementById('log');
      const timestamp = new Date().toLocaleTimeString();
      const entry = document.createElement('div');
      entry.className = type;
      entry.textContent = `[${timestamp}] ${message}`;
      logDiv.appendChild(entry);
      logDiv.scrollTop = logDiv.scrollHeight;
    }

    function clearLog() {
      document.getElementById('log').innerHTML = '';
    }

    function connect() {
      const token = document.getElementById('token').value;
      
      if (!token) {
        alert('Please enter JWT token');
        return;
      }

      socket = io('http://localhost:5000', {
        auth: { token }
      });

      socket.on('connected', (data) => {
        document.getElementById('status').textContent = 'Connected - ' + data.userId;
        log('✅ Connected: ' + JSON.stringify(data), 'success');
      });

      socket.on('new_message', (data) => {
        log('📨 New message: ' + JSON.stringify(data.message), 'info');
      });

      socket.on('message_sent', (data) => {
        log('✅ Message sent successfully', 'success');
      });

      socket.on('chat_updated', (data) => {
        log('🔄 Chat updated: ' + data.chatId, 'info');
      });

      socket.on('user_typing', (data) => {
        log('⌨️ User typing: ' + data.userId, 'info');
      });

      socket.on('user_stopped_typing', (data) => {
        log('⌨️ User stopped typing: ' + data.userId, 'info');
      });

      socket.on('user_online', (data) => {
        log('🟢 User online: ' + data.userId, 'info');
      });

      socket.on('user_offline', (data) => {
        log('⚫ User offline: ' + data.userId, 'info');
      });

      socket.on('user_blocked', (data) => {
        log('🚫 User blocked', 'success');
      });

      socket.on('you_were_blocked', (data) => {
        log('🚫 You were blocked by: ' + data.blockedByUserId, 'error');
      });

      socket.on('user_unblocked', (data) => {
        log('✅ User unblocked', 'success');
      });

      socket.on('you_were_unblocked', (data) => {
        log('✅ You were unblocked by: ' + data.unblockedByUserId, 'success');
      });

      socket.on('messages_read_by_other', (data) => {
        log('👁️ Messages read by: ' + data.readByUserId, 'info');
      });

      socket.on('error', (error) => {
        log('❌ Error: ' + JSON.stringify(error), 'error');
      });

      socket.on('connect_error', (error) => {
        log('❌ Connection error: ' + error.message, 'error');
        document.getElementById('status').textContent = 'Connection Failed';
      });

      socket.on('disconnect', (reason) => {
        log('🔌 Disconnected: ' + reason, 'info');
        document.getElementById('status').textContent = 'Disconnected';
      });
    }

    function disconnect() {
      if (socket) {
        socket.disconnect();
        socket = null;
        document.getElementById('status').textContent = 'Disconnected';
        log('👋 Disconnected manually', 'info');
      }
    }

    function sendMessage() {
      if (!socket) {
        alert('Please connect first');
        return;
      }

      const chatId = document.getElementById('chatId').value;
      const receiverId = document.getElementById('receiverId').value;
      const content = document.getElementById('message').value;

      if (!chatId || !receiverId || !content) {
        alert('Please fill all fields');
        return;
      }

      socket.emit('send_message', {
        chatId,
        receiverId,
        content,
        messageType: 'text'
      }, (response) => {
        if (response.error) {
          log('❌ Send failed: ' + response.error.message, 'error');
        } else {
          log('✅ Message sent', 'success');
          document.getElementById('message').value = '';
        }
      });
    }

    function markAsRead() {
      if (!socket) {
        alert('Please connect first');
        return;
      }

      const chatId = document.getElementById('actionChatId').value;
      if (!chatId) {
        alert('Please enter chat ID');
        return;
      }

      socket.emit('mark_messages_read', { chatId }, (response) => {
        if (response.success) {
          log('✅ Messages marked as read', 'success');
        }
      });
    }

    function blockUser() {
      if (!socket) {
        alert('Please connect first');
        return;
      }

      const chatId = document.getElementById('actionChatId').value;
      if (!chatId) {
        alert('Please enter chat ID');
        return;
      }

      socket.emit('block_user', { chatId }, (response) => {
        if (response.error) {
          log('❌ Block failed: ' + response.error.message, 'error');
        } else {
          log('✅ User blocked', 'success');
        }
      });
    }

    function unblockUser() {
      if (!socket) {
        alert('Please connect first');
        return;
      }

      const chatId = document.getElementById('actionChatId').value;
      if (!chatId) {
        alert('Please enter chat ID');
        return;
      }

      socket.emit('unblock_user', { chatId }, (response) => {
        if (response.error) {
          log('❌ Unblock failed: ' + response.error.message, 'error');
        } else {
          log('✅ User unblocked', 'success');
        }
      });
    }

    function getOnlineUsers() {
      if (!socket) {
        alert('Please connect first');
        return;
      }

      socket.emit('get_online_users', (response) => {
        log('👥 Online users (' + response.count + '): ' + JSON.stringify(response.onlineUsers), 'info');
      });
    }

    function ping() {
      if (!socket) {
        alert('Please connect first');
        return;
      }

      socket.emit('ping', (response) => {
        log('🏓 Pong received: ' + response.timestamp, 'success');
      });
    }
  </script>
</body>
</html>
```

Save this file and open it in your browser to test the socket functionality!

## Automated Testing with Jest

Create `socket.test.js`:

```javascript
const io = require('socket.io-client');

describe('Socket.IO Tests', () => {
  let socket;
  const token = process.env.TEST_JWT_TOKEN;

  beforeAll((done) => {
    socket = io('http://localhost:5000', {
      auth: { token }
    });

    socket.on('connected', () => {
      done();
    });
  });

  afterAll(() => {
    socket.disconnect();
  });

  test('should connect successfully', (done) => {
    expect(socket.connected).toBe(true);
    done();
  });

  test('should respond to ping', (done) => {
    socket.emit('ping', (response) => {
      expect(response).toHaveProperty('pong', true);
      expect(response).toHaveProperty('timestamp');
      done();
    });
  });

  test('should send message successfully', (done) => {
    socket.emit('send_message', {
      chatId: 'test_chat_id',
      receiverId: 'test_receiver_id',
      content: 'Test message',
      messageType: 'text'
    }, (response) => {
      if (response.error) {
        console.log('Expected error (chat might not exist):', response.error);
        done();
      } else {
        expect(response).toHaveProperty('success', true);
        expect(response).toHaveProperty('message');
        done();
      }
    });
  });

  test('should handle errors gracefully', (done) => {
    socket.emit('send_message', {
      // Missing required fields
      chatId: ''
    }, (response) => {
      expect(response).toHaveProperty('error');
      done();
    });
  });
});
```

Run tests:
```bash
npm test socket.test.js
```

## Load Testing

Create `load-test.js` using Socket.IO Client:

```javascript
const io = require('socket.io-client');

const NUM_CLIENTS = 100;
const TOKEN = 'YOUR_JWT_TOKEN';

let connectedClients = 0;

for (let i = 0; i < NUM_CLIENTS; i++) {
  const socket = io('http://localhost:5000', {
    auth: { token: TOKEN }
  });

  socket.on('connected', () => {
    connectedClients++;
    console.log(`Client ${i + 1} connected. Total: ${connectedClients}/${NUM_CLIENTS}`);
    
    if (connectedClients === NUM_CLIENTS) {
      console.log('All clients connected successfully!');
    }
  });

  socket.on('connect_error', (error) => {
    console.error(`Client ${i + 1} failed:`, error.message);
  });
}
```

## Troubleshooting Checklist

- [ ] Server is running on correct port
- [ ] JWT token is valid and not expired
- [ ] Token includes correct format (with or without "Bearer ")
- [ ] User exists in database
- [ ] CORS is properly configured
- [ ] WebSocket transport is enabled
- [ ] Firewall/proxy allows WebSocket connections
- [ ] Database connection is working
- [ ] No compilation errors in server code

## Common Test Scenarios

### Scenario 1: Two Users Chatting
1. Open two browser windows
2. Connect with different user tokens
3. Send message from user 1
4. Verify user 2 receives the message
5. Send reply from user 2
6. Verify user 1 receives the reply

### Scenario 2: Blocking Functionality
1. User 1 blocks user 2
2. Try sending message from user 2 to user 1
3. Should receive error
4. User 1 unblocks user 2
5. User 2 can now send messages again

### Scenario 3: Offline Message Delivery
1. Disconnect user 2
2. User 1 sends message
3. Reconnect user 2
4. Fetch messages via HTTP API
5. Verify message is received

## Performance Metrics to Monitor

- Connection time
- Message delivery latency
- Memory usage
- CPU usage
- Number of concurrent connections
- Event handling time

## Next Steps

1. Test all endpoints with Postman
2. Test socket events with browser console
3. Run load tests
4. Monitor server logs for errors
5. Verify database updates
6. Test edge cases (blocked users, invalid data, etc.)
