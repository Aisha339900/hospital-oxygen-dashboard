import {
    generateAlarmPanelData,
    buildDashboardDerived,
    qualifyRuleKeyForStream,
  } from "./alarmLogic";
  
  const nominalSupply = (coverage = 100) => ({
    supply: {
      coverage_percent: coverage,
      coveragePercent: coverage,
    },
  });
  
  const nominalBackup = (remainingLiters = 12000, utilization = 35) => ({
    remaining_liters: remainingLiters,
    remainingLiters,
    utilization,
  });
  
  describe("alarmLogic — generateAlarmPanelData", () => {
    test("purity < 93% yields low oxygen purity warning", () => {
      const alarms = generateAlarmPanelData({
        latestPoint: {
          purity: 92.0,
          flowRate: 100,
          pressureBar: 5.5,
          specificEnergy: 0.7,
        },
        supplyDemand: nominalSupply(100),
        backupData: nominalBackup(),
      });
      const a = alarms.find((x) => x.ruleKey === "purity-warning");
      expect(a).toBeDefined();
      expect(a.severity).toBe("warning");
      expect(a.message).toMatch(/purity low/i);
    });
  
    test("pressure > 6 bar yields high pressure warning", () => {
      const alarms = generateAlarmPanelData({
        latestPoint: {
          purity: 95,
          flowRate: 100,
          pressureBar: 6.4,
          specificEnergy: 0.7,
        },
        supplyDemand: nominalSupply(100),
        backupData: nominalBackup(),
      });
      const a = alarms.find((x) => x.ruleKey === "pressure-warning");
      expect(a).toBeDefined();
      expect(a.message).toMatch(/pressure high/i);
    });
  
    test("demand coverage < 95% yields coverage warning", () => {
      const alarms = generateAlarmPanelData({
        latestPoint: {
          purity: 95,
          flowRate: 100,
          pressureBar: 5.5,
          specificEnergy: 0.7,
        },
        supplyDemand: nominalSupply(80),
        backupData: nominalBackup(),
      });
      const a = alarms.find((x) => x.ruleKey === "coverage-warning");
      expect(a).toBeDefined();
      expect(a.message).toMatch(/under stress/i);
    });
  
    test("backup remaining liters in warning band triggers backup-volume-warning", () => {
      const alarms = generateAlarmPanelData({
        latestPoint: {
          purity: 95,
          flowRate: 100,
          pressureBar: 5.5,
          specificEnergy: 0.7,
        },
        supplyDemand: nominalSupply(100),
        backupData: nominalBackup(3000, 30),
      });
      const a = alarms.find((x) => x.ruleKey === "backup-volume-warning");
      expect(a).toBeDefined();
      expect(a.message).toMatch(/running low/i);
    });
  });
  
  describe("alarmLogic — stream-scoped rule keys", () => {
    test("qualifyRuleKeyForStream adds suffix for stream-scoped rules", () => {
      expect(qualifyRuleKeyForStream("purity-warning", "s1")).toBe(
        "purity-warning::s1",
      );
      expect(qualifyRuleKeyForStream("coverage-warning", "s1")).toBe(
        "coverage-warning",
      );
    });
  });
  
  describe("alarmLogic — buildDashboardDerived", () => {
    const streamProfiles = [{ id: "A", process: null }];
    const baseSeries = [
      {
        timestamp: 1,
        purity: 90,
        flowRate: 90,
        pressureBar: 5,
        pressure: 5 / 0.0689476,
        specificEnergy: 0.7,
      },
    ];
  
    test("test mode overrides feed into alarm evaluation point", () => {
      const derived = buildDashboardDerived({
        streamProfiles,
        activeStream: "A",
        data: baseSeries,
        supplyDemand: nominalSupply(100),
        backup: nominalBackup(),
        status: {},
        dashboardTestModeEnabled: true,
        dashboardTestInputs: { purity: "92", demandCoverage: "100" },
      });
      expect(derived).not.toBeNull();
      expect(derived.alarmEvaluationPoint.purity).toBe(92);
    });
  });
  