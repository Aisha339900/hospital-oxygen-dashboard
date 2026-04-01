const PSI_TO_BAR = 0.0689476;

const toNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildAlarm = (idBase, severity, message, timestamp, index) => ({
  id: `${timestamp}-${idBase}-${index}`,
  severity,
  message,
  timestamp,
  acknowledged: false,
});

const generateAlarmPanelData = ({ latestPoint, supplyDemand, backupData }) => {
  if (!latestPoint) {
    return [];
  }

  const timestamp = Date.now();
  const alarms = [];

  const addAlarm = (idBase, severity, message) => {
    alarms.push(
      buildAlarm(idBase, severity, message, timestamp, alarms.length + 1),
    );
  };

  const purity = toNumber(latestPoint.purity);
  if (purity !== null) {
    if (purity < 90) {
      addAlarm(
        "purity-critical",
        "critical",
        `Oxygen purity critical (${purity.toFixed(1)} mol% O₂).`,
      );
    } else if (purity < 93) {
      addAlarm(
        "purity-warning",
        "warning",
        `Oxygen purity low (${purity.toFixed(1)} mol% O₂).`,
      );
    }
  }

  const supplyData = supplyDemand?.supply ?? supplyDemand ?? null;
  const coveragePercent = toNumber(
    supplyData?.coverage_percent ?? supplyData?.coveragePercent,
  );
  if (coveragePercent !== null) {
    if (coveragePercent < 70) {
      addAlarm(
        "coverage-critical",
        "critical",
        `System failure risk (coverage ${coveragePercent.toFixed(1)}%).`,
      );
    } else if (coveragePercent < 95) {
      addAlarm(
        "coverage-warning",
        "warning",
        `System under stress (coverage ${coveragePercent.toFixed(1)}%).`,
      );
    }
  }

  const remainingLiters = toNumber(
    backupData?.remaining_liters ?? backupData?.remainingLiters,
  );
  if (remainingLiters !== null) {
    if (remainingLiters < 500) {
      addAlarm(
        "backup-volume-critical",
        "critical",
        `Backup oxygen critically low (${remainingLiters.toFixed(0)} L remaining).`,
      );
    } else if (remainingLiters < 5000) {
      addAlarm(
        "backup-volume-warning",
        "warning",
        `Backup oxygen running low (${remainingLiters.toFixed(0)} L remaining).`,
      );
    }
  }

  const storageUtilization = toNumber(backupData?.utilization);
  if (storageUtilization !== null) {
    if (storageUtilization < 15) {
      addAlarm(
        "storage-critical",
        "critical",
        `Backup utilization critical (${storageUtilization.toFixed(1)}%).`,
      );
    } else if (storageUtilization < 25) {
      addAlarm(
        "storage-warning",
        "warning",
        `Backup utilization low (${storageUtilization.toFixed(1)}%).`,
      );
    }
  }

  const pressureBar = toNumber(
    latestPoint.pressureBar ?? (latestPoint.pressure ?? 0) * PSI_TO_BAR,
  );
  if (pressureBar !== null) {
    if (pressureBar > 7) {
      addAlarm(
        "pressure-critical",
        "critical",
        `Discharge pressure critical (${pressureBar.toFixed(2)} bar).`,
      );
    } else if (pressureBar > 6) {
      addAlarm(
        "pressure-warning",
        "warning",
        `Discharge pressure high (${pressureBar.toFixed(2)} bar).`,
      );
    }
  }

  const specificEnergy = toNumber(latestPoint.specificEnergy);
  if (specificEnergy !== null) {
    if (specificEnergy > 1.0) {
      addAlarm(
        "energy-critical",
        "critical",
        `Specific energy above target (${specificEnergy.toFixed(2)} kWh/Nm³).`,
      );
    } else if (specificEnergy > 0.8) {
      addAlarm(
        "energy-warning",
        "warning",
        `Specific energy elevated (${specificEnergy.toFixed(2)} kWh/Nm³).`,
      );
    }
  }

  return alarms;
};

export { generateAlarmPanelData };
