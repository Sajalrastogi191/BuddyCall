const router  = require("express").Router();
const auth    = require("../middleware/auth");
const Message = require("../models/Message");

// GET /chat/:friendId — retrieve message history
router.get("/:friendId", auth, async (req, res) => {
  const { friendId } = req.params;
  const messages = await Message.find({
    $or: [
      { from: req.userId, to: friendId },
      { from: friendId,   to: req.userId },
    ],
  }).sort({ timestamp: 1 });
  return res.json(messages);
});

// POST /chat/:friendId — store a message
router.post("/:friendId", auth, async (req, res) => {
  const { friendId } = req.params;
  const { text, timestamp } = req.body;
  if (!text) return res.status(400).json({ detail: "text required" });
  try {
    const msg = await Message.create({
      from: req.userId,
      to: friendId,
      text,
      timestamp: timestamp || Date.now(),
    });
    return res.status(201).json(msg);
  } catch (e) {
    return res.status(500).json({ detail: "Server error" });
  }
});

module.exports = router;
