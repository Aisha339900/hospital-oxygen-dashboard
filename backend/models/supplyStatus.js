const mongoose = require("mongoose");

const supplyStatusSchema = new mongoose.Schema(
  {
    scenario: {
      type: String,
      required: true,
      index: true,
      default: "normal",
      trim: true,
      lowercase: true,
    },
    main_utilization_percent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    main_remaining_liters: {
      type: Number,
      min: 0,
      default: 0,
    },
    coverage_percent: {
      type: Number,
      min: 0,
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
    collection: "supply_status",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

module.exports = mongoose.model("SupplyStatus", supplyStatusSchema);
