const express = require('express');
const request = require('supertest');

jest.mock('../models/alarm', () => ({
  find: jest.fn(),
}));

const Alarm = require('../models/alarm');
const alarmController = require('../controllers/alarmController');

const app = express();
app.use(express.json());
app.get('/api/alarms/active', alarmController.getActiveAlarms);

describe('GET /api/alarms/active', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns active alarms', async () => {
    Alarm.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          alarm_type: 'low_oxygen_purity',
          status: 'active',
          severity: 'medium',
          message: 'Oxygen purity low (92.0 mol% O₂).',
        },
      ]),
    });

    const response = await request(app).get('/api/alarms/active');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('active');
  });

  test('passes stream filter to the model query', async () => {
    Alarm.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });

    const response = await request(app).get('/api/alarms/active?streamId=stream-a');

    expect(response.status).toBe(200);
    expect(Alarm.find).toHaveBeenCalledWith({
      status: 'active',
      $or: [{ stream_id: 'stream-a' }, { stream_id: null }],
    });
  });
});
