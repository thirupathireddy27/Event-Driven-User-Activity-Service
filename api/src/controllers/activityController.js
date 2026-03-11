const Joi = require('joi');
const { publishActivity } = require('../services/rabbitmq');

// Joi schema for validating the incoming request
const activitySchema = Joi.object({
    userId: Joi.string().required(),
    eventType: Joi.string().trim().min(1).required(),
    timestamp: Joi.date().iso().required(),
    payload: Joi.object().required()
});

async function ingestActivity(req, res, next) {
    try {
        // Validation
        const { error, value } = activitySchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorDetails = error.details.map(detail => detail.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation Error',
                details: errorDetails
            });
        }

        const { userId, eventType, timestamp, payload } = value;
        const activityData = {
            userId,
            eventType,
            timestamp,
            payload
        };

        // Publish to RabbitMQ
        await publishActivity(activityData);

        // Success response
        return res.status(202).json({
            status: 'success',
            message: 'Event successfully received and queued.'
        });

    } catch (error) {
        console.error('Error in ingestActivity controller:', error);
        next(error); // Pass to global error handler
    }
}

module.exports = {
    ingestActivity
};
