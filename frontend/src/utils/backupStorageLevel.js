const STORAGE_LEVEL_THRESHOLDS = {
  healthyMin: 25,
  warningMin: 15,
};

const STORAGE_LEVEL_MESSAGES = {
  healthy: "Backup capacity sufficient",
  warning: "Backup running low",
  critical: "Backup critically low",
};

function toFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getStorageLevelStatus(storageLevel) {
  const level = toFiniteNumber(storageLevel);
  if (level === null) {
    return {
      level: null,
      status: "critical",
      message: STORAGE_LEVEL_MESSAGES.critical,
    };
  }

  if (level >= STORAGE_LEVEL_THRESHOLDS.healthyMin) {
    return {
      level,
      status: "healthy",
      message: STORAGE_LEVEL_MESSAGES.healthy,
    };
  }

  if (level >= STORAGE_LEVEL_THRESHOLDS.warningMin) {
    return {
      level,
      status: "warning",
      message: STORAGE_LEVEL_MESSAGES.warning,
    };
  }

  return {
    level,
    status: "critical",
    message: STORAGE_LEVEL_MESSAGES.critical,
  };
}

function formatStorageLevelPercent(storageLevel) {
  const level = toFiniteNumber(storageLevel);
  const safe = level === null ? 0 : level;
  return `${safe.toFixed(2)}%`;
}

function clampStorageLevelPercent(storageLevel) {
  const level = toFiniteNumber(storageLevel);
  if (level === null) {
    return 0;
  }
  return Math.min(Math.max(level, 0), 100);
}

export {
  STORAGE_LEVEL_THRESHOLDS,
  STORAGE_LEVEL_MESSAGES,
  getStorageLevelStatus,
  formatStorageLevelPercent,
  clampStorageLevelPercent,
};
