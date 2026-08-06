const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ detail: "No token provided" });

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.username = decoded.username;
    next();
  } catch {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
