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
import DetailModal from "./components/DetailModal";
import ChatWidget from "./components/ChatWidget";
import KPI_DEFINITIONS from "./config/kpiDefinitions.js";
import TREND_CHARTS from "./config/trendChartsConfig.js";
import STREAM_PRESETS from "./config/streamPresets.js";
import STREAM_COMPOSITIONS from "./config/streamCompositions.js";
import STREAM_CONTROLS from "./config/streamControlsData.js";
import {
  generateTrendSeries,
  generateStreamStatus,
  generateStorageComparison,
  generateBackupPanelData,
  generateDemandPanelSnapshot,
} from "./utils/mockGenerators.js";
import { generateAlarmPanelData } from "./utils/alarmLogic.js";
import { loadLiveDashboard } from "./utils/liveDashboardMapper.js";
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

// Offline mock generators live in utils/mockGenerators.js.

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

/** Matches inline script in public/index.html: saved theme, else prefers-color-scheme, else dark. */
function readInitialIsDark() {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light") {
      return false;
    }
    if (t === "dark") {
      return true;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

function App() {
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
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [apiResolved, setApiResolved] = useState(false);
  const [logUpload, setLogUpload] = useState(() => ({
    ...DEFAULT_LOG_METADATA,
  }));
  const [logPreviewUrl, setLogPreviewUrl] = useState(DEFAULT_LOG_ASSET_PATH);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [isDarkMode, setIsDarkMode] = useState(readInitialIsDark);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const alarmPulseTimeoutRef = useRef(null);
  const backupPulseTimeoutRef = useRef(null);
  const demandPulseTimeoutRef = useRef(null);
  const prevStreamForMockRef = useRef(null);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((d) => {
      const next = !d;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const closeMobileSidebar = useCallback(() => setSidebarMobileOpen(false), []);

  const closeDetails = useCallback(() => setDetailView(null), []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove("light-mode");
    } else {
      document.documentElement.classList.add("light-mode");
    }
    const meta = document.getElementById("theme-color-meta");
    if (meta) {
      meta.setAttribute("content", isDarkMode ? "#050b1f" : "#f5f5f5");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!sidebarMobileOpen) {
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === "Escape" && !detailView) {
        setSidebarMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarMobileOpen, detailView]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 980px)");
    const apply = () => {
      if (mq.matches && sidebarMobileOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = "";
    };
  }, [sidebarMobileOpen]);

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
    let cancelled = false;
    (async () => {
      try {
        const live = await loadLiveDashboard();
        if (cancelled) {
          return;
        }
        setData(live.data);
        setStatus(live.status);
        setStorageLevels(live.storageLevels);
        setAlarms(live.alarms);
        setBackup(live.backup);
        setSupplyDemand(live.supplyDemand);
        setUseLiveApi(true);
        setLoading(false);
        setError(null);
      } catch {
        if (cancelled) {
          return;
        }
        setUseLiveApi(false);
        refreshStreamData(activeStream);
      } finally {
        if (!cancelled) {
          setApiResolved(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time API bootstrap
  }, []);

  useEffect(() => {
    if (!apiResolved || useLiveApi) {
      return;
    }
    if (!activeStream) {
      return;
    }
    if (prevStreamForMockRef.current === null) {
      prevStreamForMockRef.current = activeStream;
      return;
    }
    if (prevStreamForMockRef.current !== activeStream) {
      prevStreamForMockRef.current = activeStream;
      refreshStreamData(activeStream);
    }
  }, [apiResolved, useLiveApi, activeStream, refreshStreamData]);

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
    closeMobileSidebar();
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
  const isLogsView = activeView === "Logs";
  const isSettingsView = activeView === "Settings";

  return (
    <>
      <div className="app-shell">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="app-grid">
          <button
            type="button"
            className="sidebar-menu-toggle"
            aria-label={
              sidebarMobileOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={sidebarMobileOpen}
            onClick={() => setSidebarMobileOpen((open) => !open)}
          />
          {sidebarMobileOpen ? (
            <button
              type="button"
              className="sidebar-scrim"
              aria-label="Close menu"
              onClick={closeMobileSidebar}
            />
          ) : null}
          <Sidebar
            className={sidebarMobileOpen ? "sidebar--open" : ""}
            favoriteLinks={favoriteLinks}
            sidebarCollections={sidebarCollections}
            activeView={activeView}
            viewableDashboards={viewableDashboards}
            onDashboardSelect={handleDashboardSelection}
            onLogsSelect={() => {
              setActiveView("Logs");
              closeMobileSidebar();
            }}
            onSettingsSelect={() => {
              setActiveView("Settings");
              closeMobileSidebar();
            }}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />

          <main
            id="main-content"
            tabIndex={-1}
            className={`workspace ${isLogsView ? "logs-mode" : ""} ${isSettingsView ? "settings-mode" : ""}`}
          >
            {isLogsView ? (
              <LogsPage
                logUpload={logUpload}
                logPreviewUrl={logPreviewUrl}
                canInlineLogPreview={canInlineLogPreview}
                handleLogUpload={handleLogUpload}
                formatFileSize={formatFileSize}
                uploadedLogTimestamp={uploadedLogTimestamp}
              />
            ) : isSettingsView ? (
              <div className="main-column settings-view">
                <SettingsPage
                  settings={settings}
                  onToggleSetting={toggleSetting}
                />
              </div>
            ) : (
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
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
            )}
          </main>
        </div>
      </div>
      <DetailModal detailView={detailView} onClose={closeDetails} />
      <ChatWidget webhookUrl={process.env.REACT_APP_N8N_CHAT_WEBHOOK} />
    </>
  );
}

export default App;
