import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiBell,
  FiSettings,
  FiFileText,
  FiDroplet,
  FiLayers,
  FiTarget
} from 'react-icons/fi';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import DetailModal from './components/DetailModal';
import './App.css';

// Local simulation helpers mimic the historical backend endpoints so the UI stays interactive.
const generateSimulatedData = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (13 - index));
    return {
      timestamp: day.getTime(),
      purity: 94 + Math.random() * 5,
      flowRate: 48 + Math.random() * 22,
      pressure: 44 + Math.random() * 11,
      demandCoverage: 82 + Math.random() * 16
    };
  });
};

const createStatusSnapshot = (dataPoints) => {
  const latest = dataPoints[dataPoints.length - 1];
  if (!latest) {
    const now = Date.now();
    return {
      status: 'warning',
      purity: '0.00',
      flowRate: '0.00',
      pressure: '0.00',
      demandCoverage: '0.00',
      timestamp: now
    };
  }

  return {
    status: latest.purity > 96 && latest.pressure > 48 ? 'optimal' : 'warning',
    purity: latest.purity.toFixed(2),
    flowRate: latest.flowRate.toFixed(2),
    pressure: latest.pressure.toFixed(2),
    demandCoverage: latest.demandCoverage.toFixed(2),
    timestamp: latest.timestamp
  };
};

const generateAlarms = () => {
  const alarms = [];
  const now = Date.now();

  if (Math.random() > 0.6) {
    alarms.push({
      id: 1,
      severity: 'warning',
      message: 'Oxygen purity below optimal level',
      timestamp: now - 300000,
      acknowledged: false
    });
  }

  if (Math.random() > 0.7) {
    alarms.push({
      id: 2,
      severity: 'critical',
      message: 'Pressure fluctuation detected',
      timestamp: now - 180000,
      acknowledged: false
    });
  }

  if (Math.random() > 0.8) {
    alarms.push({
      id: 3,
      severity: 'info',
      message: 'Routine maintenance scheduled',
      timestamp: now - 600000,
      acknowledged: true
    });
  }

  return alarms;
};

const generateBackupStatus = () => ({
  mode: Math.random() > 0.5 ? 'standby' : 'active',
  level: 70 + Math.random() * 30,
  remainingHours: 24 + Math.random() * 24,
  lastChecked: Date.now() - 3600000
});

const generateStorageLevels = () => {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  return labels.map((label) => ({
    label,
    lastMonth: 35 + Math.random() * 25,
    thisMonth: 40 + Math.random() * 35
  }));
};

const generateSupplyDemand = () => {
  const demand = 50 + Math.random() * 10;
  const supply = demand + (Math.random() * 6 - 3);
  return {
    currentDemand: demand.toFixed(1),
    currentSupply: supply.toFixed(1),
    status: supply >= demand ? 'Supply meets demand' : 'Supply below demand',
    forecast: supply >= demand ? 'No supply risk detected' : 'Monitor supply closely'
  };
};

const DEFAULT_SETTINGS = {
  emailAlerts: true
};

const DEFAULT_LOG_ASSET_PATH = `${process.env.PUBLIC_URL || ''}/data-results.pdf`;
const DEFAULT_LOG_METADATA = {
  name: 'Data Results.pdf',
  size: 128959,
  type: 'application/pdf',
  lastModified: 1771072671000
};

const isBlobUrl = (url) => typeof url === 'string' && url.startsWith('blob:');

