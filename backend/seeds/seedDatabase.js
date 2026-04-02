require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/database");

const Stream = require("../models/stream");
const SystemMeasurement = require("../models/systemMeasurement");
const MeasurementHistory = require("../models/measurementHistory");
const Alarm = require("../models/alarm");
const SystemHealth = require("../models/systemHealth");
const BackupStatus = require("../models/backupStatus");
const DemandStatus = require("../models/demandStatus");
const SupplyStatus = require("../models/supplyStatus");

const {
  generateDummyMeasurements,
  generateSystemMeasurementSnapshots,
} = require("../utils/dataGenerator");

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
    await DemandStatus.deleteMany({});
    await SupplyStatus.deleteMany({});

    console.log("Cleared existing data");

    // Seed Streams 
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

    // Seed system measurement snapshots (latest by timestamp is "current"; includes storage % for charts)
    const snapshots = generateSystemMeasurementSnapshots(72, 1);
    await SystemMeasurement.insertMany(snapshots);

    console.log(
      `Created ${snapshots.length} system measurement snapshots (daily, last ${snapshots.length})`,
    );

    // Seed historical data
    const historyData = generateDummyMeasurements(14);
    await MeasurementHistory.insertMany(historyData);

    console.log(`Created ${historyData.length} days of historical data`);

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

    await DemandStatus.insertMany([
      {
        scenario: "normal",
        general_requests: 97,
        icu_requests: 16,
        general_wip: 7.53,
        icu_wip: 3.07,
        status: "low",
      },
      {
        scenario: "peak",
        general_requests: 153,
        icu_requests: 31,
        general_wip: 15.15,
        icu_wip: 7.46,
        status: "medium",
      },
      {
        scenario: "catastrophic",
        general_requests: 200,
        icu_requests: 37,
        general_wip: 27.24,
        icu_wip: 12.34,
        status: "high",
      },
    ]);

    console.log("Created demand status data");

    await SupplyStatus.insertMany([
      {
        scenario: "normal",
        main_utilization_percent: 63.95,
        main_remaining_liters: 54081.6,
        coverage_percent: 100,
        status: "healthy",
      },
      {
        scenario: "peak",
        main_utilization_percent: 100,
        main_remaining_liters: 0,
        coverage_percent: 100,
        status: "high_load",
      },
      {
        scenario: "catastrophic",
        main_utilization_percent: 100,
        main_remaining_liters: 0,
        coverage_percent: 67.93,
        status: "failure",
      },
    ]);

    console.log("Created supply status data");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
