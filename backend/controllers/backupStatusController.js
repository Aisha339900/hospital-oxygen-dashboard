const BackupStatus = require("../models/backupStatus");

const DEFAULT_SCENARIO = "normal";

exports.getBackupStatusByScenario = async (req, res) => {
  try {
    const scenario = (req.query.scenario || DEFAULT_SCENARIO).toLowerCase();
    const backup = await BackupStatus.findOne({ scenario });

    if (!backup) {
      return res
        .status(404)
        .json({ message: `No backup status found for scenario ${scenario}` });
    }

    res.json(backup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBackupStatuses = async (req, res) => {
  try {
    const backups = await BackupStatus.find().sort({ scenario: 1 });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
