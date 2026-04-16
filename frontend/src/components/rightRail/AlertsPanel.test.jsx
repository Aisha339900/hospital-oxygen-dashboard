import { render, screen } from '@testing-library/react';
import AlertsPanel from './AlertsPanel';

describe('AlertsPanel', () => {
  test('renders backup warning message when an alarm exists', () => {
    render(
      <AlertsPanel
        alarms={[
          {
            id: '1',
            severity: 'warning',
            timestamp: Date.now(),
            message: 'Backup coverage low (4.5 hours remaining).',
          },
        ]}
        formatTimeAgo={() => '1 min ago'}
        alarmPanelPulse={false}
      />,
    );

    expect(screen.getByText(/backup coverage low/i)).toBeInTheDocument();
    expect(screen.getByText(/warning/i)).toBeInTheDocument();
  });

  test('shows safe empty state when no alarms are present', () => {
    render(
      <AlertsPanel
        alarms={[]}
        formatTimeAgo={() => 'just now'}
        alarmPanelPulse={false}
      />,
    );

    expect(screen.getByText(/all systems stable/i)).toBeInTheDocument();
  });
});
