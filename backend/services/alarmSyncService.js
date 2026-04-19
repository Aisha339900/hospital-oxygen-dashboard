const SystemMeasurement = require("../models/systemMeasurement");
const DemandStatus = require("../models/demandStatus");
const SupplyStatus = require("../models/supplyStatus");
const BackupStatus = require("../models/backupStatus");
const Alarm = require("../models/alarm");
const { findAspenStreamById } = require("./aspenStreamsService");
const {
  buildLatestPointFromMeasurement,
  evaluateDashboardRules,
  stableAlarmId,
  mergeAspenStreamIntoLatestPoint,
  qualifyRuleKeyForStream,
  isStreamScopedRuleKey,
} = require("./alarmRuleEngine");
const {
  shouldSendAlarmNotification,
  sendAlarmActivatedNotifications,
  sendStreamFocusAlarmDigest,
} = require("./alarmNotificationService");

const DEFAULT_SCENARIO = "normal";

function toFiniteNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Same shape as frontend mapScenarioDemandSupply output (supply slice). */
function buildSupplyDemand(demandStatus, supplyStatus) {
  if (!demandStatus && !supplyStatus) {
    return null;
  }
  const coveragePercent = toFiniteNumber(supplyStatus?.coverage_percent);
  return {
    supply: supplyStatus
      ? {
          coveragePercent,
          coverage_percent: coveragePercent,
        }
      : null,
  };
}

function buildBackupData(backupDoc) {
  if (!backupDoc) {
    return null;
  }
  return {
    utilization: Number(backupDoc.utilization_percent ?? 0),
    remainingLiters: Number(backupDoc.remaining_liters ?? 0),
    remaining_liters: Number(backupDoc.remaining_liters ?? 0),
  };
}

function mapComputedRows(computed, streamId) {
  return computed.map((row) => {
    const qualified = qualifyRuleKeyForStream(row.ruleKey, streamId || null);
    const scoped = isStreamScopedRuleKey(qualified);
    const stream_id = scoped && streamId ? String(streamId) : null;
    return {
      ...row,
      ruleKey: qualified,
      stream_id,
    };
  });
}

async function upsertRuleAlarmsFromComputed(
  rows,
  syncContextStreamId,
  notifyOpts = {},
) {
  const notificationRecipientEmails = Array.isArray(
    notifyOpts.recipientEmails,
  )
    ? notifyOpts.recipientEmails
    : [];
  const streamChanged = Boolean(notifyOpts.streamChanged);
  const alarmEmailSessionId = String(
    notifyOpts.alarmEmailSessionId || "",
  ).trim();
  const activeKeys = rows.map((c) => c.ruleKey);
  const streamId =
    syncContextStreamId !== undefined && syncContextStreamId !== null
      ? String(syncContextStreamId).trim()
      : "";

  async function resolveStaleForSyncContext() {
    if (activeKeys.length === 0) {
      if (streamId) {
        await Alarm.updateMany(
          {
            status: "active",
            stream_id: streamId,
            rule_key: { $exists: true, $ne: null },
          },
          { $set: { status: "resolved" } },
        );
        await Alarm.updateMany(
          {
            status: "active",
            rule_key: { $exists: true, $ne: null },
            $or: [{ stream_id: null }, { stream_id: { $exists: false } }],
          },
          { $set: { status: "resolved" } },
        );
      } else {
        await Alarm.updateMany(
          { status: "active", rule_key: { $exists: true, $ne: null } },
          { $set: { status: "resolved" } },
        );
      }
      return;
    }
    if (streamId) {
      await Alarm.updateMany(
        {
          status: "active",
          stream_id: streamId,
          rule_key: { $exists: true, $ne: null, $nin: activeKeys },
        },
        { $set: { status: "resolved" } },
      );
      await Alarm.updateMany(
        {
          status: "active",
          rule_key: { $exists: true, $ne: null, $nin: activeKeys },
          $or: [{ stream_id: null }, { stream_id: { $exists: false } }],
        },
        { $set: { status: "resolved" } },
      );
    } else {
      await Alarm.updateMany(
        {
          status: "active",
          rule_key: { $exists: true, $ne: null, $nin: activeKeys },
        },
        { $set: { status: "resolved" } },
      );
    }
  }

  await resolveStaleForSyncContext();

  async function findExistingAlarm(row) {
    const q = { rule_key: row.ruleKey };
    if (row.stream_id == null) {
      q.$or = [{ stream_id: null }, { stream_id: { $exists: false } }];
    } else {
      q.stream_id = row.stream_id;
    }
    let doc = await Alarm.findOne(q);
    if (!doc && row.stream_id) {
      doc = await Alarm.findOne({
        rule_key: row.ruleKey,
        stream_id: { $exists: false },
      });
    }
    return doc;
  }

  for (const row of rows) {
    const alarmId = stableAlarmId(row.ruleKey);
    const existing = await findExistingAlarm(row);
    let shouldNotify = false;
    let alarmForNotification = null;

    if (existing) {
      shouldNotify =
        existing.status !== "active" && shouldSendAlarmNotification({
          ...existing.toObject?.(),
          ...row,
          status: "active",
        });
      existing.status = "active";
      existing.stream_id = row.stream_id;
      existing.measured_value = row.measuredValue;
      existing.threshold_value = row.thresholdValue;
      existing.message = row.message;
      existing.severity = row.severity;
      existing.alarm_type = row.alarmType;
      existing.timestamp = new Date();
      await existing.save();
      alarmForNotification = existing;
    } else {
      const doc = new Alarm({
        alarm_id: alarmId,
        alarm_type: row.alarmType,
        threshold_value: row.thresholdValue,
        measured_value: row.measuredValue,
        severity: row.severity,
        status: "active",
        rule_key: row.ruleKey,
        message: row.message,
        stream_id: row.stream_id ?? null,
        timestamp: new Date(),
      });
      await doc.save();
      shouldNotify = shouldSendAlarmNotification(doc);
      alarmForNotification = doc;
    }

    if (shouldNotify && alarmForNotification && !streamChanged) {
      try {
        await sendAlarmActivatedNotifications(alarmForNotification, {
          recipientEmails: notificationRecipientEmails,
        });
      } catch (error) {
        console.error("sendAlarmActivatedNotifications:", error);
      }
    }
  }

  if (streamChanged && streamId) {
    try {
      const activeForView = await Alarm.find({
        status: "active",
        rule_key: { $exists: true, $ne: null },
        $or: [{ stream_id: streamId }, { stream_id: null }],
      }).lean();
      const qualifying = activeForView.filter((a) =>
        shouldSendAlarmNotification(a),
      );
      if (qualifying.length) {
        await sendStreamFocusAlarmDigest({
          streamId,
          alarms: qualifying,
          recipientEmails: notificationRecipientEmails,
          alarmEmailSessionId,
        });
      }
    } catch (error) {
      console.error("sendStreamFocusAlarmDigest:", error);
    }
  }

  return { evaluated: rows.length, synced: rows.length };
}

