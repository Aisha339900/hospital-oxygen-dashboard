// Demand vs Supply scenario templates (offline mock).
const demandPanelDefaults = {
  /** Single plant-wide snapshot when API is offline (does not vary with stream selection). */
  systemDemandSupply: {
    currentDemand: 83.7,
    currentSupply: 56.7,
    status: "Demand coverage below comfort band",
  },
  /** Used for offline trend KPI “demand coverage” when not stream-specific. */
  offlineDemandCoveragePercent: 67.74,
  /**
   * Plant-wide trend mock (jittered). Same series for every stream until real API data exists.
   * Adjust baselines/variances here — not tied to stream selection.
   */
  offlineTrendMock: {
    purityBaseline: 94,
    purityVariance: 1.2,
    flowBaseline: 72,
    flowVariance: 8,
    pressureBarBaseline: 3.45,
    pressureBarVariance: 0.2,
    demandCoverageVariance: 6,
    specificEnergyBaseline: 0.68,
    specificEnergyVariance: 0.05,
    storage: {
      baseline: 48,
      variance: 5,
    },
  },
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
};

export default demandPanelDefaults;
