/**
 * Serializable snapshot of the Monitoring dashboard for PDF export.
 * Kept JSON-safe (no React nodes / functions).
 */

export const DEFAULT_DASHBOARD_REPORT_OPTIONS = {
  includeOverview: true,
  includeKpis: true,
  includeStreams: true,
  includeSupplyDemand: true,
  includeTrendSample: true,
  includeAlarms: true,
};

function serializeSupplyDemand(sd) {
  if (!sd || typeof sd !== "object") {
    return null;
  }
  const demand = sd.demand && typeof sd.demand === "object"
    ? {
        scenario: sd.demand.scenario ?? null,
        status: sd.demand.status ?? null,
        generalRequests: sd.demand.generalRequests ?? null,
        icuRequests: sd.demand.icuRequests ?? null,
        totalRequests: sd.demand.totalRequests ?? null,
      }
    : null;
  const supply = sd.supply && typeof sd.supply === "object"
    ? {
        scenario: sd.supply.scenario ?? null,
        status: sd.supply.status ?? null,
        mainUtilizationPercent: sd.supply.mainUtilizationPercent ?? null,
        mainRemainingLiters: sd.supply.mainRemainingLiters ?? null,
        coveragePercent: sd.supply.coveragePercent ?? null,
      }
    : null;
  return {
    status: sd.status ?? null,
    forecast: sd.forecast ?? null,
    demand,
    supply,
  };
}

function serializeStreams(streams) {
  if (!Array.isArray(streams)) {
    return [];
  }

  return streams.map((stream) => ({
    id: stream?.id != null ? String(stream.id) : "",
    label: String(stream?.label ?? stream?.code ?? "Stream"),
    composition: stream?.composition && typeof stream.composition === "object"
      ? {
          o2:
            stream.composition.o2 === null || stream.composition.o2 === undefined
              ? null
              : Number(stream.composition.o2),
          n2:
            stream.composition.n2 === null || stream.composition.n2 === undefined || stream.composition.n2 === "-"
              ? null
              : Number(stream.composition.n2),
          ar:
            stream.composition.ar === null || stream.composition.ar === undefined || stream.composition.ar === "-"
              ? null
              : Number(stream.composition.ar),
        }
      : null,
    process: stream?.process && typeof stream.process === "object"
      ? {
          oxygenPurityPercent:
            stream.process.oxygenPurityPercent === null || stream.process.oxygenPurityPercent === undefined
              ? null
              : Number(stream.process.oxygenPurityPercent),
          flowRateM3h:
            stream.process.flowRateM3h === null || stream.process.flowRateM3h === undefined
              ? null
              : Number(stream.process.flowRateM3h),
          deliveryPressureBar:
            stream.process.deliveryPressureBar === null || stream.process.deliveryPressureBar === undefined
              ? null
              : Number(stream.process.deliveryPressureBar),
          temperature:
            stream.process.temperature === null || stream.process.temperature === undefined
              ? null
              : Number(stream.process.temperature),
          molarFlow:
            stream.process.molarFlow === null || stream.process.molarFlow === undefined
              ? null
              : Number(stream.process.molarFlow),
          massFlow:
            stream.process.massFlow === null || stream.process.massFlow === undefined
              ? null
              : Number(stream.process.massFlow),
        }
      : null,
  }));
}

/**
 * @param {object} params
 * @param {() => string} params.formatTimeAgo
 */
export function buildDashboardReportSnapshot({
  formatTimeAgo,
  currentStreamLabel,
  activeStream,
  streamProfiles,
  lastUpdated,
  status,
  statCards,
  alarms,
  backup,
  supplyDemand,
  coveragePercent,
  supplyIsHealthy,
  unacknowledgedAlarms,
  trendsAreSimulated,
  timelineRange,
  trendFeedRange,
  trendData,
  reportOptions,
  dashboardTestModeEnabled,
}) {
  const safeCards = Array.isArray(statCards)
    ? statCards.map((c) => ({
        id: c.id,
        label: String(c.label ?? ""),
        value: String(c.value ?? ""),
        delta: String(c.delta ?? ""),
        helper: c.helper != null ? String(c.helper) : "",
      }))
    : [];

  const safeAlarms = Array.isArray(alarms)
    ? alarms.map((a) => ({
        message: String(a.message ?? ""),
        severity: String(a.severity ?? ""),
        timeLabel: formatTimeAgo(a.timestamp),
      }))
    : [];

  const sample = Array.isArray(trendData)
    ? trendData.slice(-28).map((r) => ({
        feed_flow_kmol_h:
          r.feed_flow_kmol_h === null || r.feed_flow_kmol_h === undefined
            ? null
            : Number(r.feed_flow_kmol_h),
        product_flow_L_min:
          r.product_flow_L_min === null || r.product_flow_L_min === undefined
            ? null
            : Number(r.product_flow_L_min),
        oxygen_purity_percent:
          r.oxygen_purity_percent === null || r.oxygen_purity_percent === undefined
            ? null
            : Number(r.oxygen_purity_percent),
      }))
    : [];

  const mergedReportOptions = {
    ...DEFAULT_DASHBOARD_REPORT_OPTIONS,
    ...(reportOptions && typeof reportOptions === "object" ? reportOptions : {}),
  };

  return {
    version: 1,
    title: "Hospital oxygen — monitoring dashboard",
    generatedAt: new Date().toISOString(),
    stream: {
      id: activeStream != null ? String(activeStream) : "",
      label: String(currentStreamLabel ?? "-"),
    },
    streams: serializeStreams(streamProfiles),
    lastUpdated: String(lastUpdated ?? ""),
    status: status
      ? {
          purity: String(status.purity ?? ""),
          flowRate: String(status.flowRate ?? ""),
          pressure: String(status.pressure ?? ""),
          demandCoverage: String(status.demandCoverage ?? ""),
          specificEnergy: String(status.specificEnergy ?? ""),
          status: String(status.status ?? ""),
        }
      : null,
    statCards: safeCards,
    alarms: safeAlarms,
    backup: backup
      ? {
          mode: String(backup.mode ?? ""),
          utilization: Number(backup.utilization),
          remainingLiters: Number(backup.remainingLiters),
        }
      : null,
    supplyDemand: serializeSupplyDemand(supplyDemand),
    trendSummary: {
      timelineRange: String(timelineRange ?? ""),
      trendFeedRange: String(trendFeedRange ?? ""),
      rowCount: Array.isArray(trendData) ? trendData.length : 0,
    },
    trendSample: sample,
    meta: {
      unacknowledgedAlarms: Number(unacknowledgedAlarms) || 0,
      trendsAreSimulated: Boolean(trendsAreSimulated),
      supplyIsHealthy: Boolean(supplyIsHealthy),
      coveragePercent:
        coveragePercent === null || coveragePercent === undefined
          ? null
          : Number(coveragePercent),
      dashboardTestMode: Boolean(dashboardTestModeEnabled),
    },
    reportOptions: mergedReportOptions,
  };
}
