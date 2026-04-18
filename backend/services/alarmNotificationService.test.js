const { describe, test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const emailService = require("./emailService");
const {
  parseRecipients,
  shouldSendAlarmNotification,
  sendAlarmActivatedNotifications,
} = require("./alarmNotificationService");

describe("alarmNotificationService", () => {
  const originalEnv = {
    ALARM_EMAIL_TO: process.env.ALARM_EMAIL_TO,
  };

  beforeEach(() => {
    process.env.ALARM_EMAIL_TO = "";
    emailService.getSmtpStatus = async () => ({
      available: true,
      message: "ok",
    });
    emailService.sendAlarmNotificationEmail = async () => {};
  });

  afterEach(() => {
    process.env.ALARM_EMAIL_TO = originalEnv.ALARM_EMAIL_TO;
  });

  test("parseRecipients normalizes comma-separated emails", () => {
    assert.deepEqual(parseRecipients(" A@EXAMPLE.COM, b@example.com ,, "), [
      "a@example.com",
      "b@example.com",
    ]);
  });

  test("shouldSendAlarmNotification ignores non-active alarms", () => {
    assert.equal(
      shouldSendAlarmNotification({ status: "resolved", severity: "critical" }),
      false,
    );
  });

  test("sendAlarmActivatedNotifications skips when recipients are missing", async () => {
    const result = await sendAlarmActivatedNotifications({
      status: "active",
      severity: "critical",
    });

    assert.equal(result.delivered, false);
    assert.match(result.reason, /ALARM_EMAIL_TO|account email/);
  });

  test("sendAlarmActivatedNotifications sends email when configured", async () => {
    process.env.ALARM_EMAIL_TO = "ops@example.com,team@example.com";

    let payload = null;
    emailService.sendAlarmNotificationEmail = async (input) => {
      payload = input;
    };

    const result = await sendAlarmActivatedNotifications({
      status: "active",
      severity: "critical",
      alarm_type: "low_oxygen_purity",
      message: "Purity is low.",
    });

    assert.equal(result.delivered, true);
    assert.deepEqual(payload.to, ["ops@example.com", "team@example.com"]);
    assert.equal(payload.alarm.alarm_type, "low_oxygen_purity");
  });

  test("sendAlarmActivatedNotifications uses recipientEmails when ALARM_EMAIL_TO is empty", async () => {
    process.env.ALARM_EMAIL_TO = "";

    let payload = null;
    emailService.sendAlarmNotificationEmail = async (input) => {
      payload = input;
    };

    const result = await sendAlarmActivatedNotifications(
      { status: "active", severity: "critical", alarm_type: "test" },
      { recipientEmails: ["viewer@example.com"] },
    );

    assert.equal(result.delivered, true);
    assert.deepEqual(payload.to, ["viewer@example.com"]);
  });
});
