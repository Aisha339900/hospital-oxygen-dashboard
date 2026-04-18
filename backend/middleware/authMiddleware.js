const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "oxygen-dashboard-dev-secret";

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

/** Sets req.userId when a valid Bearer token is present; otherwise continues without it. */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.sub;
  } catch {
    /* treat as anonymous */
  }
  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
