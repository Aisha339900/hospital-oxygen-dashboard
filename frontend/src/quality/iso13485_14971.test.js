import { performance } from 'perf_hooks';
import { generateAlarmPanelData } from '../utils/alarmLogic';
import { calculateUptimePercentage } from './uptime';

const buildSupplyDemand = (coverage = 100) => ({
  demand: {
    totalRequests: 113,
    generalRequests: 97,
    icuRequests: 16
  },
  supply: {
    coverage_percent: coverage,
    main_remaining_liters: 54081,
    main_utilization_percent: 63.95
  }
});

describe('ISO 13485 / ISO 14971 quality controls', () => {
  test('TC1 - Purity alarm response under 2s when purity < 93%', () => {
    const timer = performance ?? { now: () => Date.now() };
    const testInput = {
      latestPoint: {
        purity: 92.2,
        demandCoverage: 97,
        pressure: 85,
        specificEnergy: 0.7
      },
      supplyDemand: buildSupplyDemand(100),
      backupData: {
        utilization: 60,
        remainingLiters: 12000
      }
    };

    const start = timer.now();
    const alarms = generateAlarmPanelData(testInput);
    const responseTimeMs = timer.now() - start;

    const purityAlarm = alarms.find((alarm) => alarm.id.includes('purity') && alarm.severity !== 'info');

    expect(responseTimeMs).toBeLessThanOrEqual(2000);
    expect(purityAlarm).toBeDefined();
    expect(purityAlarm.severity).toBe('warning');
    expect(purityAlarm.message).toMatch(/purity low/i);
  });

  test('TC2 - Displayed purity remains within ±1% of simulated value', () => {
    const simulatedPurity = 92.7;
    const alarms = generateAlarmPanelData({
      latestPoint: {
        purity: simulatedPurity,
        demandCoverage: 98,
        pressureBar: 5.5,
        specificEnergy: 0.65
      },
      supplyDemand: buildSupplyDemand(100),
      backupData: {
        utilization: 70,
        remainingLiters: 15000
      }
    });

    const purityAlarm = alarms.find((alarm) => alarm.id.includes('purity'));
    expect(purityAlarm).toBeDefined();

    const displayedValueMatch = purityAlarm.message.match(/(\d+\.\d)/);
    expect(displayedValueMatch).not.toBeNull();

    const displayedPurity = Number.parseFloat(displayedValueMatch?.[1] ?? '0');
    const absoluteError = Math.abs(displayedPurity - simulatedPurity);

    expect(absoluteError).toBeLessThanOrEqual(1);
  });

  test('TC4 - Pressure > 6 bar triggers alarm', () => {
    const alarms = generateAlarmPanelData({
      latestPoint: {
        purity: 94,
        demandCoverage: 100,
        pressureBar: 6.5,
        specificEnergy: 0.7
      },
      supplyDemand: buildSupplyDemand(100),
      backupData: {
        utilization: 65,
        remainingLiters: 8000
      }
    });

    const pressureAlarm = alarms.find((alarm) => alarm.id.includes('pressure'));

    expect(pressureAlarm).toBeDefined();
    expect(pressureAlarm.message).toMatch(/pressure (high|critical)/i);
  });

  test('TC5 - Uptime calculation confirms ≥99% availability', () => {
    const intervals = [
      { durationMinutes: 600, status: 'up' },
      { durationMinutes: 5, status: 'down' },
      { durationMinutes: 835, status: 'up' }
    ];

    const report = calculateUptimePercentage(intervals);

    expect(report.totalMinutes).toBeCloseTo(1440, 0); // 24h window
    expect(report.downtimeMinutes).toBeCloseTo(5, 5);
    expect(report.uptimePercent).toBeGreaterThanOrEqual(99);
  });

  test('TC6 - Demand coverage alert fires when coverage < 95%', () => {
    const alarms = generateAlarmPanelData({
      latestPoint: {
        purity: 95,
        demandCoverage: 80,
        pressureBar: 5.5,
        specificEnergy: 0.7
      },
      supplyDemand: buildSupplyDemand(80),
      backupData: {
        utilization: 40,
        remainingLiters: 3000
      }
    });

    const coverageAlarm = alarms.find((alarm) => alarm.id.includes('coverage'));

    expect(coverageAlarm).toBeDefined();
    expect(coverageAlarm.message).toMatch(/system (under stress|failure risk)/i);
  });
});
