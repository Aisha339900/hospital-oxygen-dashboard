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

const STREAM_CONFIG = {
  feed: {
    id: 'feed',
    label: 'Feed',
    code: '1',
    composition: { o2: 0.21, n2: 0.78, ar: 0.01 },
    flowBaseline: 72,
    flowVariance: 6,
    pressureBaseline: 44,
    pressureVariance: 4,
    demandCoverageBaseline: 62,
    demandVariance: 8,
    demandBaseline: 54,
    supplyVariance: 6,
    storageBaseline: 42,
    storageVariance: 6,
    backupBaseline: 58,
    backupVariance: 10,
    purityVariance: 1.2
  },
  membraneFeed: {
    id: 'membraneFeed',
    label: 'Membrane Feed',
    code: '3',
    composition: { o2: 0.21, n2: 0.78, ar: 0.01 },
    flowBaseline: 68,
    flowVariance: 6,
    pressureBaseline: 46,
    pressureVariance: 5,
    demandCoverageBaseline: 65,
    demandVariance: 7,
    demandBaseline: 56,
    supplyVariance: 6,
    storageBaseline: 44,
    storageVariance: 5,
    backupBaseline: 60,
    backupVariance: 9,
    purityVariance: 1
  },
  membranePermeate: {
    id: 'membranePermeate',
    label: 'Membrane Permeate',
    code: '5',
    composition: { o2: 0.4239, n2: 0.5725, ar: 0.0037 },
    flowBaseline: 58,
    flowVariance: 7,
    pressureBaseline: 40,
    pressureVariance: 5,
    demandCoverageBaseline: 72,
    demandVariance: 6,
    demandBaseline: 52,
    supplyVariance: 5,
    storageBaseline: 48,
    storageVariance: 6,
    backupBaseline: 66,
    backupVariance: 8,
    purityVariance: 1.6
  },
  membraneRetentate: {
    id: 'membraneRetentate',
    label: 'Membrane Retentate',
    code: '6',
    composition: { o2: 0.1299, n2: 0.8577, ar: 0.0124 },
    flowBaseline: 65,
    flowVariance: 8,
    pressureBaseline: 52,
    pressureVariance: 6,
    demandCoverageBaseline: 54,
    demandVariance: 9,
    demandBaseline: 58,
    supplyVariance: 7,
    storageBaseline: 38,
    storageVariance: 7,
    backupBaseline: 52,
    backupVariance: 10,
    purityVariance: 1.1
  },
  psaProduct: {
    id: 'psaProduct',
    label: 'PSA Product',
    code: '7',
    composition: { o2: 0.9332, n2: 0.0663, ar: 0.0004 },
    flowBaseline: 58,
    flowVariance: 5,
    pressureBaseline: 50,
    pressureVariance: 4,
    demandCoverageBaseline: 95,
    demandVariance: 4,
    demandBaseline: 48,
    supplyVariance: 4,
    storageBaseline: 62,
    storageVariance: 5,
    backupBaseline: 78,
    backupVariance: 6,
    purityVariance: 1
  },
  psaOffGas: {
    id: 'psaOffGas',
    label: 'PSA Off-Gas',
    code: '8',
    composition: { o2: 0.0373, n2: 0.9566, ar: 0.0061 },
    flowBaseline: 42,
    flowVariance: 6,
    pressureBaseline: 32,
    pressureVariance: 4,
    demandCoverageBaseline: 48,
    demandVariance: 8,
    demandBaseline: 60,
    supplyVariance: 7,
    storageBaseline: 34,
    storageVariance: 6,
    backupBaseline: 46,
    backupVariance: 11,
    purityVariance: 0.8
  }
};

const STREAM_OPTIONS = Object.values(STREAM_CONFIG);

