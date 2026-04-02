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

/**
 * One row per calendar month (last N months, oldest → newest).
 * X-axis: full month names (February, March, April, …).
 * lastMonth = previous calendar month’s average storage; thisMonth = that row’s month average.
 */
exports.getStorageLevelMonthly = async (req, res) => {
  try {
    const raw = parseInt(req.query.months, 10);
    const monthCount = Number.isFinite(raw) && raw >= 2 && raw <= 12 ? raw : 6;

    const now = new Date();
    const cy = now.getUTCFullYear();
    const cm = now.getUTCMonth();

    const rangeStart = new Date(Date.UTC(cy, cm - monthCount, 1));
    const rangeEnd = new Date(Date.UTC(cy, cm + 1, 1));

    const docs = await MeasurementHistory.find({
      date: { $gte: rangeStart, $lt: rangeEnd },
    }).lean();

    const bucketKey = (y, m) => `${y}-${m}`;
    const buckets = new Map();

    for (const d of docs) {
      const dt = new Date(d.date);
      const key = bucketKey(dt.getUTCFullYear(), dt.getUTCMonth());
      if (!buckets.has(key)) {
        buckets.set(key, { sum: 0, n: 0 });
      }
      const b = buckets.get(key);
      const v = d.measurements?.storage_level?.value;
      if (typeof v === "number" && !Number.isNaN(v)) {
        b.sum += v;
        b.n += 1;
      }
    }

    const avgFor = (y, m) => {
      const b = buckets.get(bucketKey(y, m));
      if (!b || b.n === 0) {
        return null;
      }
      return b.sum / b.n;
    };

    const data = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const monthStart = new Date(Date.UTC(cy, cm - i, 1));
      const y = monthStart.getUTCFullYear();
      const m = monthStart.getUTCMonth();
      const prevStart = new Date(Date.UTC(cy, cm - i - 1, 1));

      const py = prevStart.getUTCFullYear();
      const pm = prevStart.getUTCMonth();

      const thisAvg = avgFor(y, m);
      const prevAvg = avgFor(py, pm);

      data.push({
        monthStart: monthStart.toISOString(),
        lastMonth: prevAvg ?? 0,
        thisMonth: thisAvg ?? 0,
      });
    }

    res.json({
      metric: "storage_level",
      period: "monthly_comparison",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
