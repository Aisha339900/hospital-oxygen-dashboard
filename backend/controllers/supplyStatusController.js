const SupplyStatus = require("../models/supplyStatus");

const DEFAULT_SCENARIO = "normal";

const resolveScenario = (value = DEFAULT_SCENARIO) => String(value).toLowerCase();

exports.getSupplyStatusByScenario = async (req, res) => {
  try {
    const scenario = resolveScenario(req.query.scenario);
    const payload = await SupplyStatus.findOne({ scenario });

    if (!payload) {
      return res
        .status(404)
        .json({ message: `No supply status found for scenario ${scenario}` });
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSupplyStatuses = async (_req, res) => {
  try {
    const payload = await SupplyStatus.find().sort({ scenario: 1 });
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
