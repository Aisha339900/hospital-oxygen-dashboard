# Hospital Oxygen Dashboard Functional Testing Package

## 1. Functional Test Plan

### 1.1 Test Objective

The objective of this functional test is to verify that the hospital oxygen dashboard prototype correctly acquires, processes, displays, and reports supervisory oxygen system data, and that alarm conditions are generated and presented correctly under defined operating scenarios.

### 1.2 Scope

This test package covers the core functional behavior of the prototype frontend, backend API, alarm logic, dashboard presentation layer, and basic privacy safeguards.

### 1.3 Items to Be Tested

- Dashboard page loading and general UI availability
- Page title and primary dashboard labels
- KPI card visibility and displayed values
- Correct rendering of oxygen purity, flow rate, delivery pressure, storage level, demand coverage, backup coverage, and alarms
- Alarm generation for low purity, high pressure, low demand coverage, and low backup coverage
- Simultaneous alarm handling
- Alarm clearing when values return to normal
- Alarm log/history creation and retrieval
- Trend chart rendering
- Empty state, loading state, and API failure handling
- Unit display consistency
- Demand versus supply display logic
- Data privacy behavior, specifically absence of patient-identifying data

### 1.4 Items Not Tested

- Real-time control of physical oxygen equipment
- Sensor hardware calibration accuracy
- Cybersecurity penetration testing
- Performance, stress, and load testing
- Formal regulatory certification evidence
- User training effectiveness and operational acceptance

### 1.5 Test Environment

| Item | Description |
|------|-------------|
| Frontend | React dashboard running in development or test environment |
| Backend | Node.js / Express API |
| Database | MongoDB instance with test data |
| API base path | `/api` |
| Example local backend URL | `http://localhost:5050` |
| Browser | Chrome or equivalent modern browser |
| Test tools | Jest, React Testing Library, Supertest |
| Test data source | Mock JSON payloads and seeded database records |

### 1.6 Entry Criteria

- Frontend application builds and starts successfully
- Backend API starts successfully
- MongoDB connection is available
- Required routes are accessible
- Mock data or seed data is prepared
- Alarm thresholds are agreed as follows:
  - low purity alarm if oxygen purity `< 93`
  - high pressure alarm if delivery pressure `> 6 bar`
  - low demand coverage alarm if demand coverage `< 95%`
  - backup warning if backup coverage `< 6 hours`

### 1.7 Exit Criteria

- All planned high-priority functional test cases have been executed
- Critical functional defects have been resolved or formally recorded
- Dashboard core views operate without blocking errors
- Alarm behavior matches specified thresholds
- No patient-identifying data is exposed in tested API responses or dashboard views
- Test results are documented with pass/fail status

### 1.8 Test Approach

Functional testing shall be performed using a combination of:

- Manual black-box testing for UI presentation, workflow behavior, charts, and operator-visible alarm responses
- Automated frontend unit/component tests using Jest and React Testing Library
- Automated backend API tests using Jest and Supertest
- JSON mock-data driven testing for normal, abnormal, and edge-case conditions
- Boundary-value testing around alarm thresholds

### 1.9 Pass/Fail Criteria

- A test case is marked `Pass` when the actual result matches the expected result with no functional deviation
- A test case is marked `Fail` when the expected result is not achieved, an incorrect value is displayed, an alarm behaves incorrectly, or an unsafe/error state is not handled properly
- Minor formatting differences that do not affect function may be recorded as observations rather than failures

## 2. Functional Test-Case Table

Fill the `Actual Result` and `Pass/Fail` columns during execution.

