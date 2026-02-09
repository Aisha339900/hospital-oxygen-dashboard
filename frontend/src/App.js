import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiBell,
  FiSettings,
  FiFileText,
  FiArrowUpRight,
  FiSearch,
  FiChevronDown,
  FiDroplet,
  FiLayers,
  FiTarget,
  FiSun,
  FiInfo,
  FiExternalLink,
  FiX
} from 'react-icons/fi';
import './App.css';

// Local simulation helpers mimic the historical backend endpoints so the UI stays interactive.
const generateSimulatedData = () => {
  const baseTime = Date.now();
  return Array.from({ length: 20 }, (_, index) => ({
    timestamp: baseTime - (19 - index) * 60000,
    purity: 95 + Math.random() * 4,
    flowRate: 50 + Math.random() * 20,
    pressure: 45 + Math.random() * 10,
    demandCoverage: 85 + Math.random() * 14
  }));
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
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
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
      : 'No live window';
  const supplyFill = supplyDemand
    ? Math.min((parseFloat(supplyDemand.currentSupply) / parseFloat(supplyDemand.currentDemand)) * 100, 140)
    : 0;

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
          title: 'Oxygen Purity vs Time',
          description: 'Live comparison between oxygen purity, flow rate, and pressure metrics for the last telemetry window.',
          meta: [
            { label: 'Live window', value: timelineRange },
            { label: 'Data points', value: data.length }
          ],
          dataset: previewData(data, 8)
        };
      case 'storage':
        return {
          title: 'Storage Level vs Time',
          description: 'Contrasts reserve storage levels month-over-month to highlight seasonal dips.',
          meta: [
            { label: 'Months tracked', value: storageLevels.length },
            { label: 'Latest month', value: storageLevels[storageLevels.length - 1]?.label || 'N/A' }
          ],
          dataset: storageLevels
        };
      case 'flow':
        return {
          title: 'Flow Rate vs Time',
          description: 'Highlights live patient consumption trends and sudden surges in oxygen flow.',
          meta: [
            {
              label: 'Latest reading',
              value: latestPoint ? `${latestPoint.flowRate.toFixed(1)} m³/h` : 'N/A'
            },
            { label: 'Live window', value: timelineRange }
          ],
          dataset: previewData(
            data.map((point) => ({ timestamp: point.timestamp, flowRate: point.flowRate })),
            8
          )
        };
      case 'pressure':
        return {
          title: 'Pressure vs Time',
          description: 'Monitors distribution manifold pressure to surface fluctuations before alarms fire.',
          meta: [
            {
              label: 'Latest reading',
              value: latestPoint ? `${latestPoint.pressure.toFixed(1)} bar` : 'N/A'
            },
            { label: 'Live window', value: timelineRange }
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
        { label: 'Default', icon: FiBarChart2, active: true },
        { label: 'Monitoring', icon: FiActivity },
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

  return (
    <>
      <div className="app-grid">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-mark">O₂</div>
          <div>
            <p className="brand-sub">By009</p>
            <strong>Oxygen Ops</strong>
          </div>
        </div>

        <div className="sidebar-tabs" role="tablist">
          <button className="tab active" type="button">
            Favorites
          </button>
          <button className="tab" type="button">
            Recently
          </button>
        </div>

        <ul className="favorites-list">
          {favoriteLinks.map((link) => (
            <li key={link}>{link}</li>
          ))}
        </ul>

        <div className="sidebar-menu">
          {sidebarCollections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <p className="sidebar-section-title">{section.title}</p>
              <ul>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className={item.active ? 'active' : ''}>
                      <div className="nav-left">
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <p className="footer-label">Senior Design</p>
          <span>Powering medical data</span>
        </div>
      </aside>

      <div className="workspace">
        <div className="main-column">
          <header className="status-bar">
            <div className="status-left">
              <span className="status-pill warn">Warning</span>
              <span className="status-pill accent">Alarms: {unacknowledgedAlarms || 0}</span>
              <span className="status-pill neutral">Last update {lastUpdated}</span>
            </div>
            <div className="status-right">
              <div className="search-box">
                <FiSearch aria-hidden="true" />
                <input type="text" placeholder="Search" aria-label="Search modules" />
              </div>
              <button className="icon-btn" aria-label="Toggle theme">
                <FiSun />
              </button>
              <button className="icon-btn" aria-label="Notifications">
                <FiBell />
              </button>
            </div>
          </header>

          <div className="today-row">
            <div className="today-select">
              Today
              <FiChevronDown aria-hidden="true" />
            </div>
            <p className="sync-label">System overview</p>
          </div>

          <section className="stat-grid">
            {statCards.map((card) => {
              const positive = !card.delta.startsWith('-');
              return (
                <article key={card.id} className={`metric-card ${card.tone}`}>
                  <div className="metric-header">
                    <button className="metric-link" type="button">
                      {card.label}
                    </button>
                    <div className="metric-actions">
                      <button
                        className="icon-chip info"
                        type="button"
                        title={card.description}
                        aria-label={`Info about ${card.label}`}
                      >
                        <FiInfo aria-hidden="true" />
                      </button>
                      <button
                        className="icon-chip"
                        type="button"
                        aria-label={`View full details for ${card.label}`}
                        onClick={() => openMetricDetails(card)}
                      >
                        <FiExternalLink aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="metric-value-row">
                    <span className="metric-value">{card.value}</span>
                    <span className={`metric-trend ${positive ? 'up' : 'down'}`}>
                      <FiArrowUpRight aria-hidden="true" />
                      {card.delta}
                    </span>
                  </div>
                  <p className="metric-caption">{card.helper}</p>
                </article>
              );
            })}
          </section>

          <section className="panel-row primary">
            <article className="panel large-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-title">Oxygen Purity vs Time</p>
                  <span>Current vs previous week</span>
                </div>
                <div className="panel-controls">
                  <div className="panel-tabs">
                    <button className="active">Oxygen Purity</button>
                    <button>Total Projects</button>
                    <button>Operating Status</button>
                  </div>
                  <div className="panel-actions">
                    <button
                      className="icon-chip info"
                      type="button"
                      title={detailPayloads.purity?.description}
                      aria-label="Info about Oxygen Purity vs Time"
                    >
                      <FiInfo aria-hidden="true" />
                    </button>
                    <button
                      className="icon-chip"
                      type="button"
                      aria-label="Open detailed Oxygen Purity data"
                      onClick={() => openChartDetails('purity')}
                    >
                      <FiExternalLink aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTimestamp}
                    tickLine={false}
                    axisLine={false}
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    labelFormatter={formatTimestamp}
                    contentStyle={{
                      background: '#0b1329',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#cbd5ff' }} />
                  <Line type="monotone" dataKey="purity" stroke="#7c6cfa" strokeWidth={3} dot={false} name="Purity %" />
                  <Line type="monotone" dataKey="flowRate" stroke="#2dd4bf" strokeWidth={2} dot={false} name="Flow rate" />
                  <Line type="monotone" dataKey="pressure" stroke="#f472b6" strokeWidth={2} dot={false} name="Pressure" />
                </LineChart>
              </ResponsiveContainer>
            </article>

            <article className="panel storage-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-title">Storage Level vs Time</p>
                  <span>Last month vs this month</span>
                </div>
                <div className="panel-controls">
                  <div className="panel-actions">
                    <button
                      className="icon-chip info"
                      type="button"
                      title={detailPayloads.storage?.description}
                      aria-label="Info about Storage Level vs Time"
                    >
                      <FiInfo aria-hidden="true" />
                    </button>
                    <button
                      className="icon-chip"
                      type="button"
                      aria-label="Open detailed storage data"
                      onClick={() => openChartDetails('storage')}
                    >
                      <FiExternalLink aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={storageLevels}>
                  <defs>
                    <linearGradient id="storagePrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="storageCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.5)" />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: '#0b1329',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#fff'
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5ff' }} />
                  <Area type="monotone" dataKey="lastMonth" stroke="#60a5fa" fill="url(#storagePrev)" name="Last Month" />
                  <Area type="monotone" dataKey="thisMonth" stroke="#a855f7" fill="url(#storageCurrent)" name="This Month" />
                </AreaChart>
              </ResponsiveContainer>
            </article>
          </section>

          <section className="panel-row">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="panel-title">Flow Rate vs Time</p>
                  <span>Live patient usage</span>
                </div>
                <div className="panel-controls">
                  <div className="panel-actions">
                    <button
                      className="icon-chip info"
                      type="button"
                      title={detailPayloads.flow?.description}
                      aria-label="Info about Flow Rate vs Time"
                    >
                      <FiInfo aria-hidden="true" />
                    </button>
                    <button
                      className="icon-chip"
                      type="button"
                      aria-label="Open detailed flow rate data"
                      onClick={() => openChartDetails('flow')}
                    >
                      <FiExternalLink aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTimestamp}
                    tickLine={false}
                    axisLine={false}
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    labelFormatter={formatTimestamp}
                    contentStyle={{
                      background: '#0b1329',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="flowRate" stroke="#fb7185" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="panel-title">Pressure vs Time</p>
                  <span>Distribution manifold</span>
                </div>
                <div className="panel-controls">
                  <div className="panel-actions">
                    <button
                      className="icon-chip info"
                      type="button"
                      title={detailPayloads.pressure?.description}
                      aria-label="Info about Pressure vs Time"
                    >
                      <FiInfo aria-hidden="true" />
                    </button>
                    <button
                      className="icon-chip"
                      type="button"
                      aria-label="Open detailed pressure data"
                      onClick={() => openChartDetails('pressure')}
                    >
                      <FiExternalLink aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTimestamp}
                    tickLine={false}
                    axisLine={false}
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    labelFormatter={formatTimestamp}
                    contentStyle={{
                      background: '#0b1329',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="pressure" stroke="#38bdf8" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </article>
          </section>
        </div>

        <aside className="right-rail">
          <section className="right-card">
            <h4>Alarm & Alert</h4>
            {alarms.length === 0 ? (
              <p className="empty-state">All systems stable.</p>
            ) : (
              <ul className="alarm-list">
                {alarms.map((alarm) => (
                  <li key={alarm.id}>
                    <div>
                      <p>{alarm.message}</p>
                      <span>{formatTimeAgo(alarm.timestamp)}</span>
                    </div>
                    <span className={`badge ${alarm.severity}`}>{alarm.severity}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {backup && (
            <section className="right-card">
              <h4>Backup Oxygen Status</h4>
              <div className="right-grid">
                <div>
                  <p>Mode</p>
                  <strong>{backup.mode.toUpperCase()}</strong>
                </div>
                <div>
                  <p>Level</p>
                  <strong>{backup.level.toFixed(1)}%</strong>
                </div>
                <div>
                  <p>Coverage</p>
                  <strong>{backup.remainingHours.toFixed(1)} h</strong>
                </div>
                <div>
                  <p>Last checked</p>
                  <strong>{formatTimeAgo(backup.lastChecked)}</strong>
                </div>
              </div>
            </section>
          )}

          {supplyDemand && (
            <section className="right-card demand">
              <h4>Demand vs Supply</h4>
              <div className="demand-row">
                <span>Current Demand</span>
                <strong>{supplyDemand.currentDemand} m³/h</strong>
              </div>
              <div className="demand-row">
                <span>Current Supply</span>
                <strong>{supplyDemand.currentSupply} m³/h</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${supplyFill}%` }}></div>
              </div>
              <p className={`status-note ${supplyIsHealthy ? 'healthy' : 'risk'}`}>
                {supplyDemand.status}
              </p>
              <p className="forecast-copy">{supplyDemand.forecast}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
      {detailView && (
        <div
          className="detail-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={closeDetails}
        >
          <div className="detail-modal" role="document" onClick={(event) => event.stopPropagation()}>
            <div className="detail-modal-header">
              <div>
                <p className="detail-modal-label">Detail preview</p>
                <h3>{detailView.title}</h3>
              </div>
              <button className="icon-chip" type="button" aria-label="Close detail" onClick={closeDetails}>
                <FiX aria-hidden="true" />
              </button>
            </div>
            {detailView.description && <p className="detail-description">{detailView.description}</p>}
            {detailView.meta && (
              <dl className="detail-meta-grid">
                {detailView.meta.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {detailView.dataset && detailView.dataset.length > 0 && (
              <div className="detail-data-preview">
                <p className="detail-modal-label">Recent data preview</p>
                <pre>{JSON.stringify(detailView.dataset, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
