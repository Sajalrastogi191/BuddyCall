const express   = require("express");
const http      = require("http");
const cors      = require("cors");
const path      = require("path");
const dotenv    = require("dotenv");
const mongoose  = require("mongoose");
const WebSocket = require("ws");
const jwt       = require("jsonwebtoken");

// Load .env from the same directory as this file (backend root)
dotenv.config({ path: path.resolve(__dirname, "../.env") });


const authRoutes   = require("./routes/auth");
const userRoutes   = require("./routes/users");
const friendRoutes = require("./routes/friends");
const chatRoutes   = require("./routes/chat");
const { onlineUsers, userSocketMap, broadcastOnlineUsers } = require("./sockets/call");

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB ------------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// --- REST Routes --------------------------------------------------------------
app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/friends", friendRoutes);
app.use("/chat", chatRoutes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// --- Raw WebSocket Server -----------------------------------------------------
// Frontend connects to:  ws://<host>:<port>/ws/<access_token>
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const pathParts = req.url.split("/");          // ["", "ws", "<token>"]
  const token = pathParts[2];

  if (!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } catch {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", (ws, req) => {
  const { id: userId, name, username } = req.user;
  const displayName = name || username;

  // Register user
  onlineUsers.set(ws, { userId, name: displayName });
  userSocketMap.set(userId, ws);

  console.log(`${displayName} (${userId}) connected`);

  // Broadcast updated online users list
  broadcastOnlineUsers(wss);

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);
      const { target } = msg;
      const enriched = JSON.stringify({
        ...msg,
        from: userId,
        fromName: displayName,
      });

      // Route to target if online
      const targetWs = userSocketMap.get(target);
      if (targetWs && targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(enriched);
      }
    } catch (e) {
      console.error("WS message parse error:", e);
    }
  });

  ws.on("close", () => {
    onlineUsers.delete(ws);
    userSocketMap.delete(userId);
    broadcastOnlineUsers(wss);
    console.log(`${userId} disconnected`);
  });

  ws.on("error", (err) => console.error("WS error:", err));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`BuddyCall MERN backend running on http://localhost:${PORT}`)
);