| Test ID | Feature | Input / Test Condition | Expected Result | Actual Result | Pass/Fail |
|------|------|------|------|------|------|
| FT-01 | Dashboard load | Open dashboard with backend and database available | Dashboard loads without blank screen or crash |  |  |
| FT-02 | Page title | Open dashboard home page | Correct application/page title is displayed |  |  |
| FT-03 | KPI card visibility | Load dashboard with valid system data | KPI cards are visible for key monitored values |  |  |
| FT-04 | KPI value rendering | Provide valid input data for purity, flow, pressure, storage, demand, and backup | KPI cards show values matching the provided data |  |  |
| FT-05 | Low purity alarm | Oxygen purity = 92.0% | Low purity alarm is displayed |  |  |
| FT-06 | No low purity alarm at threshold | Oxygen purity = 93.0% | No low purity alarm is displayed |  |  |
| FT-07 | No low purity alarm above threshold | Oxygen purity = 95.0% | No low purity alarm is displayed |  |  |
| FT-08 | High pressure alarm | Delivery pressure = 6.3 bar | High pressure alarm is displayed |  |  |
| FT-09 | No high pressure alarm at threshold | Delivery pressure = 6.0 bar | No high pressure alarm is displayed |  |  |
| FT-10 | No high pressure alarm below threshold | Delivery pressure = 5.8 bar | No high pressure alarm is displayed |  |  |
| FT-11 | Low demand coverage alarm | Demand coverage = 92% | Low demand coverage alarm is displayed |  |  |
| FT-12 | No low demand coverage alarm at threshold | Demand coverage = 95% | No low demand coverage alarm is displayed |  |  |
| FT-13 | Backup warning | Backup coverage = 5.0 hours | Backup warning is displayed |  |  |
| FT-14 | No backup warning at threshold | Backup coverage = 6.0 hours | No backup warning is displayed |  |  |
| FT-15 | Trend charts render | Valid trend dataset returned from backend | Trend charts render correctly with visible series and axes |  |  |
| FT-16 | Alarm log creation | Trigger any alarm condition, then inspect alarm log/API | Alarm log entry is created and visible through the relevant endpoint or UI log area |  |  |
| FT-17 | Multiple simultaneous alarms | Purity 91%, pressure 6.5 bar, demand coverage 90%, backup 4 hours | Multiple active alarms appear together without overwriting each other |  |  |
| FT-18 | Empty data handling | API returns empty dataset | Dashboard shows safe empty state with no crash |  |  |
| FT-19 | API failure handling | Backend returns 500 or network error | Dashboard shows error state/message safely |  |  |
| FT-20 | Privacy protection | Review API payloads and dashboard fields | No patient-identifying data is displayed or stored |  |  |
| FT-21 | Alarm clearing | Start with low purity alarm, then restore purity to 95% | Alarm clears or is marked resolved when value returns to normal |  |  |
| FT-22 | Purity boundary check | Test purity values 92.9, 93.0, 93.1 | Alarm appears only below 93.0 |  |  |
| FT-23 | Pressure boundary check | Test pressure values 5.9, 6.0, 6.1 bar | Alarm appears only above 6.0 bar |  |  |
| FT-24 | Demand coverage boundary check | Test coverage values 94.9, 95.0, 95.1 | Alarm appears only below 95.0% |  |  |
| FT-25 | Backup boundary check | Test backup values 5.9, 6.0, 6.1 hours | Warning appears only below 6.0 hours |  |  |
| FT-26 | Dashboard refresh behavior | New backend data arrives or manual refresh is triggered | Dashboard updates values without layout failure or stale alarm mismatch |  |  |
| FT-27 | Unit display | Load valid values into KPI cards | Units display correctly as `%`, `bar`, `m³/h`, and `hours` |  |  |
| FT-28 | Demand vs supply display | Provide supply and demand data with non-equal values | Dashboard displays demand and supply values clearly and consistently |  |  |
| FT-29 | Storage level warning | Storage level or backup reserve falls below warning threshold | Storage/backup warning is displayed |  |  |
| FT-30 | Alarm history retrieval | Request alarm history or prior alarm records | Historical alarm records can be retrieved and displayed in correct order |  |  |
| FT-31 | Loading state | Delay API response during dashboard load | Loading indicator or placeholder is shown |  |  |
| FT-32 | Partial data handling | Return some KPIs but omit one or more fields | Dashboard remains stable and missing fields are handled safely |  |  |
| FT-33 | Invalid numeric data | Return null, undefined, or non-numeric KPI value | Dashboard avoids crash and handles invalid values safely |  |  |
| FT-34 | Alarm acknowledgement/resolution display | Mark an alarm as acknowledged or resolved | Status is updated correctly in API response and UI/log view |  |  |
| FT-35 | Privacy in API response | Inspect `/api/system-health/latest` and `/api/alarms/active` response fields | Response contains only operational system data, not patient data |  |  |
| FT-36 | Compliance-oriented logging review | Review test logs, report exports, and alarm payloads | Logs and exports remain limited to technical/system information only |  |  |

