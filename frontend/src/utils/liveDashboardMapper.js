/**
 * Map MongoDB / API payloads into shapes expected by App.jsx and dashboard panels.
 */

import {
  measurementService,
  historyService,
  systemHealthService,
  backupService,
  demandStatusService,
  supplyStatusService,
} from "../services";
import backupPanelDefaults from "../config/backupPanelDefaults.js";

const PSI_TO_BAR = 0.0689476;

export function mapMeasurementToStatus(m) {
  if (!m) return null;
  const ts = m.timestamp ? new Date(m.timestamp).getTime() : Date.now();
  const purity = Number(m.oxygen_purity_percent ?? 0);
  const flowRate = Number(m.flow_rate_m3h ?? 0);
  const pressureBar = Number(m.delivery_pressure_bar ?? 0);
  const demandCoverage = Number(m.demand_coverage_percent ?? 0);
  const pressurePsi = pressureBar / PSI_TO_BAR;
  return {
    status: purity > 96 && pressurePsi > 48 ? "optimal" : "warning",
    purity: purity.toFixed(2),
    flowRate: flowRate.toFixed(2),
    pressure: pressureBar.toFixed(2),
    demandCoverage: demandCoverage.toFixed(2),
    specificEnergy: Number(m.temperature ?? 0).toFixed(2),
    timestamp: ts,
  };
}

/** When only merged trend rows exist (no current measurement document). */
export function mapTrendPointToStatus(row) {
  if (!row) return null;
  return {
    status: row.purity > 96 && row.pressure > 48 ? "optimal" : "warning",
    purity: Number(row.purity).toFixed(2),
    flowRate: Number(row.flowRate).toFixed(2),
    pressure: Number(row.pressureBar ?? 0).toFixed(2),
    demandCoverage: Number(row.demandCoverage).toFixed(2),
    specificEnergy: Number(row.specificEnergy ?? 0).toFixed(2),
    timestamp: row.timestamp,
  };
}

function trendRow(timestamp, purity, flowRate, pressureBar, demandCoverage) {
  const pressurePsi = pressureBar > 0 ? pressureBar / PSI_TO_BAR : 0;
  return {
    timestamp,
    purity,
    flowRate,
    pressure: pressurePsi,
    pressureBar,
    demandCoverage,
    specificEnergy: 0.68,
  };
}

/** Merge /history/* trend payloads (each has { data: [{ date, value }] }) into chart rows. */
export function mergeHistoryTrendRows(
  purityPayload,
  flowPayload,
  pressurePayload,
  demandCoverageFallback,
) {
  const p = purityPayload?.data || [];
  const f = flowPayload?.data || [];
  const pr = pressurePayload?.data || [];
  const byKey = new Map();

  const ingest = (points, key) => {
    points.forEach((pt) => {
      const t = new Date(pt.date).getTime();
      const k = String(t);
      if (!byKey.has(k)) {
        byKey.set(k, { timestamp: t });
      }
      const row = byKey.get(k);
      row[key] = typeof pt.value === "number" ? pt.value : Number(pt.value);
    });
  };

  ingest(p, "purity");
  ingest(f, "flowRate");
  ingest(pr, "pressureBar");

  const sorted = Array.from(byKey.values()).sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  return sorted.map((row) =>
    trendRow(
      row.timestamp,
      row.purity ?? 0,
      row.flowRate ?? 0,
      row.pressureBar ?? 0,
      demandCoverageFallback ?? row.demandCoverage ?? 0,
    ),
  );
}

export function mapStorageMonthlyPayload(api) {
  const lm = api?.lastMonth || [];
  const tm = api?.thisMonth || [];
  const maxLen = Math.max(lm.length, tm.length, 1);
  const rows = [];
  for (let i = 0; i < maxLen; i++) {
    const d = lm[i]?.date || tm[i]?.date;
    const label = d
      ? new Date(d).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : `${i + 1}`;
    rows.push({
      label,
      lastMonth: lm[i]?.value ?? 0,
      thisMonth: tm[i]?.value ?? 0,
    });
  }
  return rows;
}

const SEVERITY_BADGE = {
  low: "warning",
  medium: "warning",
  high: "critical",
  critical: "critical",
};

// const fallbackModeKey =
//   backupPanelDefaults?.fallbackModeKey ?? backupPanelDefaults?.modes?.active?.id ?? "standby";
// const fallbackModeLabel =
//   backupPanelDefaults?.modes?.[fallbackModeKey]?.label ?? fallbackModeKey;
// const fallbackUtilization =
//   backupPanelDefaults?.fallbacks?.utilizationPercent ?? 0;
// const fallbackRemaining =
//   backupPanelDefaults?.fallbacks?.remainingLiters ?? 0;

