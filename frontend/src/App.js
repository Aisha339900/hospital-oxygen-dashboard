import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [backup, setBackup] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, dataRes, alarmsRes, backupRes, predictionsRes] = await Promise.all([
        axios.get(`${API_BASE}/status`),
        axios.get(`${API_BASE}/data`),
        axios.get(`${API_BASE}/alarms`),
        axios.get(`${API_BASE}/backup`),
        axios.get(`${API_BASE}/predictions`)
      ]);

      setStatus(statusRes.data);
      setData(dataRes.data);
      setAlarms(alarmsRes.data);
      setBackup(backupRes.data);
      setPredictions(predictionsRes.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data from server');
      setLoading(false);
    }
  };

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
        <h2>🏥 O₂ Monitor</h2>
        <nav>
          <ul className="nav-menu">
            <li>
              <a href="#dashboard" className="active">
                <span className="nav-icon">📊</span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="#analytics">
                <span className="nav-icon">📈</span>
                Analytics
              </a>
            </li>
            <li>
              <a href="#alarms">
                <span className="nav-icon">🔔</span>
                Alarms
              </a>
            </li>
            <li>
              <a href="#settings">
                <span className="nav-icon">⚙️</span>
                Settings
              </a>
            </li>
            <li>
              <a href="#reports">
                <span className="nav-icon">📄</span>
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
          🔔 {unacknowledgedAlarms} Active Alarms
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
            <div className="kpi-trend up">↑ Optimal range</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Flow Rate</div>
            <div className="kpi-value">
              {status.flowRate}
              <span className="kpi-unit">L/min</span>
            </div>
            <div className="kpi-trend up">↑ Normal</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Pressure</div>
            <div className="kpi-value">
              {status.pressure}
              <span className="kpi-unit">PSI</span>
            </div>
            <div className="kpi-trend up">↑ Stable</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Demand Coverage</div>
            <div className="kpi-value">
              {status.demandCoverage}
              <span className="kpi-unit">%</span>
            </div>
            <div className="kpi-trend up">↑ Sufficient</div>
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
