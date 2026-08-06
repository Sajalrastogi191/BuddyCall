const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

// POST /register
router.post("/register", async (req, res) => {
  const { id, username, name, password } = req.body;
  if (!id || !username || !name || !password)
    return res.status(400).json({ detail: "All fields required" });

  try {
    const exists = await User.findOne({ $or: [{ id }, { username }] });
    if (exists)
      return res.status(400).json({ detail: "ID or username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ id, username, name, passwordHash });
    return res.status(201).json({ message: "User created", user_id: user.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Server error" });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ detail: "Username and password required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ detail: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ detail: "Invalid credentials" });

    const access_token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ access_token, user_id: user.id, name: user.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Server error" });
  }
});

module.exports = router;
