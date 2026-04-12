const User = require("../models/user");
const emailService = require("../services/emailService");
const {
  sanitizeSnapshot,
  buildDashboardPdfBuffer,
  pdfFilename,
} = require("../services/dashboardPdfService");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.downloadDashboardPdf = async (req, res) => {
  try {
    const snapshot = req.body?.snapshot;
    if (!snapshot || typeof snapshot !== "object") {
      return res.status(400).json({ message: "Request body must include snapshot." });
    }
    const clean = sanitizeSnapshot(snapshot);
    const pdfBuffer = await buildDashboardPdfBuffer(clean);
    const name = pdfFilename(clean);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("downloadDashboardPdf:", err);
    const msg = err?.message || "Failed to build PDF";
    if (msg.includes("Invalid snapshot")) {
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: "Failed to generate report." });
  }
};

exports.getDashboardEmailStatus = async (_req, res) => {
  try {
    const status = await emailService.getSmtpStatus();
    return res.json(status);
  } catch (err) {
    console.error("getDashboardEmailStatus:", err);
    return res.status(500).json({
      configured: false,
      available: false,
      message: "Unable to verify email status.",
    });
  }
};

exports.emailDashboardPdf = async (req, res) => {
  try {
    const emailStatus = await emailService.getSmtpStatus();
    if (!emailStatus.available) {
      return res.status(503).json({
        message: emailStatus.message,
      });
    }
    const snapshot = req.body?.snapshot;
    if (!snapshot || typeof snapshot !== "object") {
      return res.status(400).json({ message: "Request body must include snapshot." });
    }
    const rawTo = typeof req.body?.to === "string" ? req.body.to.trim() : "";
    if (rawTo && !EMAIL_RE.test(rawTo)) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    let to = rawTo.toLowerCase();
    if (!to) {
      const user = await User.findById(req.userId).select("email");
      to = (user?.email || "").trim().toLowerCase();
    }
    if (!to || !EMAIL_RE.test(to)) {
      return res.status(400).json({
        message: "Provide a valid recipient email, or ensure your account has an email address.",
      });
    }
    const clean = sanitizeSnapshot(snapshot);
    const pdfBuffer = await buildDashboardPdfBuffer(clean);
    const filename = pdfFilename(clean);
    await emailService.sendDashboardReportPdf({ to, pdfBuffer, filename });
    return res.json({ message: "Report emailed successfully.", to });
  } catch (err) {
    console.error("emailDashboardPdf:", err);
    const msg = err?.message || "Failed to send email";
    if (msg.includes("Invalid snapshot")) {
      return res.status(400).json({ message: msg });
    }
    if (msg.includes("SMTP is not configured")) {
      return res.status(503).json({ message: msg });
    }
    return res.status(500).json({ message: "Failed to email report." });
  }
};
