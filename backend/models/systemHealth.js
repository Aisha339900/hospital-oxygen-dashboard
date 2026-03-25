const mongoose = require("mongoose");

const systemHealthSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  logging_status: {
    type: String,
    enum: ["running", "stopped", "error"],
    default: "running",
  },
  dashboard_status: {
    type: String,
    enum: ["online", "offline", "error"],
    default: "online",
  },
  backup_status: {
    mode: {
      type: String,
      enum: ["automatic", "manual", "disabled"],
      default: "automatic",
    },
    level_percent: {
      type: Number,
      min: 0,
      max: 100,
    },
    estimated_coverage_hours: Number,
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model("SystemHealth", systemHealthSchema);
