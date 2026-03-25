import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiBell,
  FiSettings,
  FiFileText,
  FiDroplet,
  FiLayers,
  FiTarget,
} from "react-icons/fi";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import AlarmsPage from "./pages/AlarmsPage";
import MeasurementsPage from "./pages/MeasurementsPage";
import SystemHealthPage from "./pages/SystemHealthPage";
import BackupPage from "./pages/BackupPage";
import NotFoundPage from "./pages/NotFoundPage";
import DetailModal from "./components/DetailModal";
import ChatWidget from "./components/ChatWidget";
import KPI_DEFINITIONS from "./Data/KPIs_data.js";
import TREND_CHARTS from "./Data/trend_charts_data.js";
import STREAM_PRESETS from "./Data/StreamPresets_data.js";
import STREAM_COMPOSITIONS from "./Data/Compositions_data.js";
import STREAM_CONTROLS from "./Data/stream_controls_data.js";
import {
  generateTrendSeries,
  generateStreamStatus,
  generateStorageComparison,
  generateBackupPanelData,
  generateDemandPanelSnapshot,
} from "./Data/generators.js";
import { generateAlarmPanelData } from "./Data/alarm_logic.js";
import { AuthProvider } from "./context/AuthContext";
import { MeasurementProvider } from "./context/MeasurementContext";
import { AlarmProvider } from "./context/AlarmContext";
import { SystemHealthProvider } from "./context/SystemHealthContext";
import { useAuthContext } from "./context/AuthContext";
import "./App.css";

const mapByStreamCode = (collection) => {
  if (!Array.isArray(collection)) {
    return {};
  }
  return collection.reduce((acc, entry) => {
    const code = entry?.stream !== undefined ? String(entry.stream) : null;
    if (code) {
      acc[code] = entry;
    }
    return acc;
  }, {});
};

const STREAM_COMPOSITION_MAP = mapByStreamCode(STREAM_COMPOSITIONS);
const STREAM_CONTROL_MAP = mapByStreamCode(STREAM_CONTROLS);

const normalizeComposition = (entry) => ({
  o2: entry?.o2 ?? 0,
  n2: entry?.n2 ?? 0,
  ar: entry?.ar ?? 0,
  label: entry?.label,
});

const normalizeProcess = (entry) => {
  if (!entry) {
    return null;
  }
  return {
    temperature: entry.temperatureC,
    pressure: entry.pressureKPa,
    molarFlow: entry.molarFlowKmolPerHr,
    massFlow: entry.massFlowKgPerHr,
    description: entry.description,
  };
};

const STREAM_PROFILES = Object.fromEntries(
  Object.entries(STREAM_PRESETS).map(([key, preset]) => {
    const compositionEntry = STREAM_COMPOSITION_MAP[preset.code];
    const processEntry = STREAM_CONTROL_MAP[preset.code];
    const normalizedComposition = normalizeComposition(compositionEntry || {});
    return [
      key,
      {
        ...preset,
        label: normalizedComposition.label || preset.label || preset.id,
        composition: {
          o2: normalizedComposition.o2,
          n2: normalizedComposition.n2,
          ar: normalizedComposition.ar,
        },
        process: normalizeProcess(processEntry),
      },
    ];
  }),
);

const STREAM_OPTIONS = Object.values(STREAM_PROFILES);

const KPI_ICON_MAP = {
  droplet: FiDroplet,
  layers: FiLayers,
  target: FiTarget,
  trendingUp: FiTrendingUp,
};

// Generator helpers now live in /Data to keep App lean.

const DEFAULT_SETTINGS = {
  emailAlerts: true,
};

const DEFAULT_LOG_ASSET_PATH = `${process.env.PUBLIC_URL || ""}/data-results.pdf`;
const DEFAULT_LOG_METADATA = {
  name: "Data Results.pdf",
  size: 128959,
  type: "application/pdf",
  lastModified: 1771072671000,
};

