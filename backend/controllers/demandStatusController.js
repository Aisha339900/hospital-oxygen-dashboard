const DemandStatus = require("../models/demandStatus");

const DEFAULT_SCENARIO = "normal";

const resolveScenario = (value = DEFAULT_SCENARIO) => String(value).toLowerCase();

exports.getDemandStatusByScenario = async (req, res) => {
  try {
    const scenario = resolveScenario(req.query.scenario);
    const payload = await DemandStatus.findOne({ scenario });

    if (!payload) {
      return res
        .status(404)
        .json({ message: `No demand status found for scenario ${scenario}` });
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDemandStatuses = async (_req, res) => {
  try {
    const payload = await DemandStatus.find().sort({ scenario: 1 });
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
