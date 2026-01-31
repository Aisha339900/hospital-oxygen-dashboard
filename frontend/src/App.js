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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FiActivity, FiBarChart2, FiTrendingUp, FiBell, FiSettings, FiFileText, FiArrowUpRight } from 'react-icons/fi';
import './App.css';

const PIE_COLORS = ['#4c6ef5', '#63e6be', '#ffd43b', '#ff6b6b'];

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
    return { status: 'warning', purity: '0.00', flowRate: '0.00', pressure: '0.00', demandCoverage: '0.00', timestamp: now };
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

const generatePredictions = () => {
  const baseTime = Date.now();
  return Array.from({ length: 10 }, (_, index) => ({
    timestamp: baseTime + (index + 1) * 300000,
    predictedDemand: 60 + Math.random() * 15,
    confidence: 0.85 + Math.random() * 0.1
  }));
};

const generateStorageLevels = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  return days.map((day, index) => ({
    day,
    isToday: index === todayIndex,
    level: 30 + Math.random() * 60
  }));
};

const generateFlowBreakdown = () => {
  const labels = ['ICU', 'ER', 'Surgery', 'Wards', 'Lab'];
  return labels.map((label) => ({
    department: label,
    value: 8 + Math.random() * 12
  }));
};

const generatePressureBreakdown = () => {
  return [
    { name: 'Primary Tanks', value: 38 + Math.random() * 8 },
    { name: 'Manifold', value: 20 + Math.random() * 6 },
    { name: 'Pipelines', value: 25 + Math.random() * 6 },
    { name: 'Other', value: 10 + Math.random() * 5 }
  ];
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
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageLevels, setStorageLevels] = useState([]);
  const [flowBreakdown, setFlowBreakdown] = useState([]);
  const [pressureBreakdown, setPressureBreakdown] = useState([]);
  const [supplyDemand, setSupplyDemand] = useState(null);

  const fetchData = useCallback(() => {
    try {
      const simulatedData = generateSimulatedData();
      setData(simulatedData);
      setStatus(createStatusSnapshot(simulatedData));
      setAlarms(generateAlarms());
      setBackup(generateBackupStatus());
      setPredictions(generatePredictions());
      setStorageLevels(generateStorageLevels());
      setFlowBreakdown(generateFlowBreakdown());
      setPressureBreakdown(generatePressureBreakdown());
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

  const unacknowledgedAlarms = alarms.filter(a => !a.acknowledged).length;
  const lastUpdated = formatTimestamp(status.timestamp);
  const supplyIsHealthy = supplyDemand && parseFloat(supplyDemand.currentSupply) >= parseFloat(supplyDemand.currentDemand);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>
          <FiActivity className="brand-icon" aria-hidden="true" />
          O₂ Monitor
        </h2>
        <nav>
          <ul className="nav-menu">
            <li>
              <a href="#dashboard" className="active">
                <span className="nav-icon" aria-hidden="true">
                  <FiBarChart2 />
                </span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="#analytics">
                <span className="nav-icon" aria-hidden="true">
                  <FiTrendingUp />
                </span>
                Analytics
              </a>
            </li>
            <li>
              <a href="#alarms">
                <span className="nav-icon" aria-hidden="true">
                  <FiBell />
                </span>
                Alarms
              </a>
            </li>
            <li>
              <a href="#settings">
                <span className="nav-icon" aria-hidden="true">
                  <FiSettings />
                </span>
                Settings
              </a>
            </li>
            <li>
              <a href="#reports">
                <span className="nav-icon" aria-hidden="true">
                  <FiFileText />
                </span>
                Reports
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Header */}
      <header className="header">
        <div className="system-status">
          <div className={`status-indicator ${status.status}`}>
            <span className={`status-dot ${status.status}`}></span>
            System {status.status === 'optimal' ? 'Optimal' : status.status === 'warning' ? 'Warning' : 'Critical'}
          </div>
        </div>
        <div className="alarm-count">
          <FiBell aria-hidden="true" />
          {unacknowledgedAlarms} Active Alarms
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="status-strip">
          <div className="status-pill warning">Warning</div>
          <div className="status-pill neutral">Alarms: {unacknowledgedAlarms}</div>
          <div className="status-pill neutral">Last Update: {lastUpdated}</div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Oxygen Purity</div>
            <div className="kpi-value">
              {status.purity}
              <span className="kpi-unit">%</span>
            </div>
            <div className="kpi-trend up">
              <FiArrowUpRight className="trend-icon" aria-hidden="true" />
              Optimal range
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Flow Rate</div>
            <div className="kpi-value">
              {status.flowRate}
              <span className="kpi-unit">L/min</span>
            </div>
            <div className="kpi-trend up">
              <FiArrowUpRight className="trend-icon" aria-hidden="true" />
              Normal
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Pressure</div>
            <div className="kpi-value">
              {status.pressure}
              <span className="kpi-unit">PSI</span>
            </div>
            <div className="kpi-trend up">
              <FiArrowUpRight className="trend-icon" aria-hidden="true" />
              Stable
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Demand Coverage</div>
            <div className="kpi-value">
              {status.demandCoverage}
              <span className="kpi-unit">%</span>
            </div>
            <div className="kpi-trend up">
              <FiArrowUpRight className="trend-icon" aria-hidden="true" />
              Sufficient
            </div>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-card large">
            <div className="chart-header">
              <div>
                <p className="chart-label">Oxygen Purity vs Time</p>
                <span className="chart-subtitle">Current week vs previous week</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTimestamp}
                  style={{ fontSize: '0.8rem' }}
                  tickLine={false}
                />
                <YAxis style={{ fontSize: '0.8rem' }} tickLine={false} axisLine={false} />
                <Tooltip labelFormatter={formatTimestamp} contentStyle={{ borderRadius: '8px', borderColor: '#e9ecef' }} />
                <Legend />
                <Line type="monotone" dataKey="purity" stroke="#51cf66" name="Purity (%)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="flowRate" stroke="#339af0" name="Flow Rate" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="pressure" stroke="#ffa94d" name="Pressure" strokeWidth={2} dot={false} opacity={0.7} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card storage-card">
            <div className="chart-header">
              <div>
                <p className="chart-label">Storage Level vs Time</p>
                <span className="chart-subtitle">Weekly snapshot</span>
              </div>
            </div>
            <ul className="storage-list">
              {storageLevels.map((item) => (
                <li key={item.day} className={`storage-item ${item.isToday ? 'active' : ''}`}>
                  <span>{item.day}</span>
                  <div className="storage-bar">
                    <div className="storage-bar-fill" style={{ width: `${item.level}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <p className="chart-label">Flow Rate vs Time</p>
                <span className="chart-subtitle">Departmental distribution</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={flowBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                <XAxis dataKey="department" tickLine={false} axisLine={false} style={{ fontSize: '0.8rem' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '0.8rem' }} />
                <Tooltip cursor={{ fill: 'rgba(76, 110, 245, 0.1)' }} />
                <Bar dataKey="value" fill="#748ffc" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <p className="chart-label">Pressure vs Time</p>
                <span className="chart-subtitle">Asset contribution</span>
              </div>
            </div>
            <div className="pie-wrapper">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pressureBreakdown} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                    {pressureBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="pie-legend">
                {pressureBreakdown.map((entry, index) => (
                  <li key={entry.name}>
                    <span className="legend-dot" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                    {entry.name}
                    <strong>{entry.value.toFixed(1)}%</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Predictions Chart */}
        {predictions.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <p className="chart-label">Predicted Demand (Next 50 minutes)</p>
                <span className="chart-subtitle">5-minute intervals</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} style={{ fontSize: '0.8rem' }} tickLine={false} />
                <YAxis style={{ fontSize: '0.8rem' }} tickLine={false} axisLine={false} />
                <Tooltip labelFormatter={formatTimestamp} />
                <Line type="monotone" dataKey="predictedDemand" stroke="#845ef7" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>

      {/* Right Panel */}
      <aside className="right-panel">
        {/* Alarms Section */}
        <div className="panel-section">
          <h3 className="panel-title">Active Alarms & Alerts</h3>
          {alarms.length === 0 ? (
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>No active alarms</p>
          ) : (
            <ul className="alarm-list">
              {alarms.map((alarm) => (
                <li key={alarm.id} className={`alarm-item ${alarm.severity}`}>
                  <div className="alarm-severity" style={{
                    color: alarm.severity === 'critical' ? '#dc3545' : 
                           alarm.severity === 'warning' ? '#ffc107' : '#17a2b8'
                  }}>
                    {alarm.severity}
                  </div>
                  <div className="alarm-message">{alarm.message}</div>
                  <div className="alarm-time">{formatTimeAgo(alarm.timestamp)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Backup Oxygen Status */}
        {backup && (
          <div className="panel-section">
            <h3 className="panel-title">Backup Oxygen Status</h3>
            <div className="backup-info">
              <div className="backup-item">
                <span className="backup-label">Mode</span>
                <span className={`backup-mode ${backup.mode}`}>
                  {backup.mode.toUpperCase()}
                </span>
              </div>
              <div className="backup-item">
                <span className="backup-label">Level</span>
                <span className="backup-level">{backup.level.toFixed(1)}%</span>
              </div>
              <div className="backup-item">
                <span className="backup-label">Remaining</span>
                <span className="backup-value">{backup.remainingHours.toFixed(1)} hrs</span>
              </div>
              <div className="backup-item">
                <span className="backup-label">Last Checked</span>
                <span className="backup-value">{formatTimeAgo(backup.lastChecked)}</span>
              </div>
            </div>
          </div>
        )}

        {supplyDemand && (
          <div className="panel-section">
            <h3 className="panel-title">Demand vs Supply</h3>
            <div className="supply-demand">
              <div className="supply-row">
                <span>Current Demand</span>
                <strong>{supplyDemand.currentDemand} m³/h</strong>
              </div>
              <div className="supply-row">
                <span>Current Supply</span>
                <strong>{supplyDemand.currentSupply} m³/h</strong>
              </div>
              <div className={`supply-status ${supplyIsHealthy ? 'good' : 'bad'}`}>
                Status: {supplyDemand.status}
              </div>
              <p className="supply-forecast">Forecast: {supplyDemand.forecast}</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default App;
