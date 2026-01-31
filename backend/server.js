const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simulate oxygen system data
function generateSimulatedData() {
  const baseTime = Date.now();
  const dataPoints = [];
  
  for (let i = 0; i < 20; i++) {
    dataPoints.push({
      timestamp: baseTime - (19 - i) * 60000, // 1 minute intervals
      purity: 95 + Math.random() * 4, // 95-99%
      flowRate: 50 + Math.random() * 20, // 50-70 L/min
      pressure: 45 + Math.random() * 10, // 45-55 PSI
      demandCoverage: 85 + Math.random() * 14 // 85-99%
    });
  }
  
  return dataPoints;
}

// Generate alarms based on thresholds
function generateAlarms() {
  const alarms = [];
  const now = Date.now();
  
  // Simulate some random alarms
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
}

// Get current system status
app.get('/api/status', (req, res) => {
  const data = generateSimulatedData();
  const latest = data[data.length - 1];
  
  res.json({
    status: latest.purity > 96 && latest.pressure > 48 ? 'optimal' : 'warning',
    purity: latest.purity.toFixed(2),
    flowRate: latest.flowRate.toFixed(2),
    pressure: latest.pressure.toFixed(2),
    demandCoverage: latest.demandCoverage.toFixed(2),
    timestamp: latest.timestamp
  });
});

// Get historical data for charts
app.get('/api/data', (req, res) => {
  const data = generateSimulatedData();
  res.json(data);
});

// Get alarms
app.get('/api/alarms', (req, res) => {
  const alarms = generateAlarms();
  res.json(alarms);
});

// Get backup oxygen status
app.get('/api/backup', (req, res) => {
  const backupStatus = {
    mode: Math.random() > 0.5 ? 'standby' : 'active',
    level: 70 + Math.random() * 30, // 70-100%
    remainingHours: 24 + Math.random() * 24, // 24-48 hours
    lastChecked: Date.now() - 3600000
  };
  
  res.json(backupStatus);
});

// Get predicted data
app.get('/api/predictions', (req, res) => {
  const baseTime = Date.now();
  const predictions = [];
  
  for (let i = 1; i <= 10; i++) {
    predictions.push({
      timestamp: baseTime + i * 300000, // 5 minute intervals
      predictedDemand: 60 + Math.random() * 15,
      confidence: 0.85 + Math.random() * 0.1
    });
  }
  
  res.json(predictions);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
