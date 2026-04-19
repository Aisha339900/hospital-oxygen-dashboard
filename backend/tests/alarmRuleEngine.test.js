const { evaluateDashboardRules } = require('../services/alarmRuleEngine');

describe('evaluateDashboardRules', () => {
  const nominalInput = {
    latestPoint: {
      timestamp: Date.now(),
      purity: 95,
      flowRate: 100,
      pressureBar: 5.5,
      pressure: 5.5 / 0.0689476,
      specificEnergy: 0.68,
      demandCoverage: 98,
    },
    supplyDemand: {
      supply: {
        coverage_percent: 98,
      },
    },
    backupData: {
      remaining_liters: 10000,
      utilization: 35,
    },
  };

  test('generates a low purity alarm when purity is below 93', () => {
    const rows = evaluateDashboardRules({
      ...nominalInput,
      latestPoint: {
        ...nominalInput.latestPoint,
        purity: 92,
      },
    });

    expect(rows.some((row) => row.alarmType === 'low_oxygen_purity')).toBe(true);
  });

  test('generates a high pressure alarm when pressure is above 6 bar', () => {
    const rows = evaluateDashboardRules({
      ...nominalInput,
      latestPoint: {
        ...nominalInput.latestPoint,
        pressureBar: 6.3,
      },
    });

    expect(rows.some((row) => row.alarmType === 'high_pressure')).toBe(true);
  });

  test('generates a backup storage warning when storage level is below 25%', () => {
    const rows = evaluateDashboardRules({
      ...nominalInput,
      backupData: {
        ...nominalInput.backupData,
        storageLevel: 20.5,
      },
    });

    expect(rows.some((row) => row.ruleKey === 'backup-storage-warning')).toBe(true);
  });
});
