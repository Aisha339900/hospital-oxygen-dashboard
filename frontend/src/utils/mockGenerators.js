import backupPanelDefaults from "../config/backupPanelDefaults.js";
import demandPanelDefaults from "../config/demandPanelDefaults.js";
import { generateAlarmPanelData } from "./alarmLogic.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const withJitter = (base, variance = 0) =>
  base + (Math.random() - 0.5) * variance * 2;

/**
 * 14-day trend — varied (jitter per day), plant-wide baselines (not stream-specific).
 * Call once per session and cache in App so stream changes do not reshuffle charts.
 */
const generateGlobalTrendSeries = () => {
  const cfg = demandPanelDefaults.offlineTrendMock || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const covBase = demandPanelDefaults.offlineDemandCoveragePercent ?? 67.74;

  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (13 - index));
    const purity = clamp(
      withJitter(cfg.purityBaseline ?? 94, cfg.purityVariance ?? 1.2),
      0,
      100,
    );
    const flowRate = clamp(
      withJitter(cfg.flowBaseline ?? 72, cfg.flowVariance ?? 8),
      0,
      200,
    );
    const pressureBar = clamp(
      withJitter(
        cfg.pressureBarBaseline ?? 3.45,
        cfg.pressureBarVariance ?? 0.2,
      ),
      0,
      15,
    );
    const demandCoverage = clamp(
      withJitter(covBase, cfg.demandCoverageVariance ?? 6),
      0,
      140,
    );
    const specificEnergy = clamp(
      withJitter(
        cfg.specificEnergyBaseline ?? 0.68,
        cfg.specificEnergyVariance ?? 0.05,
      ),
      0.4,
      1.2,
    );
    return {
      timestamp: day.getTime(),
      purity,
      flowRate,
      pressure: pressureBar,
      pressureBar,
      demandCoverage,
      specificEnergy,
    };
  });
};

/**
 * Monthly storage comparison — jittered, plant-wide (not stream-specific).
 * Cache with global trend series in App.
 */
const generateGlobalStorageComparison = () => {
  const cfg = demandPanelDefaults.offlineTrendMock?.storage || {};
  const base = cfg.baseline ?? 48;
  const variance = cfg.variance ?? 5;
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return labels.map((label) => ({
    label,
    lastMonth: clamp(withJitter(base - 2, variance), 0, 100),
    thisMonth: clamp(withJitter(base + 4, variance), 0, 100),
  }));
};

const generateStreamStatus = (dataPoints) => {
  const latest = dataPoints[dataPoints.length - 1];
  if (!latest) {
    const now = Date.now();
    return {
      status: "warning",
      purity: "0.00",
      flowRate: "0.00",
      pressure: "0.00",
      demandCoverage: "0.00",
      timestamp: now,
    };
  }

  const pb = latest.pressureBar ?? latest.pressure ?? 0;
  return {
    status:
      latest.purity > 93 && pb >= 0.4 && pb <= 8.5 ? "optimal" : "warning",
    purity: latest.purity.toFixed(2),
    flowRate: latest.flowRate.toFixed(2),
    pressure: latest.pressure.toFixed(2),
    demandCoverage: latest.demandCoverage.toFixed(2),
    specificEnergy: (latest.specificEnergy ?? 0).toFixed(2),
    timestamp: latest.timestamp,
  };
};

const resolveBackupModeKey = (profile) => {
  const cov =
    demandPanelDefaults.offlineDemandCoveragePercent ??
    profile?.demandCoverageBaseline ??
    80;
  if (cov > 85) {
    return "active";
  }
  if (cov < 55) {
    return "standby";
  }
  return "active";
};

const generateBackupPanelData = (profile) => {
  const baseline = profile?.backupBaseline ?? 60;
  const modeKey = resolveBackupModeKey(profile);
  const modeConfig = backupPanelDefaults?.modes?.[modeKey] ||
    backupPanelDefaults?.modes?.active || {
      label: "Active supply",
      description: "Backup system supporting main line.",
    };
  const remainingHours = clamp(24 + baseline / 2, 6, 72);
  return {
    mode: modeConfig.label,
    modeDescription: modeConfig.description,
    level: clamp(baseline, 10, 100),
    remainingHours,
    lastChecked: Date.now() - 3600000,
    thresholds: backupPanelDefaults?.thresholds || null,
  };
};

const formatDemandValue = (value, fallback = "0.0") => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(1);
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : fallback;
};

const getStaticSystemDemandSupply = () => {
  const d = demandPanelDefaults.systemDemandSupply;
  if (!d) {
    return null;
  }
  return {
    currentDemand: formatDemandValue(d.currentDemand),
    currentSupply: formatDemandValue(d.currentSupply),
    status: d.status || "Supply status unavailable",
    //forecast: d.forecast || "Awaiting forecast update",
  };
};

export {
  generateGlobalTrendSeries,
  generateGlobalStorageComparison,
  generateStreamStatus,
  generateBackupPanelData,
  generateAlarmPanelData,
  getStaticSystemDemandSupply,
};
