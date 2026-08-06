const router = require("express").Router();
const auth   = require("../middleware/auth");
const User   = require("../models/User");

// GET /friends — list accepted friends
router.get("/", auth, async (req, res) => {
  const user = await User.findOne({ id: req.userId });
  if (!user) return res.status(404).json({ detail: "User not found" });
  return res.json(user.friends);
});

// POST /friends/request
router.post("/request", auth, async (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ detail: "target required" });
  try {
    await User.findOneAndUpdate({ id: req.userId }, { $addToSet: { pendingSent: target } });
    await User.findOneAndUpdate({ id: target },     { $addToSet: { pendingReceived: req.userId } });
    return res.json({ message: "Request sent" });
  } catch (e) {
    return res.status(500).json({ detail: "Server error" });
  }
});

// POST /friends/accept
router.post("/accept", auth, async (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ detail: "target required" });
  try {
    // Add each other to friends list and clean up pending
    await User.findOneAndUpdate({ id: req.userId }, {
      $addToSet: { friends: target },
      $pull: { pendingReceived: target },
    });
    await User.findOneAndUpdate({ id: target }, {
      $addToSet: { friends: req.userId },
      $pull: { pendingSent: req.userId },
    });
    return res.json({ message: "Friend added" });
  } catch (e) {
    return res.status(500).json({ detail: "Server error" });
  }
});

// POST /friends/reject
router.post("/reject", auth, async (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ detail: "target required" });
  try {
    await User.findOneAndUpdate({ id: req.userId }, { $pull: { pendingReceived: target } });
    await User.findOneAndUpdate({ id: target },     { $pull: { pendingSent: req.userId } });
    return res.json({ message: "Request rejected" });
  } catch (e) {
    return res.status(500).json({ detail: "Server error" });
  }
});

module.exports = router;
