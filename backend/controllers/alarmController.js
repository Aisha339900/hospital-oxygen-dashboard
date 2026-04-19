const Alarm = require("../models/alarm");
const User = require("../models/user");
const {
  syncDashboardFromClientPayload,
} = require("../services/alarmSyncService");

// Get all alarms
exports.getAllAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.find().sort({ timestamp: -1 });
    res.json(alarms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active alarms only
exports.getActiveAlarms = async (req, res) => {
  try {
    const streamId =
      typeof req.query.streamId === "string" ? req.query.streamId.trim() : "";
    const query = { status: "active" };
    if (streamId) {
      query.$or = [{ stream_id: streamId }, { stream_id: null }];
    }
    const alarms = await Alarm.find(query).sort({
      timestamp: -1,
    });
    res.json(alarms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Persist rule-engine alarms from the same payload the dashboard UI evaluates (requires streamId). */
exports.syncDashboardFromClient = async (req, res) => {
  try {
    const streamId = String(req.body?.streamId || "").trim();
    if (!streamId) {
      return res.status(400).json({ message: "streamId is required." });
    }
    const { latestPoint, supplyDemand, backupData } = req.body;
    if (!latestPoint || typeof latestPoint !== "object") {
      return res.status(400).json({ message: "latestPoint is required." });
    }
    const recipientEmails = [];
    const emailAlertsEnabled = req.body?.emailAlerts !== false;
    if (emailAlertsEnabled && req.userId) {
      const user = await User.findById(req.userId).select("email").lean();
      if (user?.email) {
        recipientEmails.push(String(user.email).trim().toLowerCase());
      }
    }

    const streamChanged = Boolean(req.body?.streamChanged);
    const alarmEmailSessionId =
      typeof req.body?.alarmEmailSessionId === "string"
        ? req.body.alarmEmailSessionId.trim()
        : "";

    const result = await syncDashboardFromClientPayload({
      streamId,
      latestPoint,
      supplyDemand: supplyDemand ?? null,
      backupData: backupData ?? null,
      recipientEmails,
      streamChanged,
      alarmEmailSessionId,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create alarm
exports.createAlarm = async (req, res) => {
  const alarm = new Alarm(req.body);
  try {
    const newAlarm = await alarm.save();
    res.status(201).json(newAlarm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update alarm status
exports.updateAlarmStatus = async (req, res) => {
  try {
    const alarm = await Alarm.findById(req.params.id);
    if (!alarm) return res.status(404).json({ message: "Alarm not found" });

    alarm.status = req.body.status;
    const updated = await alarm.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
