const SystemMeasurement = require("../models/systemMeasurement");

// Get current measurements
exports.getCurrentMeasurements = async (req, res) => {
  try {
    const measurement = await SystemMeasurement.findOne()
      .sort({ timestamp: -1 })
      .limit(1);

    if (!measurement) {
      return res.status(404).json({ message: "No measurements found" });
    }
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all measurements (paginated)
exports.getAllMeasurements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const measurements = await SystemMeasurement.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SystemMeasurement.countDocuments();

    res.json({
      data: measurements,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new measurement
exports.createMeasurement = async (req, res) => {
  const measurement = new SystemMeasurement(req.body);
  try {
    const newMeasurement = await measurement.save();
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get measurements by date range
exports.getMeasurementsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const measurements = await SystemMeasurement.find({
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ timestamp: -1 });

    res.json(measurements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
