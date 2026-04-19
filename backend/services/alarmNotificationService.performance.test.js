const { describe, test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { performance } = require("node:perf_hooks");

const emailService = require("./emailService");
const { sendAlarmActivatedNotifications } = require("./alarmNotificationService");

describe("alarmNotificationService performance", () => {
  const originalEnv = {
    ALARM_EMAIL_TO: process.env.ALARM_EMAIL_TO,
  };

  beforeEach(() => {
    process.env.ALARM_EMAIL_TO = "ops@example.com";
    emailService.getSmtpStatus = async () => ({
      available: true,
      message: "ok",
    });
    emailService.sendAlarmNotificationEmail = async () => {};
  });

  afterEach(() => {
    process.env.ALARM_EMAIL_TO = originalEnv.ALARM_EMAIL_TO;
  });

  test("sendAlarmActivatedNotifications completes in under 2 seconds", async () => {
    const startedAt = performance.now();

    const result = await sendAlarmActivatedNotifications({
      status: "active",
      severity: "critical",
      alarm_type: "low_oxygen_purity",
      message: "Purity is low.",
    });

    const elapsedMs = performance.now() - startedAt;

    assert.equal(result.delivered, true);
    assert.ok(
      elapsedMs < 2000,
      `Expected alarm response under 2000ms, got ${elapsedMs.toFixed(1)}ms`,
    );
  });
});