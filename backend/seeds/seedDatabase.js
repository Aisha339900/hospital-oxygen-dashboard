require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/database");

const Stream = require("../models/stream");
const SystemMeasurement = require("../models/systemMeasurement");
const MeasurementHistory = require("../models/measurementHistory");
const Alarm = require("../models/alarm");
const SystemHealth = require("../models/systemHealth");
const BackupStatus = require("../models/backupStatus");

const { generateDummyMeasurements } = require("../utils/dataGenerator");

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Stream.deleteMany({});
    await SystemMeasurement.deleteMany({});
    await MeasurementHistory.deleteMany({});
    await Alarm.deleteMany({});
    await SystemHealth.deleteMany({});
    await BackupStatus.deleteMany({});

    console.log("Cleared existing data");

    // Seed Streams (from your PDF data)
    const membraneStream = await Stream.create({
      name: "Membrane Permeate",
      type: "permeate",
      current: {
        temperature: { value: 25.0, unit: "degC" },
        pressure: { value: 100, unit: "kPa" },
        molar_flow: { value: 4.633, unit: "kmol/h" },
        mass_flow: { value: 137.8, unit: "kg/h" },
      },
      composition: {
        O2: 42.39,
        N2: 57.25,
        Ar: 0.37,
      },
    });

    console.log("Created stream data");

    // Seed System Measurements (current + historical)
    const currentMeasurement = await SystemMeasurement.create({
      timestamp: new Date(),
      oxygen_purity_percent: 43.7,
      flow_rate_m3h: 56.65,
      delivery_pressure_bar: 36.01,
      demand_coverage_percent: 67.74,
      storage_level_percent: 75.0,
      temperature: 25.0,
      data_source: "dummy",
    });

    console.log("Created current measurement");

    // Seed historical data
    const historyData = generateDummyMeasurements(14);
    await MeasurementHistory.insertMany(historyData);

    console.log("Created 14 days of historical data");

    // Seed Alarms
    const alarms = await Alarm.insertMany([
      {
        alarm_id: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        alarm_type: "low_oxygen_purity",
        threshold_value: 40,
        measured_value: 38.5,
        severity: "high",
        status: "resolved",
      },
      {
        alarm_id: 2,
        timestamp: new Date(),
        alarm_type: "low_storage",
        threshold_value: 20,
        measured_value: 15.0,
        severity: "critical",
        status: "active",
      },
    ]);

    console.log("Created alarm data");

    // Seed System Health
    const health = await SystemHealth.create({
      timestamp: new Date(),
      logging_status: "running",
      dashboard_status: "online",
      backup_status: {
        mode: "automatic",
        level_percent: 85,
        estimated_coverage_hours: 48,
      },
      notes: "System operating normally",
    });

    console.log("Created system health data");

    await BackupStatus.create({
      scenario: "normal",
      mode: "standby",
      utilization_percent: 42,
      remaining_liters: 50000,
      status: "safe",
    });

    console.log("Created backup status data");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