## 3. Mock Data

### 3.1 Normal Case

```json
{
  "systemHealth": {
    "timestamp": "2026-04-16T10:00:00.000Z",
    "logging_status": "running",
    "dashboard_status": "online",
    "oxygen_purity_percent": 95.4,
    "flow_rate_m3h": 102.5,
    "delivery_pressure_bar": 5.6,
    "storage_level_percent": 68,
    "demand_coverage_percent": 98,
    "backup_coverage_hours": 10.5,
    "notes": "Normal operating condition"
  },
  "alarms": []
}
```

### 3.2 Low Purity Case

```json
{
  "systemHealth": {
    "timestamp": "2026-04-16T10:05:00.000Z",
    "logging_status": "running",
    "dashboard_status": "online",
    "oxygen_purity_percent": 92.1,
    "flow_rate_m3h": 101.2,
    "delivery_pressure_bar": 5.5,
    "storage_level_percent": 66,
    "demand_coverage_percent": 97,
    "backup_coverage_hours": 9.8
  },
  "alarms": [
    {
      "alarm_type": "low_oxygen_purity",
      "severity": "medium",
      "status": "active",
      "message": "Oxygen purity low (92.1%)."
    }
  ]
}
```

### 3.3 High Pressure Case

```json
{
  "systemHealth": {
    "timestamp": "2026-04-16T10:10:00.000Z",
    "logging_status": "running",
    "dashboard_status": "online",
    "oxygen_purity_percent": 95.0,
    "flow_rate_m3h": 100.0,
    "delivery_pressure_bar": 6.4,
    "storage_level_percent": 67,
    "demand_coverage_percent": 98,
    "backup_coverage_hours": 10.0
  },
  "alarms": [
    {
      "alarm_type": "high_pressure",
      "severity": "medium",
      "status": "active",
      "message": "Discharge pressure high (6.4 bar)."
    }
  ]
}
```

### 3.4 Low Demand Coverage Case

```json
{
  "systemHealth": {
    "timestamp": "2026-04-16T10:15:00.000Z",
    "logging_status": "running",
    "dashboard_status": "online",
    "oxygen_purity_percent": 95.2,
    "flow_rate_m3h": 88.0,
    "delivery_pressure_bar": 5.6,
    "storage_level_percent": 64,
    "demand_coverage_percent": 92,
    "backup_coverage_hours": 8.4
  },
  "alarms": [
    {
      "alarm_type": "low_demand_coverage",
      "severity": "medium",
      "status": "active",
      "message": "Demand coverage below required threshold (92%)."
    }
  ]
}
```

### 3.5 Low Backup Case

```json
{
  "systemHealth": {
    "timestamp": "2026-04-16T10:20:00.000Z",
    "logging_status": "running",
    "dashboard_status": "online",
    "oxygen_purity_percent": 95.1,
    "flow_rate_m3h": 99.3,
    "delivery_pressure_bar": 5.7,
    "storage_level_percent": 33,
    "demand_coverage_percent": 97,
    "backup_coverage_hours": 4.5
  },
  "alarms": [
    {
      "alarm_type": "backup_active",
      "severity": "medium",
      "status": "active",
      "message": "Backup coverage low (4.5 hours remaining)."
    }
  ]
}
```

