const emailService = require("./emailService");
const { resolveStreamDisplayName } = require("./aspenStreamsService");
const {
  hasStreamFocusDigestBeenSent,
  recordStreamFocusDigestSent,
} = require("./alarmEmailSessionDedupe");

function parseRecipients(raw) {
  return String(raw || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeExtraEmails(extra) {
  if (!extra) {
    return [];
  }
  const list = Array.isArray(extra) ? extra : [extra];
  return list
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Env list (ALARM_EMAIL_TO) plus optional per-request addresses (e.g. logged-in user email).
 * Deduped, order: env first, then extras.
 */
function getAlarmEmailRecipients(extraEmails = []) {
  const fromEnv = parseRecipients(process.env.ALARM_EMAIL_TO);
  const extra = normalizeExtraEmails(extraEmails);
  const seen = new Set();
  const out = [];
  for (const e of [...fromEnv, ...extra]) {
    if (!seen.has(e)) {
      seen.add(e);
      out.push(e);
    }
  }
  return out;
}

function isAlarmEmailEnabled(extraEmails = []) {
  return getAlarmEmailRecipients(extraEmails).length > 0;
}

function shouldSendAlarmNotification(alarmLike) {
  if (!alarmLike) {
    return false;
  }
  const status = String(alarmLike.status || "").toLowerCase();
  if (status !== "active") {
    return false;
  }
  const severity = String(alarmLike.severity || "").toLowerCase();
  return severity === "critical" || severity === "high" || severity === "medium";
}

async function sendAlarmActivatedNotifications(
  alarmLike,
  options = {},
) {
  const extra = options.recipientEmails;
  const recipients = getAlarmEmailRecipients(extra);
  if (!recipients.length) {
    return {
      channel: "email",
      enabled: false,
      delivered: false,
      reason:
        "No alarm email recipients. Set ALARM_EMAIL_TO and/or sync while logged in so your account email is used.",
    };
  }

  const smtpStatus = await emailService.getSmtpStatus();
  if (!smtpStatus.available) {
    return {
      channel: "email",
      enabled: true,
      delivered: false,
      reason: smtpStatus.message,
    };
  }

  let streamDisplayName;
  if (alarmLike?.stream_id) {
    streamDisplayName = await resolveStreamDisplayName(alarmLike.stream_id);
  } else {
    streamDisplayName = "plant-wide";
  }

  await emailService.sendAlarmNotificationEmail({
    to: recipients,
    alarm: { ...alarmLike, streamDisplayName },
  });

  return {
    channel: "email",
    enabled: true,
    delivered: true,
    recipients,
  };
}

/**
 * Digest when the user switched streams and active qualifying alerts exist for that view.
 * At most one digest per browser session per stream (client sends alarmEmailSessionId).
 */
async function sendStreamFocusAlarmDigest({
  streamId,
  alarms,
  recipientEmails = [],
  alarmEmailSessionId = "",
}) {
  const recipients = getAlarmEmailRecipients(recipientEmails);
  if (!recipients.length) {
    return {
      channel: "email",
      enabled: false,
      delivered: false,
      reason:
        "No alarm email recipients. Set ALARM_EMAIL_TO and/or sync while logged in so your account email is used.",
    };
  }
  if (!alarms?.length) {
    return {
      channel: "email",
      enabled: true,
      delivered: false,
      reason: "No active alerts to include.",
    };
  }

  if (hasStreamFocusDigestBeenSent(alarmEmailSessionId, streamId)) {
    return {
      channel: "email",
      enabled: true,
      delivered: false,
      reason: "Stream-focus digest already sent for this stream in the current session.",
    };
  }

  const smtpStatus = await emailService.getSmtpStatus();
  if (!smtpStatus.available) {
    return {
      channel: "email",
      enabled: true,
      delivered: false,
      reason: smtpStatus.message,
    };
  }

  const streamName = await resolveStreamDisplayName(streamId);
  const streamIdsForRows = new Set(
    [streamId, ...alarms.map((a) => a?.stream_id).filter(Boolean)].map(String),
  );
  const nameById = new Map();
  for (const id of streamIdsForRows) {
    nameById.set(id, await resolveStreamDisplayName(id));
  }
  const enrichedAlarms = alarms.map((a) => ({
    ...a,
    streamDisplayName: a?.stream_id
      ? nameById.get(String(a.stream_id)) || "plant-wide"
      : "plant-wide",
  }));

  await emailService.sendStreamFocusAlarmDigestEmail({
    to: recipients,
    streamId,
    streamName,
    alarms: enrichedAlarms,
  });

  recordStreamFocusDigestSent(alarmEmailSessionId, streamId);

  return {
    channel: "email",
    enabled: true,
    delivered: true,
    recipients,
    digestCount: alarms.length,
  };
}

module.exports = {
  parseRecipients,
  normalizeExtraEmails,
  getAlarmEmailRecipients,
  isAlarmEmailEnabled,
  shouldSendAlarmNotification,
  sendAlarmActivatedNotifications,
  sendStreamFocusAlarmDigest,
};
