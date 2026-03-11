const express = require('express');
const activityRoutes = require('./routes/activityRoutes');
const { connectRabbitMQ } = require('./services/rabbitmq');

const app = express();
const port = process.env.API_PORT || 3000;

app.use(express.json());

// Health check endpoint for Docker Compose
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Mount activity routes
app.use('/api/v1', activityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
});

async function startServer() {
    try {
        await connectRabbitMQ();
        app.listen(port, () => {
            console.log(`API Service listening on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start API Service:', error);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;
