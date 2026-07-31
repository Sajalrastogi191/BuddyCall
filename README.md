# BuddyCall - React Native Frontend

BuddyCall is a modern real-time communication app that enables secure authentication, persistent messaging, and high-quality video calling using WebRTC and FastAPI.

## ✨ Features

- **Secure Authentication**
  - User registration and login
  - JWT-based authentication and session management

- **Real-Time Social Network**
  - Discover online users
  - Send, receive, and accept friend requests

- **Persistent Messaging**
  - One-to-one real-time chat
  - Message history stored securely

- **High-Quality Video Calling**
  - Peer-to-peer video calls powered by WebRTC
  - Automatic NAT traversal using STUN servers
  - Low-latency communication

- **Modern UI**
  - Clean and responsive interface
  - Smooth animations and premium user experience

---

## 📸 Screenshots

| Login / Register | Friends | Video Calling |
|:----------------:|:-------:|:-------------:|
| ![Login](./screenshots/login.jpeg) | ![Friends](./screenshots/friends.jpeg) | ![Video Call](./screenshots/video-call.jpeg) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Android Studio with Android SDK and Emulator (or a physical Android device)
- BuddyCall FastAPI Backend running locally or deployed

### Installation

Clone the repository and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Running the Application

Start the Metro bundler:

```bash
npm start
```

Run the Android application:

```bash
npx react-native run-android
```

---

## ⚙️ Configuration

Update the backend URL inside `config.ts`:

```ts
const BASE_URL = "https://your-backend-url.up.railway.app";
```

Replace it with your deployed or local FastAPI backend URL.

---

## 🛠️ Tech Stack

- **React Native** – Cross-platform mobile development
- **FastAPI** – Backend API and signaling server
- **WebRTC** – Peer-to-peer video calling
- **WebSocket / Socket.IO** – Real-time messaging and signaling
- **JWT Authentication** – Secure user authentication

---

## 📱 Core Features

- 🔐 Secure Login & Registration
- 👥 Friend Request System
- 🟢 Online User Status
- 💬 Real-Time Messaging
- 📞 One-to-One Video Calling
- ⚡ Fast & Responsive User Interface

---

## 📄 License

This project is intended for educational and personal use.
