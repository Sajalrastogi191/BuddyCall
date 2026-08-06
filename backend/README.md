# BuddyCall – MERN Backend

A Node.js / Express / MongoDB / Socket.IO backend for the BuddyCall React Native app.

## Prerequisites
- Node.js >= 16
- MongoDB running locally on port 27017

## Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment variables
# Edit .env and set your JWT_SECRET (and MONGO_URI / PORT if needed)

# 3. Start development server (hot-reload)
npm run dev

# 4. Or start production server
npm start
```

## Environment Variables (.env)
| Variable    | Default                                    | Description          |
|-------------|--------------------------------------------|----------------------|
| PORT        | 5000                                       | HTTP / WS port       |
| MONGO_URI   | mongodb://localhost:27017/buddycall        | MongoDB connection   |
| JWT_SECRET  | change_this_secret                         | JWT signing key      |

## API Reference

### Auth
| Method | Endpoint    | Body                                       | Description        |
|--------|-------------|--------------------------------------------|--------------------|
| POST   | /register   | { id, username, name, password }           | Register a user    |
| POST   | /login      | { username, password }                     | Login, returns JWT |

### Users (requires Bearer token)
| Method | Endpoint | Description              |
|--------|----------|--------------------------|
| GET    | /users   | List currently online users |

### Friends (requires Bearer token)
| Method | Endpoint          | Body           | Description           |
|--------|-------------------|----------------|-----------------------|
| GET    | /friends          |                | List accepted friends |
| POST   | /friends/request  | { target }     | Send friend request   |
| POST   | /friends/accept   | { target }     | Accept friend request |
| POST   | /friends/reject   | { target }     | Reject friend request |

### Chat (requires Bearer token)
| Method | Endpoint          | Body              | Description             |
|--------|-------------------|-------------------|-------------------------|
| GET    | /chat/:friendId   |                   | Fetch message history   |
| POST   | /chat/:friendId   | { text, timestamp }| Store a message        |

## WebSocket (Socket.IO)
Connect to `ws://localhost:5000` with Socket.IO.

After connecting, immediately emit an `auth` event with your JWT token:
```js
socket.emit("auth", access_token);
```
Then send and receive `message` events with the same payload shape the frontend expects.

### Signaling message types
| Type             | Direction     | Description                     |
|------------------|---------------|---------------------------------|
| online_users     | Server ? All  | Updated list of connected users |
| friend_request   | Client ? Peer | Send a friend request           |
| friend_accept    | Client ? Peer | Accept a friend request         |
| friend_reject    | Client ? Peer | Reject a friend request         |
| chat             | Client ? Peer | Chat message                    |
| offer            | Client ? Peer | WebRTC offer                    |
| answer           | Client ? Peer | WebRTC answer                   |
| candidate        | Client ? Peer | ICE candidate                   |
