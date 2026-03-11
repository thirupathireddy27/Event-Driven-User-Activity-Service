const request = require('supertest');
const express = require('express');
const activityRoutes = require('../src/routes/activityRoutes');
const rabbitmq = require('../src/services/rabbitmq');

// Mock the rabbitmq publisher
jest.mock('../src/services/rabbitmq');

const app = express();
app.use(express.json());
app.use('/api/v1', activityRoutes);

describe('Activity API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 202 Accepted on valid payload and publish message', async () => {
        // Setup mock
        rabbitmq.publishActivity.mockResolvedValue(true);

        const payload = {
            userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            eventType: "user_login",
            timestamp: "2023-10-27T10:00:00Z",
            payload: {
                ipAddress: "192.168.1.1"
            }
        };

        const res = await request(app)
            .post('/api/v1/activities')
            .send(payload);

        expect(res.statusCode).toEqual(202);
        expect(res.body.status).toEqual('success');
        expect(rabbitmq.publishActivity).toHaveBeenCalledTimes(1);
    });

    it('should return 400 Bad Request on missing required fields', async () => {
        const payload = {
            userId: "a1b2c3d4",
            // missing eventType
            timestamp: "2023-10-27T10:00:00Z",
            payload: {}
        };

        const res = await request(app)
            .post('/api/v1/activities')
            .send(payload);

        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual('error');
        expect(rabbitmq.publishActivity).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request on invalid timestamp', async () => {
        const payload = {
            userId: "a1b2c3d4",
            eventType: "click",
            timestamp: "invalid-date",
            payload: {}
        };

        const res = await request(app)
            .post('/api/v1/activities')
            .send(payload);

        expect(res.statusCode).toEqual(400);
        expect(res.body.details[0]).toContain('timestamp');
        expect(rabbitmq.publishActivity).not.toHaveBeenCalled();
    });
});
