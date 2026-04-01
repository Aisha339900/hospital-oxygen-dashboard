const mongoose = require("mongoose");

const demandStatusSchema = new mongoose.Schema(
  {
    scenario: {
      type: String,
      required: true,
      index: true,
      default: "normal",
      trim: true,
      lowercase: true,
    },
    general_requests: {
      type: Number,
      default: 0,
    },
    general_wip: {
      type: Number,
      default: 0,
    },
    icu_requests: {
      type: Number,
      default: 0,
    },
    icu_wip: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "unknown",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "demand_status",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

module.exports = mongoose.model("DemandStatus", demandStatusSchema);
