# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start the Backend Server

Open a terminal and run:
```bash
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Start the Frontend

Open a **new terminal** and run:
```bash
npm run client
```

The dashboard will open automatically at `http://localhost:3000`

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

### Backend Won't Start
- Make sure port 5000 is not already in use
- Check that you ran `npm install` in the root directory

### Frontend Won't Start
- Make sure port 3000 is not already in use
- Check that you ran `npm install` in the frontend directory
- Ensure the backend is running first

### No Data Showing
- Verify the backend is running on port 5000
- Check browser console for error messages
- Make sure both servers started successfully

## Need Help?

Check the main [README.md](README.md) for detailed information about:
- Project structure
- API endpoints
- Customization options
- Future enhancements
