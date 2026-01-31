import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiActivity, FiBarChart2, FiTrendingUp, FiBell, FiSettings, FiFileText, FiArrowUpRight } from 'react-icons/fi';
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

function App() {
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [backup, setBackup] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    try {
      const simulatedData = generateSimulatedData();
      setData(simulatedData);
      setStatus(createStatusSnapshot(simulatedData));
      setAlarms(generateAlarms());
      setBackup(generateBackupStatus());
      setPredictions(generatePredictions());
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

        {/* Time Series Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Oxygen Metrics - Real-time Monitoring</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTimestamp}
                style={{ fontSize: '0.85rem' }}
              />
              <YAxis style={{ fontSize: '0.85rem' }} />
              <Tooltip 
                labelFormatter={formatTimestamp}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="purity" stroke="#28a745" name="Purity (%)" strokeWidth={2} />
              <Line type="monotone" dataKey="flowRate" stroke="#007bff" name="Flow Rate (L/min)" strokeWidth={2} />
              <Line type="monotone" dataKey="pressure" stroke="#ffc107" name="Pressure (PSI)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Demand Coverage Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Demand Coverage Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTimestamp}
                style={{ fontSize: '0.85rem' }}
              />
              <YAxis style={{ fontSize: '0.85rem' }} />
              <Tooltip 
                labelFormatter={formatTimestamp}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="demandCoverage" stroke="#17a2b8" name="Coverage (%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Predictions Chart */}
        {predictions.length > 0 && (
          <div className="chart-container">
            <h3 className="chart-title">Predicted Demand (Next 50 minutes)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTimestamp}
                  style={{ fontSize: '0.85rem' }}
                />
                <YAxis style={{ fontSize: '0.85rem' }} />
                <Tooltip 
                  labelFormatter={formatTimestamp}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="predictedDemand" stroke="#6610f2" name="Predicted Demand (L/min)" strokeWidth={2} strokeDasharray="5 5" />
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
      </aside>
    </div>
  );
}

export default App;
