# Hospital Oxygen Dashboard

A responsive monitoring dashboard for a Senior Design hospital oxygen supply system that visualizes predicted hospital oxygen system data, implements alarm logic, and supports monitoring, decision-making, and data logging for a simulation-based oxygen supply system.

## Features

### Dashboard Layout
- **Left Sidebar Navigation**: Quick access to Dashboard, Analytics, Alarms, Settings, and Reports
- **Top Header**: Real-time system status indicator and active alarm count
- **Central Main Area**: 
  - KPI cards displaying oxygen purity, flow rate, pressure, and demand coverage
  - Time-series charts for real-time monitoring
  - Predictive demand visualization
- **Right Panel**: 
  - Active alarms and alerts with severity levels
  - Backup oxygen status (mode, level, remaining hours)

### Key Metrics Monitored
- **Oxygen Purity** (95-99%)
- **Flow Rate** (50-70 L/min)
- **Pressure** (45-55 PSI)
- **Demand Coverage** (85-99%)

### Technologies
- **Frontend**: React and Recharts for rich visualization components
- **Data**: Client-side simulated real-time oxygen system metrics with predictions (no backend yet)

## Project Structure

```
hospital-oxygen-dashboard/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main dashboard component + simulation logic
│   │   ├── App.css        # Dashboard styles
│   │   └── index.js       # React entry point
│   └── package.json
├── package.json           # Helper scripts that proxy to the frontend app
└── README.md
```

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aisha339900/hospital-oxygen-dashboard.git
   cd hospital-oxygen-dashboard
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Dashboard

Run everything from the project root (the script proxies into the `frontend/` folder):

```bash
npm start
```

This launches the React development server on `http://localhost:3000` and continuously regenerates simulated telemetry inside the browser. For a production build, run:

```bash
npm run build
```
which builds the frontend assets in `frontend/build`.

## Data Simulation

All telemetry, alarms, backup information, and predictions are generated on interval by helper functions inside [frontend/src/App.js](frontend/src/App.js). This keeps the UI interactive while the backend is on hold. When you are ready to connect real APIs, replace the simulation helpers with network calls.

## Features in Detail

### Real-time Monitoring
- Dashboard auto-refreshes every 5 seconds
- Live KPI cards with current values
- Animated status indicators

### Alarm System
- Three severity levels: Critical, Warning, Info
- Visual color coding for quick identification
- Timestamp tracking for each alarm

### Backup System Monitoring
- Real-time backup oxygen level
- Operating mode (Standby/Active)
- Remaining hours calculation
- Last check timestamp

### Responsive Design
- Optimized for desktop (1920x1080)
- Tablet-friendly layout (768px+)
- Mobile-responsive (320px+)

## Customization

### Adjusting Update Frequency
Edit line in `frontend/src/App.js`:
```javascript
const interval = setInterval(fetchData, 5000); // Change 5000 to desired milliseconds
```

### Tuning Status Thresholds
Edit the threshold logic in `createStatusSnapshot` within [frontend/src/App.js](frontend/src/App.js):
```javascript
status: latest.purity > 96 && latest.pressure > 48 ? 'optimal' : 'warning'
```

### Adjusting Simulation Ranges
Customize the generated telemetry by editing `generateSimulatedData` in [frontend/src/App.js](frontend/src/App.js).

### Styling
Customize colors and layouts in `frontend/src/App.css`

## Future Enhancements

- User authentication and role-based access
- Data logging to database
- Historical data analysis
- Alert notification system (email/SMS)
- Export reports functionality
- Integration with real IoT sensors
- Advanced predictive analytics with ML models

## License

ISC

## Contributors

Senior Design Project Team
