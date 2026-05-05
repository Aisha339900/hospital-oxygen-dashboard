const mongoose = require("mongoose");

const ANALYTICS_DB_NAME = "hospital-oxygen-dashboard";
const ANALYTICS_COLLECTION = "pressure_purity_capacity";

exports.getPressurePurityCapacityCharts = async (req, res) => {
  try {
    const collection = mongoose
      .connection
      .useDb(ANALYTICS_DB_NAME)
      .collection(ANALYTICS_COLLECTION);

    const documents = await collection.find({}).sort({ pressure_bar: 1 }).toArray();

    res.json({
      collection: ANALYTICS_COLLECTION,
      database: ANALYTICS_DB_NAME,
      observations: documents.map((doc, index) => ({
        observation: index + 1,
        pressure_bar: doc?.pressure_bar ?? null,
        o2_purity: doc?.o2_purity ?? null,
        o2_capacity_nm3h: doc?.o2_capacity_nm3h ?? null,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};