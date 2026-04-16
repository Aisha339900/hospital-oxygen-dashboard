const express = require('express');
const request = require('supertest');

jest.mock('../models/systemHealth', () => ({
  findOne: jest.fn(),
}));

const SystemHealth = require('../models/systemHealth');
const healthController = require('../controllers/healthController');

const app = express();
app.use(express.json());
app.get('/api/system-health/latest', healthController.getLatestHealth);

describe('GET /api/system-health/latest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns the latest system health record', async () => {
    SystemHealth.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        timestamp: '2026-04-16T10:00:00.000Z',
        logging_status: 'running',
        dashboard_status: 'online',
        backup_status: {
          level_percent: 70,
          estimated_coverage_hours: 10,
        },
      }),
    });

    const response = await request(app).get('/api/system-health/latest');

    expect(response.status).toBe(200);
    expect(response.body.logging_status).toBe('running');
    expect(response.body.dashboard_status).toBe('online');
  });

  test('does not expose patient-identifying fields', async () => {
    SystemHealth.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        timestamp: '2026-04-16T10:00:00.000Z',
        logging_status: 'running',
        dashboard_status: 'online',
        backup_status: {
          level_percent: 70,
          estimated_coverage_hours: 10,
        },
      }),
    });

    const response = await request(app).get('/api/system-health/latest');

    expect(response.status).toBe(200);
    expect(response.body.patientName).toBeUndefined();
    expect(response.body.patientId).toBeUndefined();
    expect(response.body.dateOfBirth).toBeUndefined();
    expect(response.body.medicalRecordNumber).toBeUndefined();
  });
});
