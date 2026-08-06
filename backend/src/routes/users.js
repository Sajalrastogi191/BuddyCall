const router  = require("express").Router();
const auth    = require("../middleware/auth");
const { onlineUsers } = require("../sockets/call");

// GET /users — returns currently online users
router.get("/", auth, (req, res) => {
  const users = Array.from(onlineUsers.values()).map((u) => ({
    id: u.userId,
    name: u.name,
  }));
  return res.json(users);
});

module.exports = router;
