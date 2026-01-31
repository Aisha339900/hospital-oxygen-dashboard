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
- **Frontend**: React, Recharts for data visualization, Axios for API calls
- **Backend**: Node.js, Express.js
- **Data**: Simulated real-time oxygen system data with predictions

## Project Structure

```
hospital-oxygen-dashboard/
├── backend/
│   └── server.js          # Express server with simulated data endpoints
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main dashboard component
│   │   ├── App.css        # Dashboard styles
│   │   └── index.js       # React entry point
│   └── package.json
├── package.json           # Root package.json for backend
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

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Start Backend Server:**
```bash
npm run dev
```
The backend server will start on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
npm run client
```
The React app will start on `http://localhost:3000`

#### Option 2: Production Build

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Start the backend:**
   ```bash
   npm start
   ```

## API Endpoints

The backend provides the following RESTful API endpoints:

- `GET /api/status` - Current system status and latest readings
- `GET /api/data` - Historical data for time-series charts (last 20 minutes)
- `GET /api/alarms` - Active alarms and alerts
- `GET /api/backup` - Backup oxygen system status
- `GET /api/predictions` - Predicted demand data (next 50 minutes)

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

### Modifying Thresholds
Edit the threshold logic in `backend/server.js`:
```javascript
status: latest.purity > 96 && latest.pressure > 48 ? 'optimal' : 'warning'
```

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