const buildBackupFallback = () => null;

const toFiniteNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const summarizeCoverageStatus = (coveragePercent, fallbackStatus) => {
  if (fallbackStatus && typeof fallbackStatus === "string") {
    return fallbackStatus;
  }
  if (coveragePercent === null) {
    return "Coverage unavailable";
  }
  if (coveragePercent >= 95) {
    return "Supply aligned with demand";
  }
  if (coveragePercent >= 70) {
    return "System under stress";
  }
  return "System failure risk";
};

const formatForecastLine = (coveragePercent) => {
  if (coveragePercent === null) {
    return "Awaiting live demand and supply data";
  }
  return `Demand coverage at ${coveragePercent.toFixed(0)}%.`;
};

export function mapScenarioDemandSupply(demandStatus, supplyStatus) {
  if (!demandStatus && !supplyStatus) {
    return null;
  }

  const generalRequests = toFiniteNumber(demandStatus?.general_requests);
  const icuRequests = toFiniteNumber(demandStatus?.icu_requests);
  const totalRequests =
    generalRequests !== null || icuRequests !== null
      ? (generalRequests ?? 0) + (icuRequests ?? 0)
      : null;
  const demand = demandStatus
    ? {
        scenario: demandStatus.scenario,
        status: demandStatus.status,
        generalRequests,
        general_requests: generalRequests,
        icuRequests,
        icu_requests: icuRequests,
        totalRequests,
        total_requests: totalRequests,
        generalWip: toFiniteNumber(demandStatus.general_wip),
        general_wip: toFiniteNumber(demandStatus.general_wip),
        icuWip: toFiniteNumber(demandStatus.icu_wip),
        icu_wip: toFiniteNumber(demandStatus.icu_wip),
      }
    : null;

  const mainUtilization = toFiniteNumber(
    supplyStatus?.main_utilization_percent,
  );
  const remainingLiters = toFiniteNumber(
    supplyStatus?.main_remaining_liters,
  );
  const coveragePercent = toFiniteNumber(supplyStatus?.coverage_percent);
  const supply = supplyStatus
    ? {
        scenario: supplyStatus.scenario,
        status: supplyStatus.status,
        mainUtilizationPercent: mainUtilization,
        main_utilization_percent: mainUtilization,
        mainRemainingLiters: remainingLiters,
        main_remaining_liters: remainingLiters,
        coveragePercent,
        coverage_percent: coveragePercent,
      }
    : null;

  return {
    demand,
    supply,
    status: summarizeCoverageStatus(
      coveragePercent,
      supplyStatus?.status || demandStatus?.status,
    ),
    forecast: formatForecastLine(coveragePercent),
  };
}

export function mapDbAlarmToPanel(a) {
  if (!a) return null;
  const stored = a.message && String(a.message).trim();
  const msg = stored
    ? String(a.message)
    : `${(a.alarm_type || "alarm").replace(/_/g, " ")} — measured ${a.measured_value ?? "n/a"}`;
  return {
    id: String(a._id ?? a.alarm_id ?? Math.random()),
    ruleKey: a.rule_key ? String(a.rule_key) : null,
    severity: SEVERITY_BADGE[a.severity] || a.severity || "warning",
    message: msg,
    timestamp: new Date(a.timestamp).getTime(),
    acknowledged: a.status === "acknowledged" || a.status === "resolved",
  };
}

export function mapBackupStatusToPanel(payload) {
  if (!payload) return null;

  const source = payload.backup_status ?? payload;
  if (!source) return null;

  const fallback = buildBackupFallback();
  const rawMode =
    typeof source.mode === "string" && source.mode.length
      ? source.mode
      : fallback?.mode ?? "UNKNOWN";
  const normalizedMode = rawMode.toLowerCase();
  const modeConfig = backupPanelDefaults?.modes?.[normalizedMode];
  const mode = modeConfig?.label ?? rawMode;

  const utilizationCandidate =
    source.utilization_percent ??
    source.level_percent ??
    source.utilization ??
    fallback?.utilization ?? null;
  const utilization = Number.isFinite(Number(utilizationCandidate))
    ? Number(utilizationCandidate)
    : 0;

  const litersCandidate =
    source.remaining_liters ?? source.remainingLiters ?? fallback?.remainingLiters ?? null;
  const remainingLiters = Number.isFinite(Number(litersCandidate))
    ? Number(litersCandidate)
    : 0;

  const storageLevelCandidate =
    source.storageLevel ?? null;
  const storageLevel = Number.isFinite(Number(storageLevelCandidate))
    ? Number(storageLevelCandidate)
    : 0;

  return {
    mode,
    utilization,
    remainingLiters,
    storageLevel,
  };
}


