const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
  alarm_id: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  alarm_type: {
    type: String,
    required: true,
    enum: [
      "low_oxygen_purity",
      "high_pressure",
      "low_pressure",
      "high_temperature",
      "low_flow_rate",
      "low_storage",
      "backup_active",
      "system_error",
    ],
  },
  threshold_value: Number,
  measured_value: Number,
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["active", "resolved", "acknowledged"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model("Alarm", alarmSchema);
