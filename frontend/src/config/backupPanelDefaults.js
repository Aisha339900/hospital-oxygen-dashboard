// Backup system mode definitions and thresholds (offline mock).
const backupPanelDefaults = {
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
  },
  thresholds: {
    lowLevel: 20,
    criticalLevel: 10,
  },
};

export default backupPanelDefaults;
