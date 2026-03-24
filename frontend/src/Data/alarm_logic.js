const PSI_TO_BAR = 0.0689476;

const toNumber = (value) => {
  if (typeof value === 'number') {
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
  acknowledged: false
}); 

const generateAlarmPanelData = ({ latestPoint, supplyDemand, backupData }) => {
  if (!latestPoint) {
    return [];
  }

  const timestamp = Date.now();
  const alarms = [];

  const addAlarm = (idBase, severity, message) => {
    alarms.push(buildAlarm(idBase, severity, message, timestamp, alarms.length + 1));
  };

  const purity = toNumber(latestPoint.purity);
  if (purity !== null) {
    if (purity < 90) {
      addAlarm('purity-critical', 'critical', `Oxygen purity critical (${purity.toFixed(1)} mol% O₂).`);
    } else if (purity < 93) {
      addAlarm('purity-warning', 'warning', `Oxygen purity low (${purity.toFixed(1)} mol% O₂).`);
    }
  }

  const demandValue = toNumber(supplyDemand?.currentDemand);
  const supplyValue = toNumber(supplyDemand?.currentSupply);
  let coveragePercent = toNumber(latestPoint.demandCoverage);
  if (demandValue !== null && demandValue > 0 && supplyValue !== null) {
    coveragePercent = (supplyValue / demandValue) * 100;
  }
  if (coveragePercent !== null) {
    if (coveragePercent < 85) {
      addAlarm('coverage-critical', 'critical', `Demand coverage critical (${coveragePercent.toFixed(1)}%).`);
    } else if (coveragePercent < 95) {
      addAlarm('coverage-warning', 'warning', `Demand coverage low (${coveragePercent.toFixed(1)}%).`);
    }
  }

  const remainingHours = toNumber(backupData?.remainingHours);
  if (remainingHours !== null) {
    if (remainingHours < 6) {
      addAlarm('backup-hours-critical', 'critical', `Backup coverage below 6 hours (${remainingHours.toFixed(1)}h).`);
    } else if (remainingHours < 8) {
      addAlarm('backup-hours-warning', 'warning', `Backup coverage trending low (${remainingHours.toFixed(1)}h).`);
    }
  }

  const storageLevel = toNumber(backupData?.level);
  if (storageLevel !== null) {
    if (storageLevel < 15) {
      addAlarm('storage-critical', 'critical', `Storage level critical (${storageLevel.toFixed(1)}%).`);
    } else if (storageLevel < 25) {
      addAlarm('storage-warning', 'warning', `Storage level low (${storageLevel.toFixed(1)}%).`);
    }
  }

  const pressureBar = toNumber(latestPoint.pressureBar ?? (latestPoint.pressure ?? 0) * PSI_TO_BAR);
  if (pressureBar !== null) {
    if (pressureBar > 7) {
      addAlarm('pressure-critical', 'critical', `Discharge pressure critical (${pressureBar.toFixed(2)} bar).`);
    } else if (pressureBar > 6) {
      addAlarm('pressure-warning', 'warning', `Discharge pressure high (${pressureBar.toFixed(2)} bar).`);
    }
  }

  const specificEnergy = toNumber(latestPoint.specificEnergy);
  if (specificEnergy !== null) {
    if (specificEnergy > 1.0) {
      addAlarm(
        'energy-critical',
        'critical',
        `Specific energy above target (${specificEnergy.toFixed(2)} kWh/Nm³).`
      );
    } else if (specificEnergy > 0.8) {
      addAlarm('energy-warning', 'warning', `Specific energy elevated (${specificEnergy.toFixed(2)} kWh/Nm³).`);
    }
  }

  return alarms;
};

export { generateAlarmPanelData };
