const { processActivity } = require('../src/services/activityProcessor');
const Activity = require('../src/models/Activity');

// Mock mongoose model
jest.mock('../src/models/Activity');

describe('Activity Processor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully save a valid activity', async () => {
        const mockSave = jest.fn().mockResolvedValue(true);
        Activity.mockImplementation(() => {
            return {
                save: mockSave
            };
        });

        const activityData = {
            userId: "user-123",
            eventType: "test_event",
            timestamp: "2023-10-27T10:00:00Z",
            payload: { key: "value" }
        };

        await processActivity(activityData);

        expect(Activity).toHaveBeenCalledTimes(1);
        expect(Activity).toHaveBeenCalledWith({
            userId: "user-123",
            eventType: "test_event",
            timestamp: new Date("2023-10-27T10:00:00Z"),
            payload: { key: "value" }
        });
        expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if saving fails', async () => {
        const mockError = new Error('Database connection failed');
        const mockSave = jest.fn().mockRejectedValue(mockError);
        Activity.mockImplementation(() => {
            return {
                save: mockSave
            };
        });

        const activityData = {
            userId: "user-123",
            eventType: "test_event",
            timestamp: "2023-10-27T10:00:00Z",
            payload: {}
        };

        await expect(processActivity(activityData)).rejects.toThrow('Database connection failed');
        expect(mockSave).toHaveBeenCalledTimes(1);
    });
});
