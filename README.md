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
| ![Login](./screenshots/WhatsApp%20Image%202026-03-27%20at%2016.46.05%20(1).jpeg) | ![Friends](./screenshots/WhatsApp%20Image%202026-03-27%20at%2016.46.05.jpeg) | ![Video Call](./screenshots/WhatsApp%20Image%202026-03-27%20at%2016.46.36.jpeg) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Android Studio with Android SDK and Emulator (or a physical Android device)
- BuddyCall FastAPI Backend running locally or deployed

### Installation

Clone the repository and navigate to the project root directory:

```bash
cd BuddyCall
```

Install dependencies:

```bash
npm install
```

### Android Setup
1. Ensure Android Studio is installed with SDK and an emulator or connect a physical Android device (enable USB debugging).
2. Reverse the Metro port for device debugging:
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```
3. Start the Metro bundler:
   ```bash
   npm start
   ```
4. Run the app on Android:
   ```bash
   npx react-native run-android
   ```

### iOS Setup (macOS only)
1. Install CocoaPods dependencies:
   ```bash
   cd ios && pod install && cd ..
   ```
2. Open the project in Xcode and select a simulator or a connected iPhone.
3. Run the Metro bundler:
   ```bash
   npm start
   ```
4. Build and run from Xcode or via CLI:
   ```bash
   npx react-native run-ios
   ```

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
