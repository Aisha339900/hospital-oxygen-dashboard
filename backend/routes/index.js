const express = require("express");
const router = express.Router();

const streamController = require("../controllers/streamController");
const measurementController = require("../controllers/measurementController");
const historyController = require("../controllers/historyController");
const alarmController = require("../controllers/alarmController");
const healthController = require("../controllers/healthController");
const backupStatusController = require("../controllers/backupStatusController");

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
router.get("/history/oxygen-purity", historyController.getOxygenPurityTrend);
router.get("/history/flow-rate", historyController.getFlowRateTrend);
router.get("/history/pressure", historyController.getPressureTrend);
router.get(
  "/history/storage-monthly",
  historyController.getStorageLevelMonthly,
);

// Alarm routes
router.get("/alarms", alarmController.getAllAlarms);
router.get("/alarms/active", alarmController.getActiveAlarms);
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

// System health routes
router.get("/system-health/latest", healthController.getLatestHealth);
router.get("/system-health", healthController.getAllHealth);
router.post("/system-health", healthController.createHealthRecord);
router.put("/system-health/:id", healthController.updateHealthRecord);

module.exports = router;