### 3.6 Multiple Simultaneous Alarm Case

```json
{
  "systemHealth": {
    "timestamp": "2026-04-16T10:25:00.000Z",
    "logging_status": "running",
    "dashboard_status": "online",
    "oxygen_purity_percent": 91.8,
    "flow_rate_m3h": 82.0,
    "delivery_pressure_bar": 6.5,
    "storage_level_percent": 25,
    "demand_coverage_percent": 90,
    "backup_coverage_hours": 3.8
  },
  "alarms": [
    {
      "alarm_type": "low_oxygen_purity",
      "severity": "medium",
      "status": "active",
      "message": "Oxygen purity low (91.8%)."
    },
    {
      "alarm_type": "high_pressure",
      "severity": "medium",
      "status": "active",
      "message": "Discharge pressure high (6.5 bar)."
    },
    {
      "alarm_type": "low_demand_coverage",
      "severity": "medium",
      "status": "active",
      "message": "Demand coverage below required threshold (90%)."
    },
    {
      "alarm_type": "backup_active",
      "severity": "medium",
      "status": "active",
      "message": "Backup coverage low (3.8 hours remaining)."
    }
  ]
}
```

## 4. Frontend Jest + React Testing Library Tests

The current frontend already contains alarm-logic tests. The examples below are practical Jest/RTL additions for component and data-state behavior.

### 4.1 Dashboard Rendering Test

```jsx
import { render, screen } from "@testing-library/react";
import DashboardPage from "../pages/DashboardPage";

const baseProps = {
  statCards: [
    { label: "Oxygen Purity", value: "95.4%", helper: "Within normal range", tone: "good" },
    { label: "Delivery Pressure", value: "5.6 bar", helper: "Stable", tone: "good" }
  ],
  detailPayloads: {
    oxygenProductFlowVsFeedFlow: {},
    oxygenPurityVsFeedFlow: {}
  },
  openMetricDetails: jest.fn(),
  openChartDetails: jest.fn(),
  trendData: [
    { timestamp: 1, oxygenPurity: 95.2, flowRate: 100 },
    { timestamp: 2, oxygenPurity: 95.4, flowRate: 102 }
  ],
  alarms: [],
  formatTimeAgo: () => "just now",
  backup: { remainingLiters: 10000, utilization: 35 },
  supplyDemand: { supply: { coveragePercent: 98 }, demand: { requiredFlow: 95 } },
  supplyFill: 98,
  supplyIsHealthy: true,
  alarmPanelPulse: false,
  backupPanelPulse: false,
  demandPanelPulse: false,
  unacknowledgedAlarms: 0,
  streamOptions: [{ id: "main", label: "Main Stream" }],
  activeStream: "main",
  onStreamChange: jest.fn(),
  currentStreamLabel: "Main Stream",
  currentStreamProcess: null,
  trendChartConfig: {},
  isDarkMode: false,
  onToggleTheme: jest.fn(),
  onOpenSimulationEntry: jest.fn(),
  buildReportSnapshot: jest.fn(),
  reportUserEmail: "tester@example.com",
  reportCanEmail: true,
  dashboardTestModeEnabled: false,
  onDashboardTestModeToggle: jest.fn(),
  dashboardTestInputs: {},
  onDashboardTestInputChange: jest.fn()
};

describe("DashboardPage", () => {
  test("renders dashboard content and KPI cards", () => {
    render(<DashboardPage {...baseProps} />);

    expect(screen.getByText(/oxygen purity/i)).toBeInTheDocument();
    expect(screen.getByText(/delivery pressure/i)).toBeInTheDocument();
    expect(screen.getByText(/alarm & alert/i)).toBeInTheDocument();
  });
});
```

### 4.2 KPI Card Value Rendering Test

