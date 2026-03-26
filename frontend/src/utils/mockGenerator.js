import backupPanelDefaults from "../config/backupPanelDefaults.js";
import demandPanelDefaults from "../config/demandPanelDefaults.js";
import { generateAlarmPanelData } from "./alarmLogic.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const withJitter = (base, variance = 0) =>
  base + (Math.random() - 0.5) * variance * 2;

const PSI_TO_BAR = 0.0689476;

const generateTrendSeries = (profile) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const purityBaseline =
    profile?.purityBaseline ?? (profile?.composition?.o2 || 0) * 100;
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (13 - index));
    const pressurePsi = clamp(
      withJitter(
        profile?.pressureBaseline ?? 45,
        profile?.pressureVariance ?? 5,
      ),
      0,
      120,
    );
    return {
      timestamp: day.getTime(),
      purity: clamp(
        withJitter(purityBaseline, profile?.purityVariance ?? 1),
        0,
        100,
      ),
      flowRate: clamp(
        withJitter(profile?.flowBaseline ?? 55, profile?.flowVariance ?? 6),
        0,
        120,
      ),
      pressure: pressurePsi,
      pressureBar: pressurePsi * PSI_TO_BAR,
      demandCoverage: clamp(
        withJitter(
          profile?.demandCoverageBaseline ?? 80,
          profile?.demandVariance ?? 6,
        ),
        0,
        140,
      ),
      specificEnergy: clamp(
        withJitter(
          profile?.specificEnergyBaseline ?? 0.68,
          profile?.specificEnergyVariance ?? 0.05,
        ),
        0.4,
        1.2,
      ),
    };
  });
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

  return {
    status: latest.purity > 96 && latest.pressure > 48 ? "optimal" : "warning",
    purity: latest.purity.toFixed(2),
    flowRate: latest.flowRate.toFixed(2),
    pressure: latest.pressure.toFixed(2),
    demandCoverage: latest.demandCoverage.toFixed(2),
    specificEnergy: (latest.specificEnergy ?? 0).toFixed(2),
    timestamp: latest.timestamp,
  };
};

const generateStorageComparison = (profile) => {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return labels.map((label) => ({
    label,
    lastMonth: clamp(
      withJitter(
        (profile?.storageBaseline ?? 45) + Math.random() * 5,
        profile?.storageVariance ?? 5,
      ),
      0,
      100,
    ),
    thisMonth: clamp(
      withJitter(
        (profile?.storageBaseline ?? 45) + 6 + Math.random() * 6,
        profile?.storageVariance ?? 5,
      ),
      0,
      100,
    ),
  }));
};

const resolveBackupModeKey = (profile) => {
  if (profile?.demandCoverageBaseline > 85) {
    return "active";
  }
  if (profile?.demandCoverageBaseline < 55) {
    return "standby";
  }
  return Math.random() > 0.5 ? "active" : "standby";
};

const generateBackupPanelData = (profile) => {
  const baseline = profile?.backupBaseline ?? 60;
  const variance = profile?.backupVariance ?? 8;
  const level = clamp(withJitter(baseline, variance), 10, 100);
  const modeKey = resolveBackupModeKey(profile);
  const modeConfig = backupPanelDefaults?.modes?.[modeKey] ||
    backupPanelDefaults?.modes?.active || {
      label: "Active supply",
      description: "Backup system supporting main line.",
    };
  return {
    mode: modeConfig.label,
    modeDescription: modeConfig.description,
    level,
    remainingHours: clamp(withJitter(24 + baseline / 2, 6), 6, 72),
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

const generateDemandPanelSnapshot = (streamId) => {
  const dataset = demandPanelDefaults || {};
  const profiles = dataset.streamProfiles || {};
  const scenarios = dataset.scenarios || {};
  const profile = profiles[streamId];
  if (!profile) {
    return null;
  }
  const scenario = scenarios[profile.scenario] || scenarios.optimal || {};
  return {
    currentDemand: formatDemandValue(profile.currentDemand),
    currentSupply: formatDemandValue(profile.currentSupply),
    status: profile.status || scenario.status || "Supply status unavailable",
    forecast:
      profile.forecast || scenario.forecast || "Awaiting forecast update",
  };
};

export {
  generateTrendSeries,
  generateStreamStatus,
  generateStorageComparison,
  generateBackupPanelData,
  generateAlarmPanelData,
  generateDemandPanelSnapshot,
};
