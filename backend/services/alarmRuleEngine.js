/**
 * Dashboard rule evaluation (keep aligned with frontend/src/utils/alarmLogic.js).
 * Returns structured rows for persistence — not for UI directly.
 */

const PSI_TO_BAR = 0.0689476;

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * @param {object} measurement Mongoose SystemMeasurement doc or plain object
 */
function buildLatestPointFromMeasurement(measurement) {
  if (!measurement) {
    return null;
  }
  const ts = measurement.timestamp
    ? new Date(measurement.timestamp).getTime()
    : Date.now();
  const purity = Number(measurement.oxygen_purity_percent ?? 0);
  const flowRate = Number(measurement.flow_rate_m3h ?? 0);
  const pressureBar = Number(measurement.delivery_pressure_bar ?? 0);
  const demandCoverage = Number(measurement.demand_coverage_percent ?? 0);
  const pressurePsi = pressureBar > 0 ? pressureBar / PSI_TO_BAR : 0;
  const te = Number(measurement.temperature);
  const specificEnergy = Number.isFinite(te) ? te : 0.68;
  return {
    timestamp: ts,
    purity,
    flowRate,
    pressure: pressurePsi,
    pressureBar,
    demandCoverage,
    specificEnergy,
  };
}

/**
 * @returns {Array<{ ruleKey: string, alarmType: string, severity: string, message: string, measuredValue: number|null, thresholdValue: number|null }>}
 */
function evaluateDashboardRules({ latestPoint, supplyDemand, backupData }) {
  if (!latestPoint) {
    return [];
  }

  const rows = [];

  const push = (
    ruleKey,
    alarmType,
    severityUi,
    message,
    measuredValue,
    thresholdValue,
  ) => {
    rows.push({
      ruleKey,
      alarmType,
      severity: severityUi === "critical" ? "critical" : "medium",
      message,
      measuredValue,
      thresholdValue,
    });
  };

  const purity = toNumber(latestPoint.purity);
  if (purity !== null) {
    if (purity < 90) {
      push(
        "purity-critical",
        "low_oxygen_purity",
        "critical",
        `Oxygen purity critical (${purity.toFixed(1)} mol% O₂).`,
        purity,
        90,
      );
    } else if (purity < 93) {
      push(
        "purity-warning",
        "low_oxygen_purity",
        "warning",
        `Oxygen purity low (${purity.toFixed(1)} mol% O₂).`,
        purity,
        93,
      );
    }
  }

  const flowRate = toNumber(latestPoint.flowRate);
  if (flowRate !== null) {
    if (flowRate < 40) {
      push(
        "flow-critical",
        "low_flow_rate",
        "critical",
        `Oxygen flow critically low (${flowRate.toFixed(1)} m³/h).`,
        flowRate,
        40,
      );
    } else if (flowRate < 80) {
      push(
        "flow-warning",
        "low_flow_rate",
        "warning",
        `Oxygen flow below nominal (${flowRate.toFixed(1)} m³/h).`,
        flowRate,
        80,
      );
    }
  }

  const supplyData = supplyDemand?.supply ?? supplyDemand ?? null;
  const coveragePercent = toNumber(
    supplyData?.coverage_percent ?? supplyData?.coveragePercent,
  );
  if (coveragePercent !== null) {
    if (coveragePercent < 70) {
      push(
        "coverage-critical",
        "low_demand_coverage",
        "critical",
        `System failure risk (coverage ${coveragePercent.toFixed(1)}%).`,
        coveragePercent,
        70,
      );
    } else if (coveragePercent < 95) {
      push(
        "coverage-warning",
        "low_demand_coverage",
        "warning",
        `System under stress (coverage ${coveragePercent.toFixed(1)}%).`,
        coveragePercent,
        95,
      );
    }
  }

  const remainingLiters = toNumber(
    backupData?.remaining_liters ?? backupData?.remainingLiters,
  );
  if (remainingLiters !== null) {
    if (remainingLiters < 500) {
      push(
        "backup-volume-critical",
        "low_backup_volume",
        "critical",
        `Backup oxygen critically low (${remainingLiters.toFixed(0)} L remaining).`,
        remainingLiters,
        500,
      );
    } else if (remainingLiters < 5000) {
      push(
        "backup-volume-warning",
        "low_backup_volume",
        "warning",
        `Backup oxygen running low (${remainingLiters.toFixed(0)} L remaining).`,
        remainingLiters,
        5000,
      );
    }
  }

  const pressureBar = toNumber(
    latestPoint.pressureBar ??
      (latestPoint.pressure ?? 0) * PSI_TO_BAR,
  );
  if (pressureBar !== null) {
    if (pressureBar > 7) {
      push(
        "pressure-critical",
        "high_pressure",
        "critical",
        `Discharge pressure critical (${pressureBar.toFixed(2)} bar).`,
        pressureBar,
        7,
      );
    } else if (pressureBar > 6) {
      push(
        "pressure-warning",
        "high_pressure",
        "warning",
        `Discharge pressure high (${pressureBar.toFixed(2)} bar).`,
        pressureBar,
        6,
      );
    }
  }

  const specificEnergy = toNumber(latestPoint.specificEnergy);
  if (specificEnergy !== null) {
    if (specificEnergy > 1.0) {
      push(
        "energy-critical",
        "high_specific_energy",
        "critical",
        `Specific energy above target (${specificEnergy.toFixed(2)} kWh/Nm³).`,
        specificEnergy,
        1.0,
      );
    } else if (specificEnergy > 0.8) {
      push(
        "energy-warning",
        "high_specific_energy",
        "warning",
        `Specific energy elevated (${specificEnergy.toFixed(2)} kWh/Nm³).`,
        specificEnergy,
        0.8,
      );
    }
  }

  return rows;
}

function stableAlarmId(ruleKey) {
  let h = 5381;
  for (let i = 0; i < ruleKey.length; i++) {
    h = (h * 33) ^ ruleKey.charCodeAt(i);
  }
  return Math.abs(h) % 1000000000;
}

/** Rule keys that are tied to the selected Aspen stream (same as frontend KPIs). */
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

function mergeAspenStreamIntoLatestPoint(latestPoint, stream) {
  if (!latestPoint || !stream) {
    return latestPoint;
  }
  const out = { ...latestPoint };
  if (stream.oxygen_purity_percent != null) {
    out.purity = Number(stream.oxygen_purity_percent);
  }
  if (stream.flow_rate_m3h != null) {
    out.flowRate = Number(stream.flow_rate_m3h);
  }
  if (stream.delivery_pressure_bar != null) {
    const bar = Number(stream.delivery_pressure_bar);
    out.pressureBar = bar;
    out.pressure = bar / PSI_TO_BAR;
  }
  return out;
}

function qualifyRuleKeyForStream(ruleKey, streamId) {
  if (!streamId || !STREAM_SCOPED_RULE_KEYS.has(ruleKey)) {
    return ruleKey;
  }
  return `${ruleKey}::${String(streamId)}`;
}

function isStreamScopedRuleKey(ruleKey) {
  const base = String(ruleKey).split("::")[0];
  return STREAM_SCOPED_RULE_KEYS.has(base);
}

module.exports = {
  PSI_TO_BAR,
  buildLatestPointFromMeasurement,
  evaluateDashboardRules,
  stableAlarmId,
  mergeAspenStreamIntoLatestPoint,
  qualifyRuleKeyForStream,
  STREAM_SCOPED_RULE_KEYS,
  isStreamScopedRuleKey,
};
