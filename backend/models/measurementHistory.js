const mongoose = require("mongoose");

const valueWithMinSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      min: 0,
    },
  },
  { _id: false },
);

const percentageValueSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { _id: false },
);

const measurementHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
  },
  measurements: {
    oxygen_purity: {
      type: percentageValueSchema,
      required: true,
    },
    flow_rate: {
      type: valueWithMinSchema,
      required: true,
    },
    pressure: {
      type: valueWithMinSchema,
      required: true,
    },
    storageLevel: {
      type: percentageValueSchema,
      required: true,
    },
  },
  period: {
    type: String,
    enum: ["daily", "hourly", "monthly"],
    default: "daily",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MeasurementHistory", measurementHistorySchema);
