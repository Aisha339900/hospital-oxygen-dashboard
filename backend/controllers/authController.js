const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../middleware/authMiddleware");
const emailService = require("../services/emailService");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function publicUser(userDoc) {
  return {
    id: userDoc._id.toString(),
    email: userDoc.email,
    name: userDoc.name,
    role: userDoc.role,
  };
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password is required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("register:", err);
    return res.status(500).json({ message: "Registration failed." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash",
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("login:", err);
    return res.status(500).json({ message: "Login failed." });
  }
}

function logout(req, res) {
  res.json({ success: true });
}

async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json(publicUser(user));
  } catch (err) {
    console.error("me:", err);
    return res.status(500).json({ message: "Unable to load user." });
  }
}

const GENERIC_RESET_MESSAGE =
  "If an account exists for this email, you will receive reset instructions shortly.";

async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({ message: GENERIC_RESET_MESSAGE });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

    const frontendBase =
      process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendBase.replace(/\/$/, "")}/?reset=${token}`;

    const smtpReady = emailService.isSmtpConfigured();

    if (!smtpReady && process.env.NODE_ENV === "production") {
      console.error(
        "requestPasswordReset: SMTP is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS).",
      );
      return res.status(503).json({
        message:
          "Password reset by email is not available. Contact your administrator.",
      });
    }

    await user.save();

    if (!smtpReady) {
      console.info("[password reset] dev (no SMTP)", resetLink);
      return res.json({
        message: GENERIC_RESET_MESSAGE,
        debugResetLink: resetLink,
      });
    }

    try {
      await emailService.sendPasswordResetEmail({
        to: normalizedEmail,
        resetLink,
      });
    } catch (mailErr) {
      console.error("sendPasswordResetEmail:", mailErr);
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
      return res.status(500).json({
        message: "Unable to send reset email. Please try again later.",
      });
    }

    return res.json({ message: GENERIC_RESET_MESSAGE });
  } catch (err) {
    console.error("requestPasswordReset:", err);
    return res.status(500).json({ message: "Unable to process request." });
  }
}

async function confirmPasswordReset(req, res) {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || typeof token !== "string" || !token.trim()) {
      return res.status(400).json({ message: "Reset token is required." });
    }
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ message: "New password is required." });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({
      passwordResetToken: token.trim(),
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "This reset link is invalid or has expired." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.json({
      message: "Your password has been reset. You can sign in now.",
    });
  } catch (err) {
    console.error("confirmPasswordReset:", err);
    return res.status(500).json({ message: "Unable to reset password." });
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  confirmPasswordReset,
};