```jsx
import { render, screen } from "@testing-library/react";
import StatCard from "../components/dashboard/StatCard";

describe("StatCard", () => {
  test("renders KPI label, value, and unit correctly", () => {
    render(
      <StatCard
        card={{
          label: "Oxygen Purity",
          value: "95.4%",
          helper: "Within specification",
          tone: "good"
        }}
        openMetricDetails={jest.fn()}
      />,
    );

    expect(screen.getByText("Oxygen Purity")).toBeInTheDocument();
    expect(screen.getByText("95.4%")).toBeInTheDocument();
    expect(screen.getByText(/within specification/i)).toBeInTheDocument();
  });
});
```

### 4.3 Low Purity Alarm Test

```jsx
import { generateAlarmPanelData } from "../utils/alarmLogic";

describe("alarm logic", () => {
  test("triggers low purity alarm when oxygen purity is below 93%", () => {
    const alarms = generateAlarmPanelData({
      latestPoint: {
        purity: 92.0,
        flowRate: 100,
        pressureBar: 5.5,
        specificEnergy: 0.68
      },
      supplyDemand: { supply: { coveragePercent: 98 } },
      backupData: { remainingLiters: 10000, utilization: 35 }
    });

    expect(alarms.some((alarm) => /purity low/i.test(alarm.message))).toBe(true);
  });
});
```

### 4.4 High Pressure Alarm Test

```jsx
import { generateAlarmPanelData } from "../utils/alarmLogic";

describe("alarm logic", () => {
  test("triggers high pressure alarm when pressure is above 6 bar", () => {
    const alarms = generateAlarmPanelData({
      latestPoint: {
        purity: 95.0,
        flowRate: 100,
        pressureBar: 6.2,
        specificEnergy: 0.68
      },
      supplyDemand: { supply: { coveragePercent: 98 } },
      backupData: { remainingLiters: 10000, utilization: 35 }
    });

    expect(alarms.some((alarm) => /pressure high/i.test(alarm.message))).toBe(true);
  });
});
```

### 4.5 Backup Warning Test

```jsx
import { render, screen } from "@testing-library/react";
import AlertsPanel from "../components/rightRail/AlertsPanel";

describe("AlertsPanel", () => {
  test("renders backup warning message when warning alarm exists", () => {
    render(
      <AlertsPanel
        alarms={[
          {
            id: "1",
            severity: "warning",
            timestamp: Date.now(),
            message: "Backup coverage low (4.5 hours remaining)."
          }
        ]}
        formatTimeAgo={() => "1 min ago"}
        alarmPanelPulse={false}
      />,
    );

    expect(screen.getByText(/backup coverage low/i)).toBeInTheDocument();
    expect(screen.getByText(/warning/i)).toBeInTheDocument();
  });
});
```

### 4.6 API Failure or Empty State Test

```jsx
import { render, screen } from "@testing-library/react";
import AlertsPanel from "../components/rightRail/AlertsPanel";

describe("AlertsPanel empty state", () => {
  test("shows safe empty state when no alarms are available", () => {
    render(
      <AlertsPanel
        alarms={[]}
        formatTimeAgo={() => "just now"}
        alarmPanelPulse={false}
      />,
    );

    expect(screen.getByText(/all systems stable/i)).toBeInTheDocument();
  });
});
```

## 5. Backend Jest + Supertest Tests

The backend currently includes rule-engine tests with Node's built-in test runner. The examples below show how equivalent API tests can be written using Jest and Supertest for report or future implementation purposes.

### 5.1 `/api/system-health/latest`

