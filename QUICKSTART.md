# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
cd ..
```

### 2. Start the Dashboard

Open a terminal at the project root and run:
```bash
npm start
```

The React development server will open automatically at `http://localhost:3000`.

### 3. Explore the Simulation

The dashboard continuously generates simulated telemetry in the browser—no backend required. Leave the tab open to watch metrics, alarms, and predictions refresh every 5 seconds.

## What You'll See

- **Left Sidebar**: Navigation menu with Dashboard, Analytics, Alarms, Settings, and Reports
- **Top Header**: System status (Optimal/Warning/Critical) and active alarm count
- **Main Area**: 
  - 4 KPI cards showing real-time oxygen metrics
  - Time-series charts for historical and predicted data
- **Right Panel**: 
  - Active alarms with color-coded severity
  - Backup oxygen system status

## Dashboard Features

### Real-Time Monitoring
The dashboard automatically refreshes every 5 seconds to show:
- Oxygen Purity (95-99%)
- Flow Rate (50-70 L/min)
- Pressure (45-55 PSI)
- Demand Coverage (85-99%)

### Alarm System
- 🔴 **Critical**: Immediate attention required
- 🟡 **Warning**: Monitor situation closely
- 🔵 **Info**: General information

### Backup System
Monitor your backup oxygen supply:
- Mode (Standby/Active)
- Current level percentage
- Estimated remaining hours
- Last checked timestamp

## Troubleshooting

### Dashboard Won't Start
- Make sure port 3000 is free or allow the prompt to pick another port
- Double-check that you ran `npm install` inside `frontend/`

### No Data Showing
- Wait a few seconds—the simulator updates every 5 seconds
- Check the browser console for errors (e.g., ad blockers interfering with localhost)
- Restart `npm start` if the page stopped updating

## Need Help?

Check the main [README.md](README.md) for detailed information about:
- Project structure
- API endpoints
- Customization options
- Future enhancements
