const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { activityRateLimiter } = require('../middlewares/rateLimiter');

// POST /api/v1/activities
router.post('/activities', activityRateLimiter, activityController.ingestActivity);

module.exports = router;