function App() {
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [backup, setBackup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageLevels, setStorageLevels] = useState([]);
  const [supplyDemand, setSupplyDemand] = useState(null);
  const [detailView, setDetailView] = useState(null);
  const [activeView, setActiveView] = useState('Default');
  const [alarmPanelPulse, setAlarmPanelPulse] = useState(false);
  const [backupPanelPulse, setBackupPanelPulse] = useState(false);
  const [demandPanelPulse, setDemandPanelPulse] = useState(false);
  const [logUpload, setLogUpload] = useState(() => ({ ...DEFAULT_LOG_METADATA }));
  const [logPreviewUrl, setLogPreviewUrl] = useState(DEFAULT_LOG_ASSET_PATH);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const alarmPulseTimeoutRef = useRef(null);
  const backupPulseTimeoutRef = useRef(null);
  const demandPulseTimeoutRef = useRef(null);

  const fetchData = useCallback(() => {
    try {
      const simulatedData = generateSimulatedData();
      setData(simulatedData);
      setStatus(createStatusSnapshot(simulatedData));
      setAlarms(generateAlarms());
      setBackup(generateBackupStatus());
      setStorageLevels(generateStorageLevels());
      setSupplyDemand(generateSupplyDemand());
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to generate simulated data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      [alarmPulseTimeoutRef, backupPulseTimeoutRef, demandPulseTimeoutRef].forEach((ref) => {
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
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
    return 'Just now';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return '0 B';
    }
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
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
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified
    });
    setLogPreviewUrl(nextUrl);
    event.target.value = '';
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

  const latestPoint = data[data.length - 1];
  const earliestPoint = data[0];
  const unacknowledgedAlarms = alarms.filter((a) => !a.acknowledged).length;
  const lastUpdated = formatTimestamp(status.timestamp);
  const supplyIsHealthy =
    supplyDemand && parseFloat(supplyDemand.currentSupply) >= parseFloat(supplyDemand.currentDemand);
  const timelineRange =
    earliestPoint && latestPoint
      ? `${formatTimestamp(earliestPoint.timestamp)} - ${formatTimestamp(latestPoint.timestamp)}`
      : 'No daily window';
  const supplyFill = supplyDemand
    ? Math.min((parseFloat(supplyDemand.currentSupply) / parseFloat(supplyDemand.currentDemand)) * 100, 140)
    : 0;
  const canInlineLogPreview =
    !!logUpload &&
    (logUpload.type === 'application/pdf' ||
      logUpload.type.startsWith('text/') ||
      /\.(csv|txt|json)$/i.test(logUpload.name || ''));
  const uploadedLogTimestamp = logUpload?.lastModified
    ? new Date(logUpload.lastModified).toLocaleString()
    : null;

  const trendValue = (key, suffix = '') => {
    if (!latestPoint || !earliestPoint) return `+0${suffix}`;
    const delta = latestPoint[key] - earliestPoint[key];
    const formatted = Math.abs(delta) >= 1 ? delta.toFixed(1) : delta.toFixed(2);
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${formatted}${suffix}`;
  };

  const previewData = (rows, limit = 6) => {
    if (!rows || rows.length === 0) return [];
    const start = Math.max(rows.length - limit, 0);
    return rows.slice(start);
  };

  const openDetails = (payload) => setDetailView(payload);
  const closeDetails = () => setDetailView(null);

  const openMetricDetails = (card) => {
    openDetails({
      title: card.label,
      description: card.description,
      meta: [
        { label: 'Current value', value: card.value },
        { label: 'Trend delta', value: card.delta },
        { label: 'Context', value: card.helper }
      ]
    });
  };

  const buildChartDetail = (type) => {
    switch (type) {
      case 'purity':
        return {
          title: 'Daily Oxygen Purity',
          description: 'Daily comparison between oxygen purity, flow rate, and pressure metrics for the latest reporting window.',
          meta: [
            { label: 'Date range', value: timelineRange },
            { label: 'Data points', value: data.length }
          ],
          dataset: previewData(data, 8)
        };
      case 'storage':
        return {
          title: 'Storage Level by Month',
          description: 'Contrasts reserve storage levels month-over-month to highlight seasonal dips.',
          meta: [
            { label: 'Months tracked', value: storageLevels.length },
            { label: 'Latest month', value: storageLevels[storageLevels.length - 1]?.label || 'N/A' }
          ],
          dataset: storageLevels
        };
      case 'flow':
        return {
          title: 'Daily Flow Rate',
          description: 'Highlights daily patient consumption trends and sudden surges in oxygen flow.',
          meta: [
            {
              label: 'Latest reading',
              value: latestPoint ? `${latestPoint.flowRate.toFixed(1)} m³/h` : 'N/A'
            },
            { label: 'Date range', value: timelineRange }
          ],
          dataset: previewData(
            data.map((point) => ({ timestamp: point.timestamp, flowRate: point.flowRate })),
            8
          )
        };
      case 'pressure':
        return {
          title: 'Daily Pressure Trend',
          description: 'Monitors distribution manifold pressure day over day to surface fluctuations before alarms fire.',
          meta: [
            {
              label: 'Latest reading',
              value: latestPoint ? `${latestPoint.pressure.toFixed(1)} bar` : 'N/A'
            },
            { label: 'Date range', value: timelineRange }
          ],
          dataset: previewData(
            data.map((point) => ({ timestamp: point.timestamp, pressure: point.pressure })),
            8
          )
        };
      default:
        return null;
    }
  };

  const openChartDetails = (key) => {
    const detail = buildChartDetail(key);
    if (detail) {
      openDetails(detail);
    }
  };

  const favoriteLinks = ['Overview', 'Projects'];

  const sidebarCollections = [
    {
      title: 'Dashboards',
      items: [
        { label: 'Default', icon: FiBarChart2 },
        { label: 'Alarms & Alerts', icon: FiBell, badge: `${unacknowledgedAlarms || 0}` },
        { label: 'Backup Status', icon: FiSettings },
        { label: 'Demand & Supply', icon: FiTrendingUp },
        { label: 'Trends', icon: FiFileText }
      ]
    },
    {
      title: 'Pages',
      items: [
        { label: 'Logs', icon: FiFileText },
        { label: 'Settings', icon: FiSettings },
        { label: 'System Info', icon: FiActivity }
      ]
    }
  ];

  const statCards = [
    {
      id: 'purity',
      label: 'Oxygen purity %',
      value: `${status.purity}%`,
      delta: trendValue('purity', '%'),
      helper: 'vs previous week',
      icon: FiDroplet,
      tone: 'mint',
      description: 'Tracks delivered oxygen purity versus the regulatory baseline.'
    },
    {
      id: 'flowRate',
      label: 'Flow rate m³/h',
      value: `${status.flowRate}`,
      delta: trendValue('flowRate'),
      helper: 'Average department',
      icon: FiLayers,
      tone: 'amber',
      description: 'Measures total oxygen throughput per hour across wards.'
    },
    {
      id: 'pressure',
      label: 'Delivery pressure bar',
      value: `${status.pressure}`,
      delta: trendValue('pressure'),
      helper: 'Stable manifold',
      icon: FiTarget,
      tone: 'rose',
      description: 'Shows manifold pressure stability at the main distribution header.'
    },
    {
      id: 'coverage',
      label: 'Demand coverage %',
      value: `${status.demandCoverage}%`,
      delta: trendValue('demandCoverage', '%'),
      helper: 'Capacity reserved',
      icon: FiTrendingUp,
      tone: 'gold',
      description: 'Represents how much of current demand is secured by supply commitments.'
    }
  ];

  const detailPayloads = {
    purity: buildChartDetail('purity'),
    storage: buildChartDetail('storage'),
    flow: buildChartDetail('flow'),
    pressure: buildChartDetail('pressure')
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

  const triggerAlarmPanelPulse = () => startPanelPulse(setAlarmPanelPulse, alarmPulseTimeoutRef);
  const triggerBackupPanelPulse = () => startPanelPulse(setBackupPanelPulse, backupPulseTimeoutRef);
  const triggerDemandPanelPulse = () => startPanelPulse(setDemandPanelPulse, demandPulseTimeoutRef);
  const dashboardPulseHandlers = {
    'Alarms & Alerts': triggerAlarmPanelPulse,
    'Backup Status': triggerBackupPanelPulse,
    'Demand & Supply': triggerDemandPanelPulse
  };
  const viewableDashboards = new Set(['Default', 'Trends']);
  const handleDashboardSelection = (label) => {
    if (viewableDashboards.has(label)) {
      setActiveView(label);
    }
    const handler = dashboardPulseHandlers[label];
    if (handler) {
      handler();
    }
  };
  const isTrendsView = activeView === 'Trends';
  const isLogsView = activeView === 'Logs';
  const isSettingsView = activeView === 'Settings';

  return (
    <>
      <div className="app-grid">
        <Sidebar
          favoriteLinks={favoriteLinks}
          sidebarCollections={sidebarCollections}
          activeView={activeView}
          viewableDashboards={viewableDashboards}
          onDashboardSelect={handleDashboardSelection}
          onLogsSelect={() => setActiveView('Logs')}
          onSettingsSelect={() => setActiveView('Settings')}
        />

        <div
          className={`workspace ${isTrendsView ? 'trends-mode' : ''} ${isLogsView ? 'logs-mode' : ''} ${
            isSettingsView ? 'settings-mode' : ''
          }`}
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
              <SettingsPage settings={settings} onToggleSetting={toggleSetting} />
            </div>
          ) : (
            <DashboardPage
              isTrendsView={isTrendsView}
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
            />
          )}
        </div>
      </div>
      <DetailModal detailView={detailView} onClose={closeDetails} />
    </>
  );
}

export default App;
