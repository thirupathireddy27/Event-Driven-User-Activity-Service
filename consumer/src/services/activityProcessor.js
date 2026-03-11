const Activity = require('../models/Activity');

/**
 * Processes a single activity message and stores it into MongoDB.
 * @param {Object} activityData The parsed JSON activity payload
 */
async function processActivity(activityData) {
    try {
        // We use mongoose to insert the activity data.
        // It validates against the schema on save().
        const newActivity = new Activity({
            userId: activityData.userId,
            eventType: activityData.eventType,
            timestamp: new Date(activityData.timestamp),
            payload: activityData.payload
        });

        await newActivity.save();
        console.log(`Successfully processed and saved activity for User: ${activityData.userId}`);
    } catch (error) {
        console.error('Error saving activity to database:', error);
        throw error; // Rethrow to let the worker NACK the message
    }
}

module.exports = {
    processActivity
};