```js
const request = require("supertest");
const express = require("express");

jest.mock("../models/systemHealth", () => ({
  findOne: jest.fn(),
}));

const SystemHealth = require("../models/systemHealth");
const healthController = require("../controllers/healthController");

const app = express();
app.use(express.json());
app.get("/api/system-health/latest", healthController.getLatestHealth);

describe("GET /api/system-health/latest", () => {
  test("returns latest system health record", async () => {
    SystemHealth.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        timestamp: "2026-04-16T10:00:00.000Z",
        logging_status: "running",
        dashboard_status: "online",
        backup_status: {
          level_percent: 70,
          estimated_coverage_hours: 10
        }
      })
    });

    const response = await request(app).get("/api/system-health/latest");

    expect(response.status).toBe(200);
    expect(response.body.logging_status).toBe("running");
    expect(response.body.dashboard_status).toBe("online");
  });
});
```

### 5.2 `/api/alarms/active`

```js
const request = require("supertest");
const express = require("express");

jest.mock("../models/alarm", () => ({
  find: jest.fn(),
}));

const Alarm = require("../models/alarm");
const alarmController = require("../controllers/alarmController");

const app = express();
app.use(express.json());
app.get("/api/alarms/active", alarmController.getActiveAlarms);

describe("GET /api/alarms/active", () => {
  test("returns only active alarms", async () => {
    Alarm.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          alarm_type: "low_oxygen_purity",
          status: "active",
          severity: "medium"
        }
      ])
    });

    const response = await request(app).get("/api/alarms/active");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].status).toBe("active");
  });
});
```

### 5.3 Alarm Generation and Validation Logic

```js
const { evaluateDashboardRules } = require("../services/alarmRuleEngine");

describe("evaluateDashboardRules", () => {
  test("generates low purity alarm when purity is below 93", () => {
    const rows = evaluateDashboardRules({
      latestPoint: {
        purity: 92.0,
        flowRate: 100,
        pressureBar: 5.5,
        specificEnergy: 0.68
      },
      supplyDemand: { supply: { coverage_percent: 98 } },
      backupData: { remaining_liters: 12000, utilization: 35 }
    });

    expect(rows.some((row) => row.alarmType === "low_oxygen_purity")).toBe(true);
  });

  test("generates high pressure alarm when pressure is above 6 bar", () => {
    const rows = evaluateDashboardRules({
      latestPoint: {
        purity: 95.0,
        flowRate: 100,
        pressureBar: 6.3,
        specificEnergy: 0.68
      },
      supplyDemand: { supply: { coverage_percent: 98 } },
      backupData: { remaining_liters: 12000, utilization: 35 }
    });

    expect(rows.some((row) => row.alarmType === "high_pressure")).toBe(true);
  });
});
```

### 5.4 Privacy Check for API Responses

```js
const request = require("supertest");
const express = require("express");

jest.mock("../models/systemHealth", () => ({
  findOne: jest.fn(),
}));

const SystemHealth = require("../models/systemHealth");
const healthController = require("../controllers/healthController");

const app = express();
app.use(express.json());
app.get("/api/system-health/latest", healthController.getLatestHealth);

describe("privacy check", () => {
  test("does not expose patient-identifying fields", async () => {
    SystemHealth.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        timestamp: "2026-04-16T10:00:00.000Z",
        logging_status: "running",
        dashboard_status: "online",
        backup_status: {
          level_percent: 70,
          estimated_coverage_hours: 10
        }
      })
    });

    const response = await request(app).get("/api/system-health/latest");

    expect(response.status).toBe(200);
    expect(response.body.patientName).toBeUndefined();
    expect(response.body.patientId).toBeUndefined();
    expect(response.body.dateOfBirth).toBeUndefined();
    expect(response.body.medicalRecordNumber).toBeUndefined();
  });
});
```

## 6. Short Summary for Report Use

Functional testing of the hospital oxygen dashboard prototype confirms whether the system correctly displays oxygen monitoring data, generates alarms at defined thresholds, handles abnormal and empty/error conditions safely, records alarm events, and protects data privacy. The proposed package combines a formal functional test plan, a structured manual test-case matrix, realistic mock data, and practical automated frontend and backend test examples suitable for inclusion in project documentation and future verification activities.
