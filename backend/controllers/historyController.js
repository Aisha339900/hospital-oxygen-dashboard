const MeasurementHistory = require("../models/measurementHistory");
const mongoose = require("mongoose");

const TREND_DB_NAME = "hospital-oxygen-dashboard";
const TREND_COLLECTION = "trend_data";

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Legacy history-chart endpoints were removed from the frontend.
// Keeping this block commented for reference in case those charts return.
// exports.getOxygenPurityTrend = async (req, res) => {
//   try {
//     const fourteenDaysAgo = new Date();
//     fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
//
//     const data = await MeasurementHistory.find({
//       date: { $gte: fourteenDaysAgo },
//       period: "daily",
//     }).sort({ date: 1 });
//
//     res.json({
//       metric: "oxygen_purity",
//       period: "last_14_days",
//       data: data.map((d) => ({
//         date: d.date,
//         value: d.measurements.oxygen_purity.value,
//       })),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
//
// exports.getFlowRateTrend = async (req, res) => {
//   try {
//     const fourteenDaysAgo = new Date();
//     fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
//
//     const data = await MeasurementHistory.find({
//       date: { $gte: fourteenDaysAgo },
//       period: "daily",
//     }).sort({ date: 1 });
//
//     res.json({
//       metric: "flow_rate",
//       period: "last_14_days",
//       data: data.map((d) => ({
//         date: d.date,
//         value: d.measurements.flow_rate.value,
//       })),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
//
// exports.getPressureTrend = async (req, res) => {
//   try {
//     const fourteenDaysAgo = new Date();
//     fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
//
//     const data = await MeasurementHistory.find({
//       date: { $gte: fourteenDaysAgo },
//       period: "daily",
//     }).sort({ date: 1 });
//
//     res.json({
//       metric: "pressure",
//       period: "last_14_days",
//       data: data.map((d) => ({
//         date: d.date,
//         value: d.measurements.pressure.value,
//       })),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
//
// exports.getStorageLevelMonthly = async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const currentMonth = currentDate.getMonth();
//     const currentYear = currentDate.getFullYear();
//
//     const currentMonthStart = new Date(currentYear, currentMonth, 1);
//     const currentMonthEnd = new Date(currentYear, currentMonth + 1, 1);
//
//     const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
//     const lastMonthEnd = new Date(currentYear, currentMonth, 1);
//
//     const currentMonthData = await MeasurementHistory.find({
//       date: {
//         $gte: currentMonthStart,
//         $lt: currentMonthEnd,
//       },
//     }).sort({ date: 1 });
//
//     const lastMonthData = await MeasurementHistory.find({
//       date: {
//         $gte: lastMonthStart,
//         $lt: lastMonthEnd,
//       },
//     }).sort({ date: 1 });
//
//     res.json({
//       metric: "storageLevel",
//       period: "monthly_comparison",
//       lastMonth: lastMonthData.map((d) => ({
//         date: d.date,
//         value: d.measurements.storage_level.value,
//       })),
//       thisMonth: currentMonthData.map((d) => ({
//         date: d.date,
//         value: d.measurements.storage_level.value,
//       })),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Get trend chart points from hospital-oxygen-dashboard.trend_data
exports.getTrendData = async (req, res) => {
  try {
    const collection = mongoose
      .connection
      .useDb(TREND_DB_NAME)
      .collection(TREND_COLLECTION);

    const docs = await collection.find({}).sort({ _id: 1 }).toArray();
    const data = docs
      .map((doc) => {
        const feedFlow = toNumberOrNull(
          doc.feed_flow_kmol_h ?? doc.feed_kmol_h,
        );
        const productFlow = toNumberOrNull(
          doc.product_flow_L_min ?? doc.flow_rate_L_min,
        );
        const oxygenPurityRaw = toNumberOrNull(
          doc.oxygen_purity_percent ?? doc.o2_purity,
        );
        const oxygenPurityPercent =
          oxygenPurityRaw === null
            ? null
            : oxygenPurityRaw <= 1
              ? Number((oxygenPurityRaw * 100).toFixed(2))
              : Number(oxygenPurityRaw.toFixed(2));

        return {
          feed_flow_kmol_h: feedFlow,
          product_flow_L_min: productFlow,
          oxygen_purity_percent: oxygenPurityPercent,
        };
      })
      .filter((row) => row.feed_flow_kmol_h !== null)
      .sort((a, b) => a.feed_flow_kmol_h - b.feed_flow_kmol_h);

    res.json({
      metric: "trend_data",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
