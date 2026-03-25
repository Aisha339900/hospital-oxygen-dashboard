// Generate realistic dummy data
const generateDummyMeasurements = (daysBack = 14) => {
  const measurements = [];
  const basePurity = 43.7;
  const baseFlowRate = 56.65;
  const basePressure = 36.01;
  const baseStorage = 75.0;

  for (let i = daysBack; i >= 0; i--) {
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
          value: Math.max(30, basePressure + flowVariation),
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

module.exports = {
  generateDummyMeasurements,
};
