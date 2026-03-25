const SystemHealth = require("../models/systemHealth");

// Get latest system health
exports.getLatestHealth = async (req, res) => {
  try {
    const health = await SystemHealth.findOne().sort({ timestamp: -1 });
    if (!health)
      return res.status(404).json({ message: "No health data found" });
    res.json(health);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all health records
exports.getAllHealth = async (req, res) => {
  try {
    const health = await SystemHealth.find().sort({ timestamp: -1 });
    res.json(health);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create health record
exports.createHealthRecord = async (req, res) => {
  const health = new SystemHealth(req.body);
  try {
    const newHealth = await health.save();
    res.status(201).json(newHealth);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update health record
exports.updateHealthRecord = async (req, res) => {
  try {
    const health = await SystemHealth.findById(req.params.id);
    if (!health)
      return res.status(404).json({ message: "Health record not found" });

    Object.assign(health, req.body);
    const updated = await health.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