/**
 * Client-aligned sync: same numeric inputs as the dashboard (required streamId for stream-scoped rows).
 */
async function syncDashboardFromClientPayload(payload) {
  const streamId = String(payload?.streamId || "").trim();
  if (!streamId) {
    throw new Error("streamId is required");
  }
  const latestPoint = payload?.latestPoint;
  if (!latestPoint || typeof latestPoint !== "object") {
    return { evaluated: 0, synced: 0 };
  }

  const supplyDemand =
    payload.supplyDemand !== undefined ? payload.supplyDemand : null;
  const backupData =
    payload.backupData !== undefined ? payload.backupData : null;

  const computed = evaluateDashboardRules({
    latestPoint,
    supplyDemand,
    backupData,
  });
  const rows = mapComputedRows(computed, streamId);
  const recipientEmails = Array.isArray(payload?.recipientEmails)
    ? payload.recipientEmails
    : [];
  const streamChanged = Boolean(payload?.streamChanged);
  const alarmEmailSessionId = String(
    payload?.alarmEmailSessionId || "",
  ).trim();
  return upsertRuleAlarmsFromComputed(rows, streamId, {
    recipientEmails,
    streamChanged,
    alarmEmailSessionId,
  });
}

/**
 * Loads live context, evaluates rules, upserts active alarms, resolves cleared rule alarms.
 * Does not touch alarms without rule_key (manual / legacy).
 *
 * @param {{ streamId?: string }} opts - When set, purity/flow/pressure are taken from the Aspen
 *   stream row (same as dashboard KPIs). Rule keys for stream-scoped rules get `::streamId`.
 */
async function syncDashboardRuleAlarms(opts = {}) {
  const streamId =
    opts.streamId !== undefined && opts.streamId !== null
      ? String(opts.streamId).trim()
      : "";

  const measurement = await SystemMeasurement.findOne()
    .sort({ timestamp: -1 })
    .limit(1)
    .lean();

  const scenario = DEFAULT_SCENARIO;
  const [demandStatus, supplyStatus, backupDoc, streamRow] = await Promise.all([
    DemandStatus.findOne({ scenario }).lean(),
    SupplyStatus.findOne({ scenario }).lean(),
    BackupStatus.findOne({ scenario }).lean(),
    streamId ? findAspenStreamById(streamId) : Promise.resolve(null),
  ]);

  let latestPoint = measurement
    ? buildLatestPointFromMeasurement(measurement)
    : null;

  if (streamRow) {
    latestPoint = mergeAspenStreamIntoLatestPoint(
      latestPoint || {
        timestamp: Date.now(),
        purity: 0,
        flowRate: 0,
        pressureBar: 0,
        pressure: 0,
        demandCoverage: 0,
        specificEnergy: 0.68,
      },
      streamRow,
    );
  }

  if (!latestPoint) {
    return { evaluated: 0, synced: 0 };
  }

  const supplyDemand = buildSupplyDemand(demandStatus, supplyStatus);
  const backupData = buildBackupData(backupDoc);

  const computed = evaluateDashboardRules({
    latestPoint,
    supplyDemand,
    backupData,
  });
  const rows = mapComputedRows(computed, streamId);
  return upsertRuleAlarmsFromComputed(rows, streamId, {
    recipientEmails: [],
    streamChanged: false,
  });
}

module.exports = {
  syncDashboardRuleAlarms,
  syncDashboardFromClientPayload,
};
