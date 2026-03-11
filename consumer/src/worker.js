const amqp = require('amqplib');
const mongoose = require('mongoose');
const { processActivity } = require('./services/activityProcessor');

const queueName = 'user_activities';

async function connectDependencies() {
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/activity_db';
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    // Connect to MongoDB
    try {
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB.');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }

    // Connect to RabbitMQ
    try {
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName, { durable: true });

        // Prefetch 1 to guarantee round robin and fair dispatch
        channel.prefetch(1);

        console.log(`Connected to RabbitMQ. Waiting for messages in queue: ${queueName}`);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                try {
                    const content = msg.content.toString();
                    const activity = JSON.parse(content);

                    // Process message
                    await processActivity(activity);

                    // Ack message on success
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing message:', error);
                    // Nack and requeue message
                    channel.nack(msg, false, true);
                }
            }
        });

    } catch (error) {
        console.error('Failed to connect to RabbitMQ in worker', error);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    connectDependencies();
}

module.exports = {
    connectDependencies
};
