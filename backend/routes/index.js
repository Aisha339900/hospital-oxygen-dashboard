const express = require("express");
const router = express.Router();

const streamController = require("../controllers/streamController");
const measurementController = require("../controllers/measurementController");
const historyController = require("../controllers/historyController");
const alarmController = require("../controllers/alarmController");
const healthController = require("../controllers/healthController");
const backupStatusController = require("../controllers/backupStatusController");
const demandStatusController = require("../controllers/demandStatusController");
const supplyStatusController = require("../controllers/supplyStatusController");
const authController = require("../controllers/authController");
const reportController = require("../controllers/reportController");
const { requireAuth, optionalAuth } = require("../middleware/authMiddleware");

// Auth
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", requireAuth, authController.me);
router.post("/auth/reset-password", authController.requestPasswordReset);
router.post("/auth/confirm-reset", authController.confirmPasswordReset);

// Dashboard reports (PDF)
router.post("/reports/dashboard-pdf", reportController.downloadDashboardPdf);
router.get("/reports/dashboard-email/status", reportController.getDashboardEmailStatus);
router.post(
  "/reports/dashboard-email",
  requireAuth,
  reportController.emailDashboardPdf,
);

// Stream routes
router.get("/streams", streamController.getAllStreams);
router.get("/streams/:id", streamController.getStreamById);
router.post("/streams", streamController.createStream);
router.put("/streams/:id", streamController.updateStream);

// Measurement routes
router.get(
  "/measurements/current",
  measurementController.getCurrentMeasurements,
);
router.get("/measurements", measurementController.getAllMeasurements);
router.post("/measurements", measurementController.createMeasurement);
router.get(
  "/measurements/range",
  measurementController.getMeasurementsByDateRange,
);

// History/Trend routes
// Legacy history routes for removed charts:
// router.get("/history/oxygen-purity", historyController.getOxygenPurityTrend);
// router.get("/history/flow-rate", historyController.getFlowRateTrend);
// router.get("/history/pressure", historyController.getPressureTrend);
// router.get(
//   "/history/storage-monthly",
//   historyController.getStorageLevelMonthly,
// );
router.get("/history/trend-data", historyController.getTrendData);

// Alarm routes
router.get("/alarms", alarmController.getAllAlarms);
router.get("/alarms/active", alarmController.getActiveAlarms);
router.post(
  "/alarms/sync-dashboard",
  optionalAuth,
  alarmController.syncDashboardFromClient,
);
router.post("/alarms", alarmController.createAlarm);
router.put("/alarms/:id", alarmController.updateAlarmStatus);

// Backup status routes
router.get(
  "/backup-status",
  backupStatusController.getBackupStatusByScenario,
);
router.get(
  "/backup-status/all",
  backupStatusController.getAllBackupStatuses,
);

// Demand status routes
router.get(
  "/demand-status",
  demandStatusController.getDemandStatusByScenario,
);
router.get(
  "/demand-status/all",
  demandStatusController.getAllDemandStatuses,
);

// Supply status routes
router.get(
  "/supply-status",
  supplyStatusController.getSupplyStatusByScenario,
);
router.get(
  "/supply-status/all",
  supplyStatusController.getAllSupplyStatuses,
);

// System health routes
router.get("/system-health/latest", healthController.getLatestHealth);
router.get("/system-health", healthController.getAllHealth);
router.post("/system-health", healthController.createHealthRecord);
router.put("/system-health/:id", healthController.updateHealthRecord);

module.exports = router;