const isBlobUrl = (url) => typeof url === "string" && url.startsWith("blob:");

function AppContent() {
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [backup, setBackup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageLevels, setStorageLevels] = useState([]);
  const [supplyDemand, setSupplyDemand] = useState(null);
  const [activeStream, setActiveStream] = useState(STREAM_OPTIONS[0]?.id || "");
  const [detailView, setDetailView] = useState(null);
  const [activeView, setActiveView] = useState("Default");
  const [alarmPanelPulse, setAlarmPanelPulse] = useState(false);
  const [backupPanelPulse, setBackupPanelPulse] = useState(false);
  const [demandPanelPulse, setDemandPanelPulse] = useState(false);
  const [logUpload, setLogUpload] = useState(() => ({
    ...DEFAULT_LOG_METADATA,
  }));
  const [logPreviewUrl, setLogPreviewUrl] = useState(DEFAULT_LOG_ASSET_PATH);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const alarmPulseTimeoutRef = useRef(null);
  const backupPulseTimeoutRef = useRef(null);
  const demandPulseTimeoutRef = useRef(null);

  const refreshStreamData = useCallback((streamId) => {
    try {
      const profile = STREAM_PROFILES[streamId] || STREAM_OPTIONS[0];
      if (!profile) {
        throw new Error("No stream profiles configured");
      }
      const trendSeries = generateTrendSeries(profile);
      const latestPoint = trendSeries[trendSeries.length - 1] || null;
      const nextStatus = generateStreamStatus(trendSeries);
      const nextBackup = generateBackupPanelData(profile);
      const nextStorage = generateStorageComparison(profile);
      const nextSupplyDemand = generateDemandPanelSnapshot(streamId);
      const nextAlarms = generateAlarmPanelData({
        latestPoint,
        supplyDemand: nextSupplyDemand,
        backupData: nextBackup,
      });
      setData(trendSeries);
      setStatus(nextStatus);
      setBackup(nextBackup);
      setStorageLevels(nextStorage);
      setSupplyDemand(nextSupplyDemand);
      setAlarms(nextAlarms);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to generate simulated data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeStream) {
      refreshStreamData(activeStream);
    }
  }, [refreshStreamData, activeStream]);

  useEffect(() => {
    return () => {
      [
        alarmPulseTimeoutRef,
        backupPulseTimeoutRef,
        demandPulseTimeoutRef,
      ].forEach((ref) => {
        if (ref.current) {
          clearTimeout(ref.current);
        }
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      if (isBlobUrl(logPreviewUrl)) {
        URL.revokeObjectURL(logPreviewUrl);
      }
    };
  }, [logPreviewUrl]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    if (days >= 1) {
      return `${days}d ago`;
    }
    const hours = Math.floor(diff / 3600000);
    if (hours >= 1) {
      return `${hours}h ago`;
    }
    const minutes = Math.floor(diff / 60000);
    if (minutes >= 1) {
      return `${minutes}m ago`;
    }
    const seconds = Math.floor(diff / 1000);
    if (seconds >= 1) {
      return `${seconds}s ago`;
    }
    return "Just now";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 B";
    }
    const sizes = ["B", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      sizes.length - 1,
    );
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 2)} ${sizes[index]}`;
  };

  const handleLogUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (isBlobUrl(logPreviewUrl)) {
      URL.revokeObjectURL(logPreviewUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setLogUpload({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      lastModified: file.lastModified,
    });
    setLogPreviewUrl(nextUrl);
    event.target.value = "";
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const streamOptions = STREAM_OPTIONS;
  const currentStreamProfile =
    STREAM_PROFILES[activeStream] || streamOptions[0];
  const currentStreamProcess = currentStreamProfile?.process || null;
  const latestPoint = data[data.length - 1];
  const earliestPoint = data[0];
  const unacknowledgedAlarms = alarms.filter((a) => !a.acknowledged).length;
  const lastUpdated = formatTimestamp(status.timestamp);
  const supplyIsHealthy =
    supplyDemand &&
    parseFloat(supplyDemand.currentSupply) >=
      parseFloat(supplyDemand.currentDemand);
  const timelineRange =
    earliestPoint && latestPoint
      ? `${formatTimestamp(earliestPoint.timestamp)} - ${formatTimestamp(latestPoint.timestamp)}`
      : "No daily window";
  const supplyFill = supplyDemand
    ? Math.min(
        (parseFloat(supplyDemand.currentSupply) /
          parseFloat(supplyDemand.currentDemand)) *
          100,
        140,
      )
    : 0;
  const canInlineLogPreview =
    !!logUpload &&
    (logUpload.type === "application/pdf" ||
      logUpload.type.startsWith("text/") ||
      /\.(csv|txt|json)$/i.test(logUpload.name || ""));
  const uploadedLogTimestamp = logUpload?.lastModified
    ? new Date(logUpload.lastModified).toLocaleString()
    : null;

  const trendValue = (key, suffix = "") => {
    if (!latestPoint || !earliestPoint) return `+0${suffix}`;
    const delta = latestPoint[key] - earliestPoint[key];
    const formatted =
      Math.abs(delta) >= 1 ? delta.toFixed(1) : delta.toFixed(2);
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${formatted}${suffix}`;
  };

  const metricValue = (key, suffix = "") => {
    if (!key || !status) {
      return `0${suffix}`;
    }
    const reading = status[key];
    if (reading === undefined || reading === null || reading === "") {
      return `0${suffix}`;
    }
    return `${reading}${suffix}`;
  };

  const previewData = (rows, limit = 6) => {
    if (!rows || rows.length === 0) return [];
    const start = Math.max(rows.length - limit, 0);
    return rows.slice(start);
  };

  const resolveMetaValue = (source) => {
    switch (source) {
      case "timelineRange":
        return timelineRange;
      case "dataLength":
        return data.length;
      case "storageCount":
        return storageLevels.length;
      case "storageLatestLabel":
        return storageLevels[storageLevels.length - 1]?.label ?? null;
      case "latestFlowRate":
        return latestPoint ? latestPoint.flowRate : null;
      case "latestPressure":
        return latestPoint ? latestPoint.pressure : null;
      default:
        return null;
    }
  };

  const formatMetaValue = (value, meta) => {
    if (value === null || value === undefined) {
      return "N/A";
    }
    let formatted = value;
    if (typeof value === "number" && typeof meta?.precision === "number") {
      formatted = value.toFixed(meta.precision);
    }
    if (typeof formatted === "number") {
      formatted = formatted.toString();
    }
    if (meta?.suffix && formatted !== "N/A") {
      formatted = `${formatted}${meta.suffix}`;
    }
    return formatted;
  };

  const buildDatasetFromConfig = (datasetConfig) => {
    if (!datasetConfig) {
      return [];
    }
    let sourceData = [];
    if (datasetConfig.source === "storageLevels") {
      sourceData = storageLevels;
    } else {
      sourceData = data;
    }
    if (datasetConfig.map === "flowRate") {
      sourceData = sourceData.map((point) => ({
        timestamp: point.timestamp,
        flowRate: point.flowRate,
      }));
    } else if (datasetConfig.map === "pressure") {
      sourceData = sourceData.map((point) => ({
        timestamp: point.timestamp,
        pressure: point.pressure,
      }));
    }
    if (typeof datasetConfig.limit === "number") {
      return previewData(sourceData, datasetConfig.limit);
    }
    return sourceData;
  };

  const openDetails = (payload) => setDetailView(payload);
  const closeDetails = () => setDetailView(null);

  const openMetricDetails = (card) => {
    openDetails({
      title: card.label,
      description: card.description,
      meta: [
        { label: "Current value", value: card.value },
        { label: "Trend delta", value: card.delta },
        { label: "Context", value: card.helper },
      ],
    });
  };

  const buildChartDetail = (type) => {
    const chartConfig = TREND_CHARTS[type];
    if (!chartConfig) {
      return null;
    }
    const meta = (chartConfig.detailMeta || []).map((metaConfig) => ({
      label: metaConfig.label,
      value: formatMetaValue(resolveMetaValue(metaConfig.source), metaConfig),
    }));
    return {
      title: chartConfig.detailTitle || chartConfig.panelTitle,
      description: chartConfig.detailDescription,
      meta,
      dataset: buildDatasetFromConfig(chartConfig.dataset),
    };
  };

  const openChartDetails = (key) => {
    const detail = buildChartDetail(key);
    if (detail) {
      openDetails(detail);
    }
  };

  const favoriteLinks = ["Overview", "Projects"];

  const sidebarCollections = [
    {
      title: "Dashboards",
      items: [
        { label: "Default", icon: FiBarChart2 },
        {
          label: "Alarms & Alerts",
          icon: FiBell,
          badge: `${unacknowledgedAlarms || 0}`,
        },
        { label: "Backup Status", icon: FiSettings },
        { label: "Demand & Supply", icon: FiTrendingUp },
      ],
    },
    {
      title: "Pages",
      items: [
        { label: "Logs", icon: FiFileText },
        { label: "Settings", icon: FiSettings },
        { label: "System Info", icon: FiActivity },
        { label: "Measurements", icon: FiBarChart2 },
        { label: "Alarms", icon: FiBell },
        { label: "System Health", icon: FiActivity },
        { label: "Backup", icon: FiLayers },
      ],
    },
  ];

  const statCards = KPI_DEFINITIONS.map((kpi) => ({
    id: kpi.id,
    label: kpi.label,
    value: metricValue(kpi.valueKey, kpi.valueSuffix || ""),
    delta: trendValue(kpi.deltaKey, kpi.deltaSuffix || ""),
    helper: kpi.helper,
    icon: KPI_ICON_MAP[kpi.iconKey] || null,
    tone: kpi.tone,
    description: kpi.description,
  }));

  const detailPayloads = {
    purity: buildChartDetail("purity"),
    storage: buildChartDetail("storage"),
    flow: buildChartDetail("flow"),
    pressure: buildChartDetail("pressure"),
  };

  const startPanelPulse = (setPulse, pulseRef) => {
    if (pulseRef.current) {
      clearTimeout(pulseRef.current);
    }
    setPulse(true);
    pulseRef.current = setTimeout(() => {
      setPulse(false);
      pulseRef.current = null;
    }, 1200);
  };

  const triggerAlarmPanelPulse = () =>
    startPanelPulse(setAlarmPanelPulse, alarmPulseTimeoutRef);
  const triggerBackupPanelPulse = () =>
    startPanelPulse(setBackupPanelPulse, backupPulseTimeoutRef);
  const triggerDemandPanelPulse = () =>
    startPanelPulse(setDemandPanelPulse, demandPulseTimeoutRef);
  const dashboardPulseHandlers = {
    "Alarms & Alerts": triggerAlarmPanelPulse,
    "Backup Status": triggerBackupPanelPulse,
    "Demand & Supply": triggerDemandPanelPulse,
  };
  const viewableDashboards = new Set(["Default"]);
  const handleDashboardSelection = (label) => {
    if (viewableDashboards.has(label)) {
      setActiveView(label);
    }
    const handler = dashboardPulseHandlers[label];
    if (handler) {
      handler();
    }
  };
  const handleStreamChange = (nextStreamId) => {
    if (!nextStreamId) {
      return;
    }
    setActiveStream(nextStreamId);
  };

  const handleNavigate = (label) => {
    setActiveView(label);
  };

  const isLogsView = activeView === "Logs";
  const isSettingsView = activeView === "Settings";
  const isMeasurementsView = activeView === "Measurements";
  const isAlarmsView = activeView === "Alarms";
  const isSystemHealthView = activeView === "System Health";
  const isBackupView = activeView === "Backup";

  const renderMainContent = () => {
    if (isLogsView) {
      return (
        <LogsPage
          logUpload={logUpload}
          logPreviewUrl={logPreviewUrl}
          canInlineLogPreview={canInlineLogPreview}
          handleLogUpload={handleLogUpload}
          formatFileSize={formatFileSize}
          uploadedLogTimestamp={uploadedLogTimestamp}
        />
      );
    }
    if (isSettingsView) {
      return (
        <div className="main-column settings-view">
          <SettingsPage settings={settings} onToggleSetting={toggleSetting} />
        </div>
      );
    }
    if (isMeasurementsView) {
      return <MeasurementsPage />;
    }
    if (isAlarmsView) {
      return <AlarmsPage />;
    }
    if (isSystemHealthView) {
      return <SystemHealthPage />;
    }
    if (isBackupView) {
      return <BackupPage />;
    }
    if (activeView === "Default") {
      return (
        <DashboardPage
          statCards={statCards}
          detailPayloads={detailPayloads}
          openMetricDetails={openMetricDetails}
          openChartDetails={openChartDetails}
          data={data}
          storageLevels={storageLevels}
          formatTimestamp={formatTimestamp}
          alarms={alarms}
          formatTimeAgo={formatTimeAgo}
          backup={backup}
          supplyDemand={supplyDemand}
          supplyFill={supplyFill}
          supplyIsHealthy={supplyIsHealthy}
          alarmPanelPulse={alarmPanelPulse}
          backupPanelPulse={backupPanelPulse}
          demandPanelPulse={demandPanelPulse}
          unacknowledgedAlarms={unacknowledgedAlarms}
          lastUpdated={lastUpdated}
          streamOptions={streamOptions}
          activeStream={activeStream}
          onStreamChange={handleStreamChange}
          currentStreamProfile={currentStreamProfile}
          currentStreamLabel={currentStreamProfile?.label || "-"}
          currentStreamProcess={currentStreamProcess}
          trendChartConfig={TREND_CHARTS}
        />
      );
    }
    return <NotFoundPage onGoHome={() => setActiveView("Default")} />;
  };

  return (
    <>
      <div className="app-grid">
        <Sidebar
          favoriteLinks={favoriteLinks}
          sidebarCollections={sidebarCollections}
          activeView={activeView}
          viewableDashboards={viewableDashboards}
          onDashboardSelect={handleDashboardSelection}
          onLogsSelect={() => setActiveView("Logs")}
          onSettingsSelect={() => setActiveView("Settings")}
          onNavigate={handleNavigate}
        />

        <div
          className={`workspace ${isLogsView ? "logs-mode" : ""} ${isSettingsView ? "settings-mode" : ""}`}
        >
          {renderMainContent()}
        </div>
      </div>
      <DetailModal detailView={detailView} onClose={closeDetails} />
      <ChatWidget webhookUrl={process.env.REACT_APP_N8N_CHAT_WEBHOOK} />
    </>
  );
}

/**
 * ProtectedContent – renders the main app only when authenticated.
 * While auth is being verified it shows a loading screen.
 * When not authenticated it shows the login page.
 */
function ProtectedContent() {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="loading-screen">
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppContent />;
}

/**
 * App – root component. Wraps the application with context providers
 * and delegates rendering to ProtectedContent.
 */
function App() {
  return (
    <AuthProvider>
      <MeasurementProvider>
        <AlarmProvider>
          <SystemHealthProvider>
            <ProtectedContent />
          </SystemHealthProvider>
        </AlarmProvider>
      </MeasurementProvider>
    </AuthProvider>
  );
}

export default App;
