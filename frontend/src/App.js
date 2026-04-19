import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiSettings,
  FiFileText,
  FiDroplet,
  FiLayers,
  FiTarget,
  FiActivity,
} from "react-icons/fi";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import LogsPage from "./pages/LogsPage";
import BackupDemandPage from "./pages/BackupDemandPage";
import SettingsPage from "./pages/SettingsPage";
import SimulationDesignPage from "./pages/SimulationDesignPage";
import PredictiveAnalyticsPage from "./pages/PredictiveAnalyticsPage";
import AuthPage from "./pages/AuthPage";
import DetailModal from "./components/DetailModal";
import ChatWidget from "./components/ChatWidget";
import { LoadingSpinner } from "./components/LoadingSpinner";
import KPI_DEFINITIONS from "./config/kpiDefinitions.js";
import TREND_CHARTS from "./config/trendChartsConfig.js";
import { isAuthEnabled } from "./config/auth.js";
import {
  loadLiveDashboard,
  mapDbAlarmToPanel,
} from "./utils/liveDashboardMapper.js";
import { buildDashboardReportSnapshot } from "./utils/dashboardReportSnapshot.js";
import {
  generateAlarmPanelData,
  buildDashboardDerived,
  getMetricNumericValueForDashboard,
} from "./utils/alarmLogic.js";
import { streamsAPI, alarmService } from "./services";
import { getAlarmEmailSessionId } from "./utils/alarmEmailSession.js";
import "./App.css";

const MOLAR_FLOW_BANDS_BY_STREAM = {
  "1": { nominal: 47.838, criticalLow: 38.27, lowUpper: 43.054, normalUpper: 52.622, criticalHigh: 57.406 },
  "2": { nominal: 47.838, criticalLow: 38.27, lowUpper: 43.054, normalUpper: 52.622, criticalHigh: 57.406 },
  "3": { nominal: 47.838, criticalLow: 38.27, lowUpper: 43.054, normalUpper: 52.622, criticalHigh: 57.406 },
  "4": { nominal: 14.351, criticalLow: 11.481, lowUpper: 12.916, normalUpper: 15.786, criticalHigh: 17.221 },
  "5": { nominal: 33.487, criticalLow: 26.79, lowUpper: 30.138, normalUpper: 36.836, criticalHigh: 40.184 },
  "6": { nominal: 2.336, criticalLow: 1.869, lowUpper: 2.102, normalUpper: 2.57, criticalHigh: 2.803 },
  "7": { nominal: 12.016, criticalLow: 9.613, lowUpper: 10.814, normalUpper: 13.218, criticalHigh: 14.419 },
  "8": { nominal: 2.336, criticalLow: 1.869, lowUpper: 2.102, normalUpper: 2.57, criticalHigh: 2.803 },
  "9": { nominal: 2.336, criticalLow: 1.869, lowUpper: 2.102, normalUpper: 2.57, criticalHigh: 2.803 },
};

function buildMolarFlowRange(streamId) {
  const bands = MOLAR_FLOW_BANDS_BY_STREAM[String(streamId)];
  if (!bands) {
    return {
      min: 0,
      max: 60,
      optimalMin: 0,
      optimalMax: 60,
      unit: "",
      caption: "No configured stream band",
      helper: "stream reference unavailable",
    };
  }
  return {
    min: 0,
    max: bands.criticalHigh,
    optimalMin: bands.lowUpper,
    optimalMax: bands.normalUpper,
    unit: "",
    caption: `Normal ${bands.lowUpper.toFixed(3)}-${bands.normalUpper.toFixed(3)} kmol/h`,
    helper: `vs previous stream`,
  };
}

