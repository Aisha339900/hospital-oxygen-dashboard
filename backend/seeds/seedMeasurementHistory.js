/**
 * Replace only `measurementhistories` with 14 daily dummy rows (today → 13 days ago).
 * Usage: from `backend/`:  npm run seed:history
 */
require("dotenv").config();
const connectDB = require("../config/database");
const MeasurementHistory = require("../models/measurementHistory");
const { generateDummyMeasurements } = require("../utils/dataGenerator");

const DAY_COUNT = 14;

async function run() {
  try {
    await connectDB();
    await MeasurementHistory.deleteMany({});
    const rows = generateDummyMeasurements(DAY_COUNT);
    await MeasurementHistory.insertMany(rows);
    console.log(
      `MeasurementHistory: cleared and inserted ${rows.length} daily documents.`,
    );
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
