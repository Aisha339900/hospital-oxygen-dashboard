const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  evaluateDashboardRules,
  buildLatestPointFromMeasurement,
  qualifyRuleKeyForStream,
} = require("./alarmRuleEngine");

describe("evaluateDashboardRules", () => {
  const basePoint = {
    timestamp: Date.now(),
    purity: 95,
    flowRate: 100,
    pressureBar: 5.5,
    pressure: 5.5 / 0.0689476,
    specificEnergy: 0.68,
    demandCoverage: 98,
  };

  test("purity < 93% produces low_oxygen_purity warning row", () => {
    const rows = evaluateDashboardRules({
      latestPoint: { ...basePoint, purity: 92.0 },
      supplyDemand: { supply: { coverage_percent: 100 } },
      backupData: { remaining_liters: 10000, utilization: 40 },
    });
    const r = rows.find((x) => x.ruleKey === "purity-warning");
    assert.ok(r);
    assert.equal(r.alarmType, "low_oxygen_purity");
    assert.equal(r.severity, "medium");
  });

  test("pressureBar > 6 produces high_pressure warning row", () => {
    const rows = evaluateDashboardRules({
      latestPoint: { ...basePoint, pressureBar: 6.5 },
      supplyDemand: { supply: { coverage_percent: 100 } },
      backupData: { remaining_liters: 10000, utilization: 40 },
    });
    const r = rows.find((x) => x.ruleKey === "pressure-warning");
    assert.ok(r);
    assert.equal(r.alarmType, "high_pressure");
  });

  test("coverage < 95% produces low_demand_coverage warning row", () => {
    const rows = evaluateDashboardRules({
      latestPoint: basePoint,
      supplyDemand: { supply: { coverage_percent: 80 } },
      backupData: { remaining_liters: 10000, utilization: 40 },
    });
    const r = rows.find((x) => x.ruleKey === "coverage-warning");
    assert.ok(r);
    assert.equal(r.alarmType, "low_demand_coverage");
  });

  test("remaining liters between 500 and 5000 produces backup volume warning", () => {
    const rows = evaluateDashboardRules({
      latestPoint: basePoint,
      supplyDemand: { supply: { coverage_percent: 100 } },
      backupData: { remaining_liters: 3000, utilization: 30 },
    });
    const r = rows.find((x) => x.ruleKey === "backup-volume-warning");
    assert.ok(r);
    assert.equal(r.alarmType, "low_backup_volume");
  });
});

describe("buildLatestPointFromMeasurement", () => {
  test("maps mongoose-like measurement fields", () => {
    const pt = buildLatestPointFromMeasurement({
      timestamp: new Date("2026-01-01T00:00:00Z"),
      oxygen_purity_percent: 94,
      flow_rate_m3h: 90,
      delivery_pressure_bar: 5.2,
      demand_coverage_percent: 97,
      temperature: 0.75,
    });
    assert.equal(pt.purity, 94);
    assert.equal(pt.flowRate, 90);
    assert.ok(Math.abs(pt.pressureBar - 5.2) < 1e-4);
    assert.equal(pt.specificEnergy, 0.75);
  });
});

describe("qualifyRuleKeyForStream", () => {
  test("scopes stream rules only", () => {
    assert.equal(
      qualifyRuleKeyForStream("purity-warning", "x"),
      "purity-warning::x",
    );
    assert.equal(
      qualifyRuleKeyForStream("coverage-warning", "x"),
      "coverage-warning",
    );
  });
});
