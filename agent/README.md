# Agent Server

A FastAPI-based server that integrates with ElevenLabs Conversational AI to initiate batch phone calls to dealers and handle webhook callbacks. The server acts as a bridge between your application and ElevenLabs, managing call initiation and processing call results.

## Features

- 🚀 **Batch Call Initiation**: Initiate multiple phone calls to dealers using ElevenLabs Conversational AI
- 🔔 **Webhook Handling**: Secure webhook endpoint to receive call transcripts and status updates
- 🔐 **Signature Validation**: HMAC signature validation for webhook security
- 🌐 **Ngrok Integration**: Automatic public URL generation for webhook endpoints
- 📊 **Backend Integration**: Automatically forwards call results to your backend API
- 🔄 **Auto-reload**: Development server with automatic reload on code changes

## Prerequisites

- Python 3.11+
- ElevenLabs API account with Conversational AI access
- Backend API endpoint for receiving call results

## Installation

1. **Clone the repository** (if applicable) or navigate to the agent directory:
   ```bash
   cd agent
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `agent/` directory:
   ```env
   # ElevenLabs Configuration
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ELEVENLABS_AGENT_ID=your_agent_id
   ELEVENLABS_AGENT_PHONE_NUMBER_ID=your_phone_number_id
   ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret
   
   # Backend Configuration
   BACKEND_URL=https://your-backend-api.com
   
   # Optional: Ngrok Auth Token (for paid accounts)
   NGROK_AUTH_TOKEN=your_ngrok_auth_token
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ELEVENLABS_API_KEY` | Yes | Your ElevenLabs API key |
| `ELEVENLABS_AGENT_ID` | Yes | The ID of your ElevenLabs conversational AI agent |
| `ELEVENLABS_AGENT_PHONE_NUMBER_ID` | Yes | The phone number ID for making calls |
| `ELEVENLABS_WEBHOOK_SECRET` | Yes | Secret key for validating webhook signatures |
| `BACKEND_URL` | Yes | Base URL of your backend API |
| `NGROK_AUTH_TOKEN` | No | Ngrok authentication token (for paid accounts) |

## Running the Server

### Development Mode

```bash
python server.py
```

The server will:
- Start on `http://localhost:8000`
- Automatically create an ngrok tunnel
- Display both local and public URLs
- Enable auto-reload on code changes

### Production Mode

For production, use a proper ASGI server:

```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

**Note**: In production, you'll need to set up ngrok separately or use a different tunneling solution.

## API Endpoints

### `GET /`
Root endpoint that returns API information.

**Response:**
```json
{
  "message": "Agent API",
  "version": "1.0.0",
  "endpoints": {
    "status": "/status",
    "health": "/health",
    "calls_init": "/calls/init"
  }
}
```

### `GET /status`
Get server status and health information.

**Response:**
```json
{
  "status": "healthy",
  "message": "Server is running",
  "timestamp": 1234567890
}
```

### `GET /health`
Simple health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /calls/init`
Initiate batch phone calls to dealers.

**Request Body:**
```json
[
  {
    "make": "honda",
    "model": "civic",
    "year": "2025",
    "zipcode": "75080",
    "dealer_name": "honda plano",
    "msrp": "14000000",
    "listing_price": "14500000",
    "phone_number": "+19452740673",
    "user_id": "user123"
  }
]
```

**Response:**
```json
{
  "status": "success",
  "elevenlabs_response": {...},
  "recipients_count": 1
}
```

### `POST /calls/webhook`
Webhook endpoint for receiving call results from ElevenLabs.

**Headers:**
- `elevenlabs-signature`: HMAC signature for validation

**Request Body:**
ElevenLabs webhook payload (automatically validated and processed)

**Response:**
```json
{
  "status": "success",
  "message": "Backend called successfully"
}
```

## Webhook Processing

The webhook endpoint handles two types of events:

1. **POST_CALL_TRANSCRIPTION**: When a call completes successfully
   - Extracts transcript and call data
   - Formats transcript as readable text
   - Sends results to backend at `/calls/finish`

2. **CALL_INITIATION_FAILURE**: When a call fails to initiate
   - Marks call as unavailable
   - Sends failure notification to backend

### Webhook Security

The webhook endpoint validates:
- **Timestamp**: Ensures request is recent (within 30 minutes)
- **HMAC Signature**: Validates request authenticity using `ELEVENLABS_WEBHOOK_SECRET`

## Ngrok Integration

The server automatically creates an ngrok tunnel when started, providing a public URL for webhook endpoints.

### Setting Up Webhook URL in ElevenLabs

1. Start the server and note the public ngrok URL
2. Configure the webhook URL in your ElevenLabs dashboard:
   ```
   https://your-ngrok-url.ngrok.io/calls/webhook
   ```

### Ngrok Auth Token (Optional)

For paid ngrok accounts with custom domains:
1. Get your auth token from [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Add it to your `.env` file as `NGROK_AUTH_TOKEN`

## API Documentation

When the server is running, interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Example Usage

### Initiate Calls

```bash
curl -X POST http://localhost:8000/calls/init \
  -H "Content-Type: application/json" \
  -d '[
    {
      "make": "honda",
      "model": "civic",
      "year": "2025",
      "zipcode": "75080",
      "dealer_name": "honda plano",
      "msrp": "14000000",
      "listing_price": "14500000",
      "phone_number": "+19452740673",
      "user_id": "user123"
    }
  ]'
```

### Check Status

```bash
curl http://localhost:8000/status
```

## Project Structure

```
agent/
├── server.py          # Main FastAPI application
├── models.py           # Pydantic models for request/response validation
├── requirements.txt    # Python dependencies
├── .env               # Environment variables (not in git)
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Development

### Auto-reload

The development server automatically reloads when code changes are detected. No need to manually restart.

### Debugging

- Check server logs for webhook processing details
- Invalid webhook signatures are logged with error messages
- Backend API call failures are logged

## Error Handling

The server handles various error scenarios:

- **Invalid webhook signatures**: Returns error response, logs details
- **ElevenLabs API errors**: Returns error response with details
- **Backend API failures**: Logs error, returns appropriate response
- **Missing environment variables**: Raises ValueError on startup

## Security Considerations

1. **Never commit `.env` file**: Contains sensitive API keys
2. **Webhook validation**: Always validates HMAC signatures
3. **CORS**: Currently allows all origins (`*`). Restrict in production
4. **Environment variables**: Use secure secret management in production

## Troubleshooting

### Webhook not receiving requests
- Verify ngrok tunnel is active
- Check webhook URL is correctly configured in ElevenLabs
- Ensure webhook secret matches in both systems

### Signature validation failing
- Verify `ELEVENLABS_WEBHOOK_SECRET` matches ElevenLabs configuration
- Check timestamp validation (requests must be within 30 minutes)

### Backend calls failing
- Verify `BACKEND_URL` is correct and accessible
- Check backend API endpoint `/calls/finish` exists and accepts POST requests

## License

[Add your license here]

## Support

[Add support/contact information here]

