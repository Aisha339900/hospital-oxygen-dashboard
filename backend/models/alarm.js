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
      "low_demand_coverage",
      "low_backup_volume",
      "low_backup_utilization",
      "high_specific_energy",
    ],
  },
  /** Stable id for rule-engine managed alarms (upsert / auto-resolve). */
  rule_key: {
    type: String,
    index: true,
    sparse: true,
  },
  /** Human-readable text shown in the dashboard (optional). */
  message: {
    type: String,
    default: "",
  },
  /**
   * Aspen stream id when the alarm is tied to a stream (purity/flow/pressure/energy).
   * Null for plant-wide rules (coverage, backup, etc.).
   */
  stream_id: {
    type: String,
    index: true,
    sparse: true,
    default: null,
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