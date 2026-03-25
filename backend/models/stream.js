const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["Membrane Permeate", "Feed", "Waste"],
  },
  type: {
    type: String,
    required: true,
    enum: ["permeate", "feed", "waste"],
  },
  current: {
    temperature: {
      value: Number,
      unit: { type: String, default: "degC" },
    },
    pressure: {
      value: Number,
      unit: { type: String, default: "kPa" },
    },
    molar_flow: {
      value: Number,
      unit: { type: String, default: "kmol/h" },
    },
    mass_flow: {
      value: Number,
      unit: { type: String, default: "kg/h" },
    },
  },
  composition: {
    O2: Number,
    N2: Number,
    Ar: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Stream", streamSchema);
