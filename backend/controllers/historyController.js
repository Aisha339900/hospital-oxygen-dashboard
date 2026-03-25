const MeasurementHistory = require("../models/measurementHistory");

// Get last 14 days of oxygen purity
exports.getOxygenPurityTrend = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const data = await MeasurementHistory.find({
      date: { $gte: fourteenDaysAgo },
      period: "daily",
    }).sort({ date: 1 });

    res.json({
      metric: "oxygen_purity",
      period: "last_14_days",
      data: data.map((d) => ({
        date: d.date,
        value: d.measurements.oxygen_purity.value,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get flow rate trend
exports.getFlowRateTrend = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const data = await MeasurementHistory.find({
      date: { $gte: fourteenDaysAgo },
      period: "daily",
    }).sort({ date: 1 });

    res.json({
      metric: "flow_rate",
      period: "last_14_days",
      data: data.map((d) => ({
        date: d.date,
        value: d.measurements.flow_rate.value,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pressure trend
exports.getPressureTrend = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const data = await MeasurementHistory.find({
      date: { $gte: fourteenDaysAgo },
      period: "daily",
    }).sort({ date: 1 });

    res.json({
      metric: "pressure",
      period: "last_14_days",
      data: data.map((d) => ({
        date: d.date,
        value: d.measurements.pressure.value,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get storage level monthly comparison
exports.getStorageLevelMonthly = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get current month data
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 1);

    // Get last month data
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 1);

    const currentMonthData = await MeasurementHistory.find({
      date: {
        $gte: currentMonthStart,
        $lt: currentMonthEnd,
      },
    }).sort({ date: 1 });

    const lastMonthData = await MeasurementHistory.find({
      date: {
        $gte: lastMonthStart,
        $lt: lastMonthEnd,
      },
    }).sort({ date: 1 });

    res.json({
      metric: "storage_level",
      period: "monthly_comparison",
      lastMonth: lastMonthData.map((d) => ({
        date: d.date,
        value: d.measurements.storage_level.value,
      })),
      thisMonth: currentMonthData.map((d) => ({
        date: d.date,
        value: d.measurements.storage_level.value,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