export function trendPointsFromMeasurement(m) {
  if (!m) return [];
  const ts = new Date(m.timestamp).getTime();
  const purity = Number(m.oxygen_purity_percent ?? 0);
  const flowRate = Number(m.molar_flow ?? 0);
  const pressureBar = Number(m.delivery_pressure_bar ?? 0);
  const demandCoverage = Number(m.demand_coverage_percent ?? 0);
  const pressurePsi = pressureBar > 0 ? pressureBar / PSI_TO_BAR : 0;
  return [
    {
      timestamp: ts,
      purity,
      flowRate,
      pressure: pressurePsi,
      pressureBar,
      demandCoverage,
      specificEnergy: 0.68,
    },
  ];
}

/**
 * Load dashboard slices from the Express API. Throws if nothing usable is returned
 * (caller falls back to client-side mock generators).
 */
export async function loadLiveDashboard() {
  const preferredScenario = backupPanelDefaults?.defaultScenario ?? "normal";
  let current = null;
  try {
    current = await measurementService.getCurrentMeasurements();
  } catch {
    /* no current snapshot */
  }

  let purity = { data: [] };
  let flow = { data: [] };
  let pressure = { data: [] };
  let storage = { lastMonth: [], thisMonth: [] };
  let trendDataPayload = { data: [] };
  try {
    [purity, flow, pressure, storage, trendDataPayload] = await Promise.all([
      historyService.getOxygenPurityTrend(),
      historyService.getFlowRateTrend(),
      historyService.getPressureTrend(),
      historyService.getStorageLevelMonthly(),
      historyService.getTrendData(),
    ]);
  } catch {
    /* history optional */
  }

  const trendData = Array.isArray(trendDataPayload?.data)
    ? trendDataPayload.data
    : [];

  const dc = Number(current?.demand_coverage_percent ?? 0);
  let merged = mergeHistoryTrendRows(purity, flow, pressure, dc);
  if (merged.length === 0 && current) {
    merged = trendPointsFromMeasurement(current);
  }

  const status = current
    ? mapMeasurementToStatus(current)
    : merged.length
      ? mapTrendPointToStatus(merged[merged.length - 1])
      : null;

  let demandStatus = null;
  let supplyStatus = null;
  try {
    [demandStatus, supplyStatus] = await Promise.all([
      demandStatusService.getDemandStatus(preferredScenario),
      supplyStatusService.getSupplyStatus(preferredScenario),
    ]);
  } catch {
    demandStatus = null;
    supplyStatus = null;
  }

  const supplyDemand = mapScenarioDemandSupply(demandStatus, supplyStatus);

  // Demand coverage KPI must come from supply_status when available.
  const supplyCoverage = supplyDemand?.supply?.coveragePercent;
  const normalizedSupplyCoverage =
    Number.isFinite(Number(supplyCoverage))
      ? Number(supplyCoverage).toFixed(2)
      : null;
  const normalizedCurrentCoverage = Number(current?.demand_coverage_percent);
  const normalizedCurrentCoverageText = Number.isFinite(normalizedCurrentCoverage)
    ? normalizedCurrentCoverage.toFixed(2)
    : null;
  const resolvedCoverage =
    normalizedSupplyCoverage ?? normalizedCurrentCoverageText;
  if (status && resolvedCoverage !== null) {
    status.demandCoverage = resolvedCoverage;
  }

  let storageLevels = mapStorageMonthlyPayload(storage);
  if (storageLevels.length === 0 && current) {
    const sl = Number(current.storageLevel ?? 0);
    storageLevels = [{ label: "Live", lastMonth: sl, thisMonth: sl }];
  }

  let backup = null;
  try {
    const backupPayload = await backupService.getBackupStatus(
      preferredScenario,
    );
    backup = mapBackupStatusToPanel(backupPayload);
  } catch {
    try {
      const health = await systemHealthService.getLatestHealth();
      backup = mapBackupStatusToPanel(health);
    } catch {
      backup = null;
    }
  }

  // if (!backup) {
  //   backup = buildBackupFallback();
  // }

  if (!status && merged.length === 0) {
    throw new Error("Live API unavailable");
  }

  return {
    data: merged,
    trendData,
    status,
    storageLevels,
    backup,
    supplyDemand,
  };
}