const normalizeStreamProfiles = (streams) => {
  if (!Array.isArray(streams)) {
    return [];
  }

  return streams
    .map((entry) => {
      const streamId =
        entry?.stream_id !== undefined ? String(entry.stream_id) : null;
      if (!streamId) {
        return null;
      }
      const oxygenPurity = Number(entry?.oxygen_purity_percent);
      const flowRate = Number(entry?.flow_rate_m3h);
      const pressureBar = Number(entry?.delivery_pressure_bar);
      const temperature = Number(entry?.temperature_out);
      const molarFlow = Number(entry?.molar_flow);
      const massFlow = Number(entry?.mass_flow);

      const asNumberOrFallback = (value, fallback = "-") =>
        Number.isFinite(value) ? value : fallback;

      return {
        id: streamId,
        code: streamId,
        label: entry?.label || entry?.stream_name || `Stream ${streamId}`,
        composition: {
          o2: asNumberOrFallback(oxygenPurity),
          n2: "-",
          ar: "-",
        },
        process: {
          oxygenPurityPercent: asNumberOrFallback(oxygenPurity, null),
          flowRateM3h: asNumberOrFallback(flowRate, null),
          deliveryPressureBar: asNumberOrFallback(pressureBar, null),
          temperature: asNumberOrFallback(temperature, null),
          pressure: asNumberOrFallback(pressureBar, null),
          molarFlow: asNumberOrFallback(molarFlow, null),
          massFlow: asNumberOrFallback(massFlow, null),
          description: entry?.label || entry?.stream_name || `Stream ${streamId}`,
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(a.id) - Number(b.id));
};


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

const AUTH_STORAGE_KEY = "oxygen.auth.v1";
const DEFAULT_LOG_ASSET_PATH = `${process.env.PUBLIC_URL || ""}/data-results.pdf`;
const DEFAULT_LOG_METADATA = {
  name: "Data Results.pdf",
  size: 128959,
  type: "application/pdf",
  lastModified: 1771072671000,
};
const DEFAULT_BACKUP_DEMAND_ASSET_PATH = `${process.env.PUBLIC_URL || ""}/HOSPITAL OXYGEN SIMULATION.pdf`;
const DEFAULT_BACKUP_DEMAND_METADATA = {
  name: "HOSPITAL OXYGEN SIMULATION.pdf",
  size: 243386,
  type: "application/pdf",
  lastModified: 0,
};
const BACKUP_TOTAL_CAPACITY_LITERS = 50000;
const LINKED_BACKUP_TEST_FIELDS = new Set([
  "storageLevel",
  "backupUtilization",
  "backupRemaining",
]);

function parseDashboardInputNumber(raw) {
  if (raw === "" || raw === null || raw === undefined) {
    return null;
  }
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatLinkedNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return "";
  }
  const rounded = Number(value.toFixed(decimals));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

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

function readInitialAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.email) {
        return {
          email: parsed.email,
          name: typeof parsed.name === "string" ? parsed.name : null,
          role: typeof parsed.role === "string" ? parsed.role : null,
          createdAt:
            typeof parsed.createdAt === "number" ? parsed.createdAt : null,
        };
      }
    }
    const token = localStorage.getItem("authToken");
    const userRaw = localStorage.getItem("user");
    if (token && userRaw) {
      const u = JSON.parse(userRaw);
      if (u && typeof u.email === "string" && u.email) {
        return {
          email: u.email,
          name: typeof u.name === "string" ? u.name : null,
          role: typeof u.role === "string" ? u.role : null,
          createdAt: null,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

function App() {
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [backup, setBackup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageLevels, setStorageLevels] = useState([]);
  const [supplyDemand, setSupplyDemand] = useState(null);
  const [streamProfiles, setStreamProfiles] = useState([]);
  const [activeStream, setActiveStream] = useState("");
  const [detailView, setDetailView] = useState(null);
  const [activeView, setActiveView] = useState("Monitoring");
  const [simulationEntry, setSimulationEntry] = useState(null);
  const [alarmPanelPulse] = useState(false);
  const [backupPanelPulse] = useState(false);
  const [demandPanelPulse] = useState(false);
  const [apiResolved] = useState(false);
  const [useLiveApi] = useState(false);
  const [logUpload, setLogUpload] = useState(() => ({
    ...DEFAULT_LOG_METADATA,
  }));
  const [logPreviewUrl, setLogPreviewUrl] = useState(DEFAULT_LOG_ASSET_PATH);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [isDarkMode, setIsDarkMode] = useState(readInitialIsDark);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [auth, setAuth] = useState(readInitialAuth);
  const [backupDemandUpload, setBackupDemandUpload] = useState(
    DEFAULT_BACKUP_DEMAND_METADATA,
  );
  const [backupDemandPreviewUrl, setBackupDemandPreviewUrl] = useState(
    DEFAULT_BACKUP_DEMAND_ASSET_PATH,
  );
  const [dashboardTestModeEnabled, setDashboardTestModeEnabled] =
    useState(false);
  const [dashboardTestInputs, setDashboardTestInputs] = useState({
    purity: "",
    flowRate: "",
    molarFlow: "",
    pressureBar: "",
    demandCoverage: "",
    storageLevel: "",
    backupRemaining: "",
    backupUtilization: "",
    specificEnergy: "",
  });
  const alarmPulseTimeoutRef = useRef(null);
  const backupPulseTimeoutRef = useRef(null);
  const demandPulseTimeoutRef = useRef(null);
  /** First sync after changing stream sends streamChanged so the API can email active alerts for that view. */
  const lastStreamForSyncRef = useRef(null);
  const streamChangedForNextSyncRef = useRef(false);

  const persistAuth = useCallback((nextAuth) => {
    try {
      if (!nextAuth) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    } catch {
      // ignore localStorage failures (private mode, quota, etc.)
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((d) => {
      const next = !d;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const closeMobileSidebar = useCallback(() => setSidebarMobileOpen(false), []);

  const handleOpenSimulationEntry = useCallback((mode) => {
    setSimulationEntry(mode);
    setActiveView("Simulation design");
  }, []);

  const handleSimulationDesignFromSidebar = useCallback(() => {
    setSimulationEntry("training");
    setActiveView("Simulation design");
    closeMobileSidebar();
  }, [closeMobileSidebar]);

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
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const mq = window.matchMedia("(max-width: 980px)");
    if (!mq) {
      return undefined;
    }
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [live, streamRows] = await Promise.all([
          loadLiveDashboard(),
          streamsAPI.getAllStreams(),
        ]);
        if (cancelled) {
          return;
        }

        const normalizedStreams = normalizeStreamProfiles(streamRows);
        if (normalizedStreams.length === 0) {
          throw new Error("No Aspen streams available in database.");
        }

        const defaultStream =
          normalizedStreams.find((stream) => stream.id === "9") ||
          normalizedStreams.find(
            (stream) =>
              String(stream.label || "").trim().toLowerCase() ===
              "out cooler 2",
          ) ||
          normalizedStreams[0];

        setStreamProfiles(normalizedStreams);
        setActiveStream((prev) => {
          if (prev && normalizedStreams.some((stream) => stream.id === prev)) {
            return prev;
          }
          return defaultStream.id;
        });
        setData(live.data);
        setTrendData(live.trendData || []);
        setStatus(live.status);
        setStorageLevels(live.storageLevels);
        setBackup(live.backup);
        setSupplyDemand(live.supplyDemand);
        setLoading(false);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err?.message || "Failed to load dashboard from API");
        setLoading(false);
      } finally {
        // no-op
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  useEffect(() => {
    return () => {
      if (isBlobUrl(backupDemandPreviewUrl)) {
        URL.revokeObjectURL(backupDemandPreviewUrl);
      }
    };
  }, [backupDemandPreviewUrl]);

  const dashboardDerived = useMemo(() => {
    if (loading || error) {
      return null;
    }
    return buildDashboardDerived({
      streamProfiles,
      activeStream,
      data,
      supplyDemand,
      backup,
      status,
      dashboardTestModeEnabled,
      dashboardTestInputs,
    });
  }, [
    loading,
    error,
    streamProfiles,
    activeStream,
    data,
    supplyDemand,
    backup,
    status,
    dashboardTestModeEnabled,
    dashboardTestInputs,
  ]);

  const currentStreamProcessEarly = useMemo(() => {
    const idx = streamProfiles.findIndex((p) => p.id === activeStream);
    return streamProfiles[idx]?.process || null;
  }, [streamProfiles, activeStream]);

  const getMetricNumericValue = useCallback(
    (valueKey) => {
      return getMetricNumericValueForDashboard({
        valueKey,
        dashboardTestModeEnabled,
        dashboardTestInputs,
        currentStreamProcess: currentStreamProcessEarly,
        status,
        displayCoveragePercent: dashboardDerived?.displayCoveragePercent ?? null,
      });
    },
    [
      dashboardTestModeEnabled,
      dashboardTestInputs,
      currentStreamProcessEarly,
      status,
      dashboardDerived?.displayCoveragePercent,
    ],
  );

  const ruleDerivedAlarms = useMemo(() => {
    if (!dashboardDerived) {
      return [];
    }
    return generateAlarmPanelData({
      latestPoint: dashboardDerived.alarmEvaluationPoint,
      supplyDemand: dashboardDerived.effectiveSupplyDemand,
      backupData: dashboardDerived.effectiveBackupForAlarms,
      streamId: activeStream,
    });
  }, [dashboardDerived, activeStream]);

  const displayAlarms = useMemo(() => {
    if (dashboardTestModeEnabled) {
      return ruleDerivedAlarms;
    }
    const ackByKey = new Map(
      alarms.map((a) => [a.ruleKey, a]).filter(([k]) => k),
    );
    return ruleDerivedAlarms.map((r) => {
      const db = ackByKey.get(r.ruleKey);
      return {
        ...r,
        acknowledged: db?.acknowledged ?? false,
        id: db?.id ?? r.id,
      };
    });
  }, [ruleDerivedAlarms, alarms, dashboardTestModeEnabled]);

  const unacknowledgedAlarms = useMemo(
    () => displayAlarms.filter((a) => !a.acknowledged).length,
    [displayAlarms],
  );

  useEffect(() => {
    if (!activeStream) {
      return;
    }
    if (lastStreamForSyncRef.current === null) {
      lastStreamForSyncRef.current = activeStream;
      return;
    }
    if (lastStreamForSyncRef.current !== activeStream) {
      streamChangedForNextSyncRef.current = true;
      lastStreamForSyncRef.current = activeStream;
    }
  }, [activeStream]);

  useEffect(() => {
    if (loading || !activeStream || dashboardTestModeEnabled || !dashboardDerived) {
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const streamChanged = streamChangedForNextSyncRef.current;
        streamChangedForNextSyncRef.current = false;
        const pt = dashboardDerived.alarmEvaluationPoint;
        await alarmService.syncDashboardAlarms({
          streamId: activeStream,
          streamChanged,
          alarmEmailSessionId: getAlarmEmailSessionId(),
          latestPoint: {
            purity: pt.purity,
            flowRate: pt.flowRate,
            pressureBar: pt.pressureBar,
            pressure: pt.pressure,
            specificEnergy: pt.specificEnergy,
            timestamp: pt.timestamp,
          },
          supplyDemand: dashboardDerived.effectiveSupplyDemand,
          backupData: dashboardDerived.effectiveBackupForAlarms,
        });
        if (cancelled) {
          return;
        }
        const raw = await alarmService.getActiveAlarms({
          params: { streamId: activeStream },
        });
        if (cancelled) {
          return;
        }
        setAlarms(
          (Array.isArray(raw) ? raw : [])
            .map(mapDbAlarmToPanel)
            .filter(Boolean),
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, activeStream, dashboardTestModeEnabled, dashboardDerived]);

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

  const handleBackupDemandUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (isBlobUrl(backupDemandPreviewUrl)) {
      URL.revokeObjectURL(backupDemandPreviewUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setBackupDemandUpload({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      lastModified: file.lastModified,
    });
    setBackupDemandPreviewUrl(nextUrl);
    event.target.value = "";
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleAuthSuccess = useCallback(
    (payload) => {
      const nextAuth = {
        email: payload.email,
        name: payload.name || null,
        role: payload.role ?? null,
        createdAt:
          typeof payload.createdAt === "number" ? payload.createdAt : Date.now(),
      };
      setAuth(nextAuth);
      persistAuth(nextAuth);
    },
    [persistAuth],
  );

  const handleSignOut = useCallback(() => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } catch {
      /* ignore */
    }
    setAuth(null);
    persistAuth(null);
  }, [persistAuth]);

  const handleDashboardTestModeToggle = useCallback((next) => {
    setDashboardTestModeEnabled(next);
  }, []);

  const handleDashboardTestInputChange = useCallback((key, raw) => {
    setDashboardTestInputs((prev) => {
      if (!dashboardTestModeEnabled || !LINKED_BACKUP_TEST_FIELDS.has(key)) {
        return { ...prev, [key]: raw };
      }

      if (String(raw ?? "").trim() === "") {
        return {
          ...prev,
          storageLevel: "",
          backupUtilization: "",
          backupRemaining: "",
        };
      }

      const parsed = parseDashboardInputNumber(raw);
      if (parsed === null) {
        return { ...prev, [key]: raw };
      }

      let storageLevel;
      if (key === "storageLevel") {
        storageLevel = clampNumber(parsed, 0, 100);
      } else if (key === "backupUtilization") {
        const utilization = clampNumber(parsed, 0, 100);
        storageLevel = 100 - utilization;
      } else {
        const remaining = clampNumber(parsed, 0, BACKUP_TOTAL_CAPACITY_LITERS);
        storageLevel = (remaining / BACKUP_TOTAL_CAPACITY_LITERS) * 100;
      }

      const utilization = 100 - storageLevel;
      const remainingLiters =
        (storageLevel / 100) * BACKUP_TOTAL_CAPACITY_LITERS;

      return {
        ...prev,
        storageLevel: formatLinkedNumber(storageLevel, 2),
        backupUtilization: formatLinkedNumber(utilization, 2),
        backupRemaining: formatLinkedNumber(remainingLiters, 0),
      };
    });
  }, [dashboardTestModeEnabled]);

  const authRequired = isAuthEnabled() && !auth;


  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!dashboardDerived) {
    return <div className="error">No trend data available.</div>;
  }

  const streamOptions = streamProfiles;
  const currentStreamIndex = streamProfiles.findIndex(
    (profile) => profile.id === activeStream,
  );
  const currentStreamProfile =
    streamProfiles[currentStreamIndex] || streamOptions[0] || null;
  const previousStreamProfile =
    currentStreamIndex > 0 ? streamProfiles[currentStreamIndex - 1] : null;
  const currentStreamProcess = currentStreamProfile?.process || null;
  const previousStreamProcess = previousStreamProfile?.process || null;
  const {
    latestPoint,
    coveragePercent,
    displayCoveragePercent,
    effectiveBackupForAlarms,
  } = dashboardDerived;
  const earliestPoint = data[0];
  const lastUpdated = status?.timestamp
    ? formatTimestamp(status.timestamp)
    : "N/A";

  const supplyIsHealthy =
    displayCoveragePercent !== null
      ? displayCoveragePercent >= 95
      : Boolean(
          (supplyDemand?.supply?.status || supplyDemand?.status || "")
            .toLowerCase()
            .includes("healthy"),
        );
  const timelineRange =
    earliestPoint && latestPoint
      ? `${formatTimestamp(earliestPoint.timestamp)} - ${formatTimestamp(latestPoint.timestamp)}`
      : "No daily window";
  const trendFeedRange = trendData.length
    ? `${Number(trendData[0].feed_flow_kmol_h).toFixed(2)} - ${Number(
        trendData[trendData.length - 1].feed_flow_kmol_h,
      ).toFixed(2)} kmol/h`
    : "No trend window";
  const supplyFill =
    displayCoveragePercent !== null
      ? Math.min(Math.max(displayCoveragePercent, 0), 140)
      : 0;
  const backupForDisplay = effectiveBackupForAlarms || backup;
  const canInlineLogPreview =
    !!logUpload &&
    (logUpload.type === "application/pdf" ||
      logUpload.type.startsWith("text/") ||
      /\.(csv|txt|json)$/i.test(logUpload.name || ""));
  const uploadedLogTimestamp = logUpload?.lastModified
    ? new Date(logUpload.lastModified).toLocaleString()
    : null;
  const canInlineBackupDemandPreview =
    !!backupDemandUpload &&
    (backupDemandUpload.type === "application/pdf" ||
      backupDemandUpload.type.startsWith("text/") ||
      /\.(csv|txt|json)$/i.test(backupDemandUpload.name || ""));
  const uploadedBackupDemandTimestamp = backupDemandUpload?.lastModified
    ? new Date(backupDemandUpload.lastModified).toLocaleString()
    : null;

  const trendValue = (key, suffix = "") => {
    if (!latestPoint || !earliestPoint) return `+0${suffix}`;
    const delta = latestPoint[key] - earliestPoint[key];
    const formatted =
      Math.abs(delta) >= 1 ? delta.toFixed(1) : delta.toFixed(2);
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${formatted}${suffix}`;
  };

  const compareStreamValue = (currentValue, previousValue, suffix = "") => {
    const current = Number(currentValue);
    const previous = Number(previousValue);
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      return `0%`;
    }
    if (previous === 0) {
      return current === 0 ? "0%" : `+100%`;
    }
    const percentageChange = ((current - previous) / Math.abs(previous)) * 100;
    const formatted = percentageChange.toFixed(2);
    const sign = percentageChange >= 0 ? "+" : "";
    return `${sign}${formatted}%`;
  };

  const metricValue = (key, suffix = "") => {
    if (!key) {
      return `0${suffix}`;
    }
    const value = getMetricNumericValue(key);
    if (value !== null && Number.isFinite(value)) {
      return `${value.toFixed(2)}${suffix}`;
    }
    return `0${suffix}`;
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
      case "trendDataLength":
        return trendData.length;
      case "trendFeedRange":
        return trendFeedRange;
      default:
        return null;
    }
  };

  const formatMetaValue = (value, meta) => {
    if (value === null || value === undefined) {
      return "N/A";
    }
    let formatted = value;
    if (typeof value === "number") {
      const precision = typeof meta?.precision === "number" ? meta.precision : 2;
      formatted = value.toFixed(precision);
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
    } else if (datasetConfig.source === "trendData") {
      sourceData = trendData;
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
    const meta = [{ label: "Current value", value: card.value }];
    if (card.delta) {
      meta.push({ label: "Trend delta", value: card.delta });
    }
    meta.push({ label: "Context", value: card.helper });

    openDetails({
      title: card.label,
      description: card.description,
      meta,
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
        { label: "Monitoring", icon: FiBarChart2 },
        { label: "Predictive Analytics", icon: FiActivity },
      ],
    },
    {
      title: "Pages",
      items: [
        { label: "Simulation Design", icon: FiLayers },
        { label: "Logs", icon: FiFileText },
        { label: "Backup & Demand", icon: FiFileText },
        { label: "Settings", icon: FiSettings },
        
      ],
    },
  ];

  const molarFlowRange = buildMolarFlowRange(activeStream);
  const statCards = KPI_DEFINITIONS.map((kpi) => ({
    id: kpi.id,
    label: kpi.label,
    value: metricValue(kpi.valueKey, kpi.valueSuffix || ""),
    range: kpi.id === "molarFlow" ? { ...molarFlowRange } : kpi.range,
    rangeValue: getMetricNumericValue(kpi.valueKey),
    delta:
      kpi.id === "purity"
        ? compareStreamValue(
            currentStreamProcess?.oxygenPurityPercent,
            previousStreamProcess?.oxygenPurityPercent,
            kpi.deltaSuffix || "",
          )
        : kpi.id === "molarFlow"
          ? compareStreamValue(
              currentStreamProcess?.molarFlow,
              previousStreamProcess?.molarFlow,
              kpi.deltaSuffix || "",
            )
          : kpi.id === "pressure"
            ? compareStreamValue(
                currentStreamProcess?.deliveryPressureBar,
                previousStreamProcess?.deliveryPressureBar,
                kpi.deltaSuffix || "",
              )
            : kpi.id === "coverage"
              ? ""
              : trendValue(kpi.deltaKey, kpi.deltaSuffix || ""),
    helper: kpi.id === "molarFlow" ? molarFlowRange.helper : kpi.helper,
    icon: KPI_ICON_MAP[kpi.iconKey] || null,
    tone: kpi.tone,
    description: kpi.description,
  }));

  const detailPayloads = {
    oxygenProductFlowVsFeedFlow: buildChartDetail(
      "oxygenProductFlowVsFeedFlow",
    ),
    oxygenPurityVsFeedFlow: buildChartDetail("oxygenPurityVsFeedFlow"),
  };

  const viewableDashboards = new Set(["Monitoring", "Predictive Analytics"]);
  const handleDashboardSelection = (label) => {
    closeMobileSidebar();
    if (viewableDashboards.has(label)) {
      setSimulationEntry(null);
      setActiveView(label);
    }
  };
  const handleStreamChange = (nextStreamId) => {
    if (!nextStreamId) {
      return;
    }
    setActiveStream(nextStreamId);
  };

  const isLogsView = activeView === "Logs";
  const isBackupDemandView = activeView === "Backup & Demand";
  const isSettingsView = activeView === "Settings";
  const isPredictiveView = activeView === "Predictive Analytics";
  const isSimulationView = activeView === "Simulation design";
  const trendsAreSimulated = apiResolved && !useLiveApi;

  return (
    <>
  <div className={`app-shell ${authRequired ? "auth-locked" : ""}`}>
            <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="app-shell__content">
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
              setSimulationEntry(null);
              setActiveView("Logs");
              closeMobileSidebar();
            }}
            onBackupDemandSelect={() => {
              setSimulationEntry(null);
              setActiveView("Backup & Demand");
              closeMobileSidebar();
            }}
            onSettingsSelect={() => {
              setSimulationEntry(null);
              setActiveView("Settings");
              closeMobileSidebar();
            }}
            onSimulationDesignSelect={handleSimulationDesignFromSidebar}
            onPredictiveAnalyticsSelect={() => {
              setSimulationEntry(null);
              setActiveView("Predictive Analytics");
              closeMobileSidebar();
            }}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />

          <main
            id="main-content"
            tabIndex={-1}
            className={`workspace ${isLogsView ? "logs-mode" : ""} ${isBackupDemandView ? "logs-mode" : ""} ${isSettingsView ? "settings-mode" : ""} ${isPredictiveView || isSimulationView ? "predictive-mode" : ""}`}
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
            ) : isBackupDemandView ? (
              <BackupDemandPage
                backupDemandUpload={backupDemandUpload}
                backupDemandPreviewUrl={backupDemandPreviewUrl}
                canInlineBackupDemandPreview={canInlineBackupDemandPreview}
                handleBackupDemandUpload={handleBackupDemandUpload}
                formatFileSize={formatFileSize}
                uploadedBackupDemandTimestamp={uploadedBackupDemandTimestamp}
              />
            ) : isSettingsView ? (
              <div className="main-column settings-view">
                <SettingsPage
                  settings={settings}
                  onToggleSetting={toggleSetting}
                  onSignOut={handleSignOut}
                  authEmail={auth?.email || null}
                  authName={auth?.name || null}
                  authRole={auth?.role || null}
                />
              </div>
               ) : isSimulationView ? (
                <SimulationDesignPage
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                  entryMode={simulationEntry}
                />
            ) : isPredictiveView ? (
              <PredictiveAnalyticsPage />
            ) : (
              <DashboardPage
                statCards={statCards}
                detailPayloads={detailPayloads}
                openMetricDetails={openMetricDetails}
                openChartDetails={openChartDetails}
                trendData={trendData}
                alarms={displayAlarms}
                formatTimeAgo={formatTimeAgo}
                backup={backupForDisplay}
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
                trendsAreSimulated={trendsAreSimulated}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                onOpenSimulationEntry={handleOpenSimulationEntry}
                buildReportSnapshot={(reportOptions) =>
                  buildDashboardReportSnapshot({
                    formatTimeAgo,
                    currentStreamLabel: currentStreamProfile?.label || "-",
                    activeStream,
                    streamProfiles,
                    lastUpdated,
                    status,
                    statCards,
                    alarms: displayAlarms,
                    backup: backupForDisplay,
                    supplyDemand,
                    coveragePercent: displayCoveragePercent ?? coveragePercent,
                    supplyIsHealthy,
                    unacknowledgedAlarms,
                    trendsAreSimulated,
                    timelineRange,
                    trendFeedRange,
                    trendData,
                    reportOptions,
                    dashboardTestModeEnabled,
                  })
                }
                reportUserEmail={auth?.email || ""}
                reportCanEmail={
                  typeof window !== "undefined" &&
                  Boolean(localStorage.getItem("authToken"))
                }
                dashboardTestModeEnabled={dashboardTestModeEnabled}
                onDashboardTestModeToggle={handleDashboardTestModeToggle}
                dashboardTestInputs={dashboardTestInputs}
                onDashboardTestInputChange={handleDashboardTestInputChange}
              />
            )}
          </main>
        </div>
        </div>
      </div>
      {authRequired ? (
        <AuthPage
          variant="modal"
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onAuthSuccess={handleAuthSuccess}
        />
      ) : null}
      <DetailModal detailView={detailView} onClose={closeDetails} />
      <ChatWidget webhookUrl={process.env.REACT_APP_N8N_CHAT_WEBHOOK} />
    </>
  );
}

export default App;
