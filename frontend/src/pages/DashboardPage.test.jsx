import { render, screen } from '@testing-library/react';
import DashboardPage from './DashboardPage';

jest.mock('../components/charts/OxygenProductFlowVsFeedFlowPanel', () => {
  return function MockFlowPanel() {
    return <div>Mock Flow Chart</div>;
  };
});

jest.mock('../components/charts/OxygenPurityVsFeedFlowPanel', () => {
  return function MockPurityPanel() {
    return <div>Mock Purity Chart</div>;
  };
});

jest.mock('../components/dashboard/DashboardReportActions', () => {
  return function MockReportActions() {
    return <div>Mock Report Actions</div>;
  };
});

const baseProps = {
  statCards: [
    {
      id: 'purity',
      label: 'Oxygen Purity',
      value: '95.4%',
      helper: 'Within normal range',
      tone: 'good',
    },
    {
      id: 'pressure',
      label: 'Delivery Pressure',
      value: '5.6 bar',
      helper: 'Stable',
      tone: 'good',
    },
  ],
  detailPayloads: {
    oxygenProductFlowVsFeedFlow: {},
    oxygenPurityVsFeedFlow: {},
  },
  openMetricDetails: jest.fn(),
  openChartDetails: jest.fn(),
  trendData: [
    { timestamp: 1, oxygenPurity: 95.2, flowRate: 100 },
    { timestamp: 2, oxygenPurity: 95.4, flowRate: 102 },
  ],
  alarms: [],
  formatTimeAgo: () => 'just now',
  backup: { remainingLiters: 10000, utilization: 35, mode: 'automatic' },
  supplyDemand: {
    supply: { coveragePercent: 98, mainUtilizationPercent: 68, mainRemainingLiters: 24000 },
    demand: { totalRequests: 25, generalRequests: 18, icuRequests: 7 },
    status: 'Supply is healthy',
  },
  supplyFill: 98,
  supplyIsHealthy: true,
  alarmPanelPulse: false,
  backupPanelPulse: false,
  demandPanelPulse: false,
  unacknowledgedAlarms: 0,
  streamOptions: [{ id: 'main', label: 'Main Stream' }],
  activeStream: 'main',
  onStreamChange: jest.fn(),
  currentStreamLabel: 'Main Stream',
  currentStreamProcess: null,
  trendChartConfig: {},
  isDarkMode: false,
  onToggleTheme: jest.fn(),
  onOpenSimulationEntry: jest.fn(),
  buildReportSnapshot: jest.fn(() => ({})),
  reportUserEmail: 'tester@example.com',
  reportCanEmail: true,
  dashboardTestModeEnabled: false,
  onDashboardTestModeToggle: jest.fn(),
  dashboardTestInputs: {},
  onDashboardTestInputChange: jest.fn(),
};

describe('DashboardPage', () => {
  test('renders dashboard content and KPI cards', () => {
    render(<DashboardPage {...baseProps} />);

    expect(screen.getByText(/oxygen purity/i)).toBeInTheDocument();
    expect(screen.getByText(/delivery pressure/i)).toBeInTheDocument();
    expect(screen.getByText(/alarm & alert/i)).toBeInTheDocument();
    expect(screen.getByText(/backup oxygen status/i)).toBeInTheDocument();
    expect(screen.getByText(/demand vs supply/i)).toBeInTheDocument();
  });
});
