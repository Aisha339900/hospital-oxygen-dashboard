const mongoose = require("mongoose");

const systemMeasurementSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  oxygen_purity_percent: {
    type: Number,
    min: 0,
    max: 100,
  },
  flow_rate_m3h: {
    type: Number,
    min: 0,
  },
  delivery_pressure_bar: {
    type: Number,
    min: 0,
  },
  demand_coverage_percent: {
    type: Number,
    min: 0,
    max: 100,
  },
  storage_level_percent: {
    type: Number,
    min: 0,
    max: 100,
  },
  temperature: {
    type: Number,
  },
  data_source: {
    type: String,
    enum: ["real_sensor", "dummy", "simulated"],
    default: "dummy",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create TTL index (auto-delete after 60 days)
systemMeasurementSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 15552000 },
);

module.exports = mongoose.model("SystemMeasurement", systemMeasurementSchema);
