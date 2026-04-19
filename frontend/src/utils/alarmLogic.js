import { STORAGE_LEVEL_THRESHOLDS } from "./backupStorageLevel";

const PSI_TO_BAR = 0.0689476;

const STREAM_SCOPED_RULE_KEYS = new Set([
  "purity-critical",
  "purity-warning",
  "flow-critical",
  "flow-warning",
  "pressure-critical",
  "pressure-warning",
  "energy-critical",
  "energy-warning",
]);

const toNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function parseOptionalNumber(raw) {
  if (raw === "" || raw === null || raw === undefined) {
    return null;
  }
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function normalizeDbValue(value) {
  if (value === "-" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Aligns with backend/services/alarmRuleEngine.js qualifyRuleKeyForStream.
 * @param {string} ruleKey
 * @param {string} [streamId]
 */
function qualifyRuleKeyForStream(ruleKey, streamId) {
  if (!streamId || !STREAM_SCOPED_RULE_KEYS.has(ruleKey)) {
    return ruleKey;
  }
  return `${ruleKey}::${String(streamId)}`;
}

function getMetricNumericValueForDashboard({
  valueKey,
  dashboardTestModeEnabled,
  dashboardTestInputs,
  currentStreamProcess,
  status,
  displayCoveragePercent,
}) {
  const testFieldByMetric = {
    purity: "purity",
    flowRate: "flowRate",
    molarFlow: "molarFlow",
    pressure: "pressureBar",
    demandCoverage: "demandCoverage",
  };
  if (dashboardTestModeEnabled) {
    const tf = testFieldByMetric[valueKey];
    if (tf) {
      const over = parseOptionalNumber(dashboardTestInputs[tf]);
      if (over !== null) {
        return over;
      }
    }
  }
  const streamReadingMap = {
    purity: normalizeDbValue(currentStreamProcess?.oxygenPurityPercent),
    flowRate: normalizeDbValue(currentStreamProcess?.flowRateM3h),
    molarFlow: normalizeDbValue(currentStreamProcess?.molarFlow),
    pressure: normalizeDbValue(currentStreamProcess?.deliveryPressureBar),
  };
  if (
    streamReadingMap[valueKey] !== undefined &&
    streamReadingMap[valueKey] !== null
  ) {
    return streamReadingMap[valueKey];
  }
  if (valueKey === "demandCoverage") {
    return displayCoveragePercent;
  }
  const reading = status?.[valueKey];
  if (reading === undefined || reading === null || reading === "") {
    return null;
  }
  const value = Number(reading);
  return Number.isFinite(value) ? value : null;
}

function buildAlarmEvaluationPoint({
  latestPoint,
  dashboardTestModeEnabled,
  dashboardTestInputs,
  currentStreamProcess,
  status,
  displayCoveragePercent,
}) {
  const toFiniteOr = (v, fallback) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
  };
  const base = latestPoint || {
    timestamp: Date.now(),
    purity: 0,
    flowRate: 0,
    pressureBar: 0,
    pressure: 0,
    specificEnergy: 0.68,
    demandCoverage: 0,
  };
  const p = getMetricNumericValueForDashboard({
    valueKey: "purity",
    dashboardTestModeEnabled,
    dashboardTestInputs,
    currentStreamProcess,
    status,
    displayCoveragePercent,
  });
  const f = getMetricNumericValueForDashboard({
    valueKey: "flowRate",
    dashboardTestModeEnabled,
    dashboardTestInputs,
    currentStreamProcess,
    status,
    displayCoveragePercent,
  });
  const b = getMetricNumericValueForDashboard({
    valueKey: "pressure",
    dashboardTestModeEnabled,
    dashboardTestInputs,
    currentStreamProcess,
    status,
    displayCoveragePercent,
  });
  const se =
    dashboardTestModeEnabled &&
    parseOptionalNumber(dashboardTestInputs.specificEnergy) !== null
      ? parseOptionalNumber(dashboardTestInputs.specificEnergy)
      : toFiniteOr(base.specificEnergy, 0.68);
  const bar = b ?? toFiniteOr(base.pressureBar, 0);
  return {
    ...base,
    purity: p ?? toFiniteOr(base.purity, 0),
    flowRate: f ?? toFiniteOr(base.flowRate, 0),
    pressureBar: bar,
    pressure: bar / PSI_TO_BAR,
    specificEnergy: se,
  };
}

function computeCoveragePercent(supplyDemand) {
  if (!supplyDemand?.supply) {
    return null;
  }
  const coverage =
    supplyDemand.supply.coveragePercent ??
    supplyDemand.supply.coverage_percent;
  if (coverage === null || coverage === undefined) {
    return null;
  }
  const parsed = Number(coverage);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildDisplayCoveragePercent({
  supplyDemand,
  dashboardTestModeEnabled,
  dashboardTestInputs,
}) {
  const coveragePercent = computeCoveragePercent(supplyDemand);
  const testDemandCoverageOverride = dashboardTestModeEnabled
    ? parseOptionalNumber(dashboardTestInputs.demandCoverage)
    : null;
  return testDemandCoverageOverride !== null
    ? testDemandCoverageOverride
    : coveragePercent;
}

function buildEffectiveSupplyDemandForAlarms({
  supplyDemand,
  dashboardTestModeEnabled,
  dashboardTestInputs,
}) {
  if (!dashboardTestModeEnabled || !supplyDemand) {
    return supplyDemand;
  }
  const cov = parseOptionalNumber(dashboardTestInputs.demandCoverage);
  if (cov === null) {
    return supplyDemand;
  }
  return {
    ...supplyDemand,
    supply: {
      ...(supplyDemand.supply || {}),
      coveragePercent: cov,
      coverage_percent: cov,
    },
  };
}

function buildEffectiveBackupForAlarms({
  backup,
  dashboardTestModeEnabled,
  dashboardTestInputs,
}) {
  if (!dashboardTestModeEnabled) {
    return backup;
  }
  const rem = parseOptionalNumber(dashboardTestInputs.backupRemaining);
  const util = parseOptionalNumber(dashboardTestInputs.backupUtilization);
  const storage = parseOptionalNumber(dashboardTestInputs.storageLevel);
  const base = backup || {
    mode: "Simulated",
    utilization: 30,
    remainingLiters: 8000,
    storageLevel: 30,
  };
  const effectiveStorageLevel =
    storage !== null ? storage : Number(base.storageLevel);
  const hasEffectiveStorage = Number.isFinite(effectiveStorageLevel);
  let effectiveMode = base.mode;
  if (hasEffectiveStorage) {
    if (effectiveStorageLevel < STORAGE_LEVEL_THRESHOLDS.warningMin) {
      effectiveMode = "critical";
    } else if (effectiveStorageLevel < 100) {
      effectiveMode = "active";
    } else {
      effectiveMode = "standby";
    }
  }
  return {
    ...base,
    mode: effectiveMode,
    remainingLiters: rem !== null ? rem : base.remainingLiters,
    remaining_liters: rem !== null ? rem : base.remainingLiters,
    utilization: util !== null ? util : base.utilization,
    storageLevel: hasEffectiveStorage ? effectiveStorageLevel : base.storageLevel,
  };
}

/**
 * Single source for KPI + alarm inputs (matches simulate + normal mode).
 */
function buildDashboardDerived({
  streamProfiles,
  activeStream,
  data,
  supplyDemand,
  backup,
  status,
  dashboardTestModeEnabled,
  dashboardTestInputs,
}) {
  if (!data.length) {
    return null;
  }
  const latestPoint = data[data.length - 1];
  const currentStreamIndex = streamProfiles.findIndex(
    (profile) => profile.id === activeStream,
  );
  const currentStreamProcess =
    streamProfiles[currentStreamIndex]?.process || null;
  const coveragePercent = computeCoveragePercent(supplyDemand);
  const displayCoveragePercent = buildDisplayCoveragePercent({
    supplyDemand,
    dashboardTestModeEnabled,
    dashboardTestInputs,
  });
  const effectiveSupplyDemand = buildEffectiveSupplyDemandForAlarms({
    supplyDemand,
    dashboardTestModeEnabled,
    dashboardTestInputs,
  });
  const effectiveBackupForAlarms = buildEffectiveBackupForAlarms({
    backup,
    dashboardTestModeEnabled,
    dashboardTestInputs,
  });
  const alarmEvaluationPoint = buildAlarmEvaluationPoint({
    latestPoint,
    dashboardTestModeEnabled,
    dashboardTestInputs,
    currentStreamProcess,
    status,
    displayCoveragePercent,
  });
  return {
    latestPoint,
    coveragePercent,
    displayCoveragePercent,
    effectiveSupplyDemand,
    effectiveBackupForAlarms,
    alarmEvaluationPoint,
  };
}

const buildAlarm = (ruleKey, idBase, severity, message, timestamp, index) => ({
  id: `${timestamp}-${idBase}-${index}`,
  ruleKey,
  severity,
  message,
  timestamp,
  acknowledged: false,
});

const generateAlarmPanelData = ({
  latestPoint,
  supplyDemand,
  backupData,
  streamId,
}) => {
  if (!latestPoint) {
    return [];
  }

  const timestamp = Date.now();
  const alarms = [];

  const addAlarm = (idBase, severity, message) => {
    const rk = qualifyRuleKeyForStream(idBase, streamId);
    alarms.push(
      buildAlarm(
        rk,
        idBase,
        severity,
        message,
        timestamp,
        alarms.length + 1,
      ),
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

  const flowRate = toNumber(latestPoint.flowRate);
  if (flowRate !== null) {
    if (flowRate < 40) {
      addAlarm(
        "flow-critical",
        "critical",
        `Oxygen flow critically low (${flowRate.toFixed(1)} m³/h).`,
      );
    } else if (flowRate < 80) {
      addAlarm(
        "flow-warning",
        "warning",
        `Oxygen flow below nominal (${flowRate.toFixed(1)} m³/h).`,
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

  const storageLevel = toNumber(backupData?.storageLevel);
  if (storageLevel !== null) {
    if (storageLevel < STORAGE_LEVEL_THRESHOLDS.warningMin) {
      addAlarm(
        "backup-storage-critical",
        "critical",
        `Backup storage critically low (${storageLevel.toFixed(2)}%).`,
      );
    } else if (storageLevel < STORAGE_LEVEL_THRESHOLDS.healthyMin) {
      addAlarm(
        "backup-storage-warning",
        "warning",
        `Backup storage running low (${storageLevel.toFixed(2)}%).`,
      );
    }
  } else {
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

export {
  PSI_TO_BAR,
  generateAlarmPanelData,
  qualifyRuleKeyForStream,
  getMetricNumericValueForDashboard,
  buildDashboardDerived,
};
