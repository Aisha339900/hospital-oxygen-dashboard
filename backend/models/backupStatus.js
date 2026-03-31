const mongoose = require("mongoose");

const backupStatusSchema = new mongoose.Schema(
  {
    scenario: {
      type: String,
      required: true,
      index: true,
      default: "normal",
      trim: true,
      lowercase: true,
    },
    mode: {
      type: String,
      default: "standby",
    },
    utilization_percent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    remaining_liters: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      default: "safe",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "backup_status",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

module.exports = mongoose.model("BackupStatus", backupStatusSchema);
