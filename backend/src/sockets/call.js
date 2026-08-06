const WebSocket = require("ws");

// Map: ws (socket object) -> { userId, name }
const onlineUsers = new Map();
// Map: userId -> ws (socket object)
const userSocketMap = new Map();

function broadcastOnlineUsers(wss) {
  const users = Array.from(onlineUsers.values()).map((u) => ({
    id: u.userId,
    name: u.name,
  }));
  const payload = JSON.stringify({ type: "online_users", users });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

module.exports = { onlineUsers, userSocketMap, broadcastOnlineUsers };
