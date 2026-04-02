// Generate realistic dummy data — one document per calendar day (today back).
// `dayCount` is the number of rows (e.g. 14 for “last 14 days” charts).
const generateDummyMeasurements = (dayCount = 14) => {
  const measurements = [];
  const basePurity = 43.7;
  const baseFlowRate = 56.65;
  const basePressure = 36.01;
  const baseStorage = 75.0;

  for (let i = 0; i < dayCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(Math.floor(Math.random() * 24));

    // Add realistic variation
    const purityVariation = (Math.random() - 0.5) * 5;
    const flowVariation = (Math.random() - 0.5) * 10;
    const pressureVariation = (Math.random() - 0.5) * 8;
    const storageVariation = (Math.random() - 0.5) * 10;

    // Add trend (sinusoidal)
    const trend = Math.sin(i / 7) * 2;

    measurements.push({
      date,
      measurements: {
        oxygen_purity: {
          value: Math.max(
            30,
            Math.min(100, basePurity + purityVariation + trend),
          ),
        },
        flow_rate: {
          value: Math.max(30, baseFlowRate + flowVariation),
        },
        pressure: {
          value: Math.max(20, basePressure + pressureVariation),
        },
        storage_level: {
          value: Math.max(10, Math.min(100, baseStorage + storageVariation)),
        },
      },
      period: "daily",
    });
  }

  return measurements;
};

/** Hourly-ish snapshots for `systemmeasurements` (latest row wins for GET /current). */
const generateSystemMeasurementSnapshots = (count = 72, hoursBetween = 1) => {
  const rows = [];
  const basePurity = 43.7;
  const baseFlow = 56.65;
  const basePressure = 36.01;
  const baseStorage = 75.0;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - i * hoursBetween);

    const purityVariation = (Math.random() - 0.5) * 5;
    const flowVariation = (Math.random() - 0.5) * 10;
    const pressureVariation = (Math.random() - 0.5) * 8;
    const storageVariation = (Math.random() - 0.5) * 10;
    const trend = Math.sin(i / 12) * 3;

    rows.push({
      timestamp,
      oxygen_purity_percent: Math.max(
        30,
        Math.min(100, basePurity + purityVariation + trend * 0.1),
      ),
      flow_rate_m3h: Math.max(30, baseFlow + flowVariation),
      delivery_pressure_bar: Math.max(20, basePressure + pressureVariation),
      storage_level_percent: Math.max(
        10,
        Math.min(100, baseStorage + storageVariation + trend),
      ),
      data_source: "dummy",
    });
  }

  return rows;
};

module.exports = {
  generateDummyMeasurements,
  generateSystemMeasurementSnapshots,
};
