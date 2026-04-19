// Backup system mode definitions and thresholds (offline mock).
const backupPanelDefaults = {
  defaultScenario: "normal",
  fallbackModeKey: "standby",
  fallbacks: {
    utilizationPercent: 60,
    remainingLiters: 30000, //**not sure */
  },
  modes: {
    active: {
      id: "active",
      label: "Active supply",
      description: "Backup system is supplementing the main line.",
    },
    standby: {
      id: "standby",
      label: "Standby",
      description: "Backup ready to engage if pressure drops.",
    },
    critical: {
      id: "critical",
      label: "Critical",
      description: "Backup reserve is critically low and requires urgent action.",
    },
  },
  thresholds: {
    lowLevel: 20,
    criticalLevel: 10,
  },
};

export default backupPanelDefaults;
