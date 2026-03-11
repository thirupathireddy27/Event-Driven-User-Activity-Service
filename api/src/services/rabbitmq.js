const amqp = require('amqplib');

let channel;
const queueName = 'user_activities';

async function connectRabbitMQ() {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        const connection = await amqp.connect(rabbitmqUrl);
        channel = await connection.createChannel();

        // Assert a durable queue
        await channel.assertQueue(queueName, {
            durable: true
        });

        console.log(`Connected to RabbitMQ and asserted queue: ${queueName}`);
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}

async function publishActivity(activity) {
    try {
        if (!channel) {
            throw new Error('RabbitMQ channel not initialized');
        }

        const messageBuffer = Buffer.from(JSON.stringify(activity));

        // Publish message with persistence
        const result = channel.sendToQueue(queueName, messageBuffer, {
            persistent: true
        });

        if (!result) {
            console.error('RabbitMQ sendToQueue returned false, queue full?');
            throw new Error('Message broker could not accept message');
        }

        return result;
    } catch (error) {
        console.error('Error publishing message to RabbitMQ:', error);
        throw error;
    }
}

module.exports = {
    connectRabbitMQ,
    publishActivity
};
