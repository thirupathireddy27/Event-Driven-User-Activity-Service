# Event-Driven User Activity Service

An event-driven microservice system for tracking user activities. Built with Node.js, Express, RabbitMQ, MongoDB, and Docker.

## Architecture

This project consists of:
1.  **API Service:** A Node.js/Express application that accepts incoming HTTP requests, validates payloads, enforces IP-based rate limiting, and publishes events to a RabbitMQ message queue.
2.  **Consumer Service:** A Node.js background worker that consumes events from RabbitMQ and persists them to a MongoDB database.
3.  **RabbitMQ:** Message broker for asynchronous communication.
4.  **MongoDB:** Database for storing the processed user activities.

This architecture ensures that the API remains responsive under load (returning `202 Accepted` quickly) while the Consumer service processes and stores events at its own pace.

## Project Setup

### Prerequisites

-   Docker and Docker Compose installed.
-   Node.js installed (if running tests locally outside of Docker).

### Environment Variables

A `.env.example` file is provided in the root directory.

If running with Docker Compose, the default environment variables defined in `docker-compose.yml` will be used automatically.

### Running the Application

You can start the entire stack using Docker Compose with a single command:

```bash
docker-compose up --build
```

This will spin up:
- RabbitMQ on ports `5672` (AMQP) and `15672` (Management UI)
- MongoDB on port `27017`
- API Service on port `3000`
- Consumer Service (runs in the background)

The RabbitMQ Management UI is accessible at `http://localhost:15672` (credentials: `guest` / `guest`).

## Testing

Tests are written using Jest and Supertest.

To run the API tests within the Docker environment:
```bash
docker-compose exec api npm test
```

To run the Consumer tests within the Docker environment:
```bash
docker-compose exec consumer npm test
```

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed endpoint documentation.
