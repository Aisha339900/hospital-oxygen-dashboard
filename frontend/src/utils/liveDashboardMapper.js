/**
 * Map MongoDB / API payloads into shapes expected by App.jsx and dashboard panels.
 */

import {
  measurementService,
  historyService,
  alarmService,
  systemHealthService,
  backupService,
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

export function mapDbAlarmToPanel(a) {
  if (!a) return null;
  const msg = `${(a.alarm_type || "alarm").replace(/_/g, " ")} — measured ${a.measured_value ?? "n/a"}`;
  return {
    id: String(a._id ?? a.alarm_id ?? Math.random()),
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

  return {
    mode,
    utilization,
    remainingLiters,
  };
}

/** Simple demand panel from live flow + coverage when no dedicated supply API exists. */
export function mapMeasurementToDemandPanel(m) {
  if (!m) return null;
  const flow = Number(m.flow_rate_m3h ?? 0);
  const cov = Number(m.demand_coverage_percent ?? 0);
  const supply = flow * (cov / 100);
  return {
    currentDemand: flow.toFixed(1),
    currentSupply: supply.toFixed(1),
    status:
      cov >= 95
        ? "Supply aligned with demand"
        : "Demand coverage below comfort band",
    forecast: "Derived from live measurement snapshot",
  };
}

export function trendPointsFromMeasurement(m) {
  if (!m) return [];
  const ts = new Date(m.timestamp).getTime();
  const purity = Number(m.oxygen_purity_percent ?? 0);
  const flowRate = Number(m.flow_rate_m3h ?? 0);
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
  try {
    [purity, flow, pressure, storage] = await Promise.all([
      historyService.getOxygenPurityTrend(),
      historyService.getFlowRateTrend(),
      historyService.getPressureTrend(),
      historyService.getStorageLevelMonthly(),
    ]);
  } catch {
    /* history optional */
  }

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

  const supplyDemand = mapMeasurementToDemandPanel(current);

  let storageLevels = mapStorageMonthlyPayload(storage);
  if (storageLevels.length === 0 && current) {
    const sl = Number(current.storage_level_percent ?? 0);
    storageLevels = [{ label: "Live", lastMonth: sl, thisMonth: sl }];
  }

  let alarms = [];
  try {
    const raw = await alarmService.getActiveAlarms();
    alarms = (Array.isArray(raw) ? raw : [])
      .map(mapDbAlarmToPanel)
      .filter(Boolean);
  } catch {
    /* optional */
  }

  let backup = null;
  const preferredScenario = backupPanelDefaults?.defaultScenario;
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
    status,
    storageLevels,
    alarms,
    backup,
    supplyDemand,
  };
}
