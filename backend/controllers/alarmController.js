const Alarm = require("../models/alarm");

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
    const alarms = await Alarm.find({ status: "active" }).sort({
      timestamp: -1,
    });
    res.json(alarms);
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