const STREAM_PROCESS_SUMMARIES = {
  feed: { temperature: 25, pressure: 100, molarFlow: 17, massFlow: 492.5 },
  membraneFeed: { temperature: 25, pressure: 600, molarFlow: 17, massFlow: 492.5 },
  membranePermeate: { temperature: 25, pressure: 100, molarFlow: 4.633, massFlow: 137.8 },
  membraneRetentate: { temperature: 24.46, pressure: 600, molarFlow: 12.37, massFlow: 354.7 },
  psaProduct: { temperature: 25, pressure: 100, molarFlow: 1.999, massFlow: 63.44 },
  psaOffGas: { temperature: 25, pressure: 101, molarFlow: 2.634, massFlow: 74.36 }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const withJitter = (base, variance = 0) => base + (Math.random() - 0.5) * variance * 2;

// Local simulation helpers mimic the historical backend endpoints so the UI stays interactive.
const generateSimulatedData = (profile) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const purityBaseline = profile?.purityBaseline ?? (profile?.composition?.o2 || 0) * 100;
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (13 - index));
    return {
      timestamp: day.getTime(),
      purity: clamp(withJitter(purityBaseline, profile?.purityVariance ?? 1), 0, 100),
      flowRate: clamp(withJitter(profile?.flowBaseline ?? 55, profile?.flowVariance ?? 6), 0, 120),
      pressure: clamp(withJitter(profile?.pressureBaseline ?? 45, profile?.pressureVariance ?? 5), 0, 80),
      demandCoverage: clamp(
        withJitter(profile?.demandCoverageBaseline ?? 80, profile?.demandVariance ?? 6),
        0,
        140
      )
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

const generateBackupStatus = (profile) => ({
  mode: profile?.demandCoverageBaseline > 80 ? 'active' : Math.random() > 0.5 ? 'standby' : 'active',
  level: clamp(withJitter(profile?.backupBaseline ?? 60, profile?.backupVariance ?? 8), 10, 100),
  remainingHours: clamp(withJitter(24 + (profile?.backupBaseline ?? 60) / 2, 6), 6, 72),
  lastChecked: Date.now() - 3600000
});

const generateStorageLevels = (profile) => {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  return labels.map((label) => ({
    label,
    lastMonth: clamp(
      withJitter((profile?.storageBaseline ?? 45) + Math.random() * 5, profile?.storageVariance ?? 5),
      0,
      100
    ),
    thisMonth: clamp(
      withJitter((profile?.storageBaseline ?? 45) + 6 + Math.random() * 6, profile?.storageVariance ?? 5),
      0,
      100
    )
  }));
};

const generateSupplyDemand = (profile) => {
  const demand = clamp(withJitter(profile?.demandBaseline ?? 50, profile?.demandVariance ?? 6), 10, 120);
  const coverage = clamp(
    withJitter(profile?.demandCoverageBaseline ?? 80, profile?.demandVariance ?? 6),
    10,
    140
  );
  const supply = clamp((demand * coverage) / 100 + withJitter(0, profile?.supplyVariance ?? 4), 10, 140);
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
  const [activeStream, setActiveStream] = useState(STREAM_OPTIONS[0]?.id || '');
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

  const refreshStreamData = useCallback((streamId) => {
    try {
      const profile = STREAM_CONFIG[streamId] || STREAM_OPTIONS[0];
      if (!profile) {
        throw new Error('No stream profiles configured');
      }
      const simulatedData = generateSimulatedData(profile);
      setData(simulatedData);
      setStatus(createStatusSnapshot(simulatedData));
      setAlarms(generateAlarms());
      setBackup(generateBackupStatus(profile));
      setStorageLevels(generateStorageLevels(profile));
      setSupplyDemand(generateSupplyDemand(profile));
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to generate simulated data');
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

  const streamOptions = STREAM_OPTIONS;
  const currentStreamProfile = STREAM_CONFIG[activeStream] || streamOptions[0];
  const currentStreamProcess = STREAM_PROCESS_SUMMARIES[currentStreamProfile?.id] || null;
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
  const handleStreamChange = (nextStreamId) => {
    if (!nextStreamId) {
      return;
    }
    setActiveStream(nextStreamId);
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
              streamOptions={streamOptions}
              activeStream={activeStream}
              onStreamChange={handleStreamChange}
              currentStreamProfile={currentStreamProfile}
              currentStreamLabel={currentStreamProfile?.label || '-'}
              currentStreamProcess={currentStreamProcess}
            />
          )}
        </div>
      </div>
      <DetailModal detailView={detailView} onClose={closeDetails} />
    </>
  );
}

export default App;
