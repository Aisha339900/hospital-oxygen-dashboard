import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  test('renders KPI label, value, and helper text', () => {
    render(
      <StatCard
        card={{
          label: 'Oxygen Purity',
          value: '95.4%',
          helper: 'Within specification',
          tone: 'good',
        }}
        openMetricDetails={jest.fn()}
      />,
    );

    expect(screen.getByText('Oxygen Purity')).toBeInTheDocument();
    expect(screen.getByText('95.4%')).toBeInTheDocument();
    expect(screen.getByText(/within specification/i)).toBeInTheDocument();
  });
});
