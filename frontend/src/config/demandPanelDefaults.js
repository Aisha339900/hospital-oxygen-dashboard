// Demand vs Supply scenario templates (offline mock).
const demandPanelDefaults = {
  scenarios: {
    optimal: {
      id: "optimal",
      label: "Supply meets demand",
      status: "Supply meets demand",
      forecast: "No supply risk detected",
    },
    monitoring: {
      id: "monitoring",
      label: "Monitor supply closely",
      status: "Supply below demand",
      forecast: "Monitor supply closely",
    },
    critical: {
      id: "critical",
      label: "Immediate action required",
      status: "Supply deficit detected",
      forecast: "Activate contingency plan and notify maintenance",
    },
  },
  streamProfiles: {
    feed: {
      scenario: "optimal",
      currentDemand: 58.4,
      currentSupply: 64.1,
    },
    membraneFeed: {
      scenario: "optimal",
      currentDemand: 60.7,
      currentSupply: 67.3,
    },
    membranePermeate: {
      scenario: "monitoring",
      currentDemand: 55.6,
      currentSupply: 52.8,
    },
    membraneRetentate: {
      scenario: "monitoring",
      currentDemand: 63.2,
      currentSupply: 58.1,
    },
    psaProduct: {
      scenario: "optimal",
      currentDemand: 47.9,
      currentSupply: 71.6,
    },
    psaOffGas: {
      scenario: "critical",
      currentDemand: 72.4,
      currentSupply: 54.3,
    },
  },
};

export default demandPanelDefaults;
