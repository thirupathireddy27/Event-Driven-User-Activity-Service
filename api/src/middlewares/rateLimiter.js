const rateLimit = require('express-rate-limit');

// Rate limiting middleware for /api/v1/activities
// Allows 50 requests per 60 seconds per IP
const windowMs = process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : 60000;
const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : 50;

const activityRateLimiter = rateLimit({
    windowMs: windowMs,
    max: maxRequests,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many requests, please try again later.'
        });
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
    activityRateLimiter
};
