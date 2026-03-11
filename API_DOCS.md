# API Documentation

## `POST /api/v1/activities`

Ingests a user activity event. The event is validated, rate-limited, and then published to a RabbitMQ queue for asynchronous processing.

### Rate Limiting
-   Limit: 50 requests per 60 seconds per unique client IP address.

### Request Body

-   **`userId`** (string, required): A unique identifier for the user (e.g., UUID).
-   **`eventType`** (string, required): The type of event (cannot be empty).
-   **`timestamp`** (string, required): A valid ISO-8601 string representing the time the event occurred.
-   **`payload`** (object, required): A JSON object containing any additional event data.

#### Example Request

```json
{
    "userId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "eventType": "user_login",
    "timestamp": "2023-10-27T10:00:00Z",
    "payload": {
        "ipAddress": "192.168.1.1",
        "device": "desktop",
        "browser": "Chrome"
    }
}
```

### Responses

#### `202 Accepted`
The event was successfully received, validated, and published to the message queue.
```json
{
  "status": "success",
  "message": "Event successfully received and queued."
}
```

#### `400 Bad Request`
The request payload failed validation (e.g., missing fields, invalid format).
```json
{
  "status": "error",
  "message": "Validation Error",
  "details": [
    "\"timestamp\" must be a valid ISO 8601 date"
  ]
}
```

#### `429 Too Many Requests`
The client has exceeded the rate limit. Includes a `Retry-After` header indicating the number of seconds until the limit resets.
```json
{
  "status": "error",
  "message": "Too many requests, please try again later."
}
```

#### `500 Internal Server Error`
An internal server error occurred (e.g., failed to connect to RabbitMQ).
```json
{
  "status": "error",
  "message": "Internal server error."
}
```
