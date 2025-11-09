"""
FastAPI RESTful API server.
"""
import json
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
from typing import Dict, Any, List
from dotenv import load_dotenv
from elevenlabs import ElevenLabs
import requests
from models import CallsFinishBody, DealerQuery, WebhookPayload, WebhookType
from utils import verify_elevenlabs_signature
from process_transcript import process_transcript

# Load environment variables from .env file
load_dotenv()

# ElevenLabs API configuration from environment variables
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_FIRST_CALL_AGENT_ID = os.getenv("ELEVENLABS_FIRST_CALL_AGENT_ID")
ELEVENLABS_NEGOTIATING_AGENT_ID = os.getenv("ELEVENLABS_NEGOTIATING_AGENT_ID")
ELEVENLABS_AGENT_PHONE_NUMBER_ID = os.getenv("ELEVENLABS_AGENT_PHONE_NUMBER_ID")
ELEVENLABS_WEBHOOK_SECRET = os.getenv("ELEVENLABS_WEBHOOK_SECRET")
BACKEND_URL = os.getenv("BACKEND_URL")


# Initialize ElevenLabs client
elevenlabs_client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
    base_url="https://api.elevenlabs.io"
)

app = FastAPI(
    title="Agent API",
    description="RESTful API for the agent service",
    version="1.0.0"
)

# Enable CORS to allow browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {
        "message": "Agent API",
        "version": "1.0.0",
        "endpoints": {
            "status": "/status",
            "health": "/health",
            "calls_init": "/calls/init"
        }
    }


@app.get("/status")
async def get_status() -> Dict[str, Any]:
    """Get server status."""
    return {
        "status": "healthy",
        "message": "Server is running",
        "timestamp": int(time.time())
    }


@app.get("/health")
async def health() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/calls/init")
async def call_dealers(queries: List[DealerQuery]) -> Dict[str, Any]:
    """Call a list of dealers using ElevenLabs batch calling API."""
    # Transform DealerQuery list to ElevenLabs format
    recipients = []
    for query in queries:
        recipient_data = {
            "conversation_initiation_client_data": {
                "user_id": query.user_id,
                "dynamic_variables": {
                    "make": query.make,
                    "model": query.model,
                    "year": query.year,
                    "zipcode": query.zipcode,
                    "dealer_name": query.dealer_name,
                    "msrp": query.msrp,
                    "listing_price": query.listing_price
                }
            },
            "phone_number": query.phone_number
        }
        if query.is_dealing:
            recipient_data["conversation_initiation_client_data"]["dynamic_variables"]["competing_price"] = query.competing_price
        recipients.append(recipient_data)
    
    try:
        # Use ElevenLabs SDK to create batch calls
        agent_id = ELEVENLABS_FIRST_CALL_AGENT_ID \
            if not queries[0].is_dealing \
            else ELEVENLABS_NEGOTIATING_AGENT_ID
        response = elevenlabs_client.conversational_ai.batch_calls.create(
            call_name="toYoda",
            agent_id=agent_id,
            agent_phone_number_id=ELEVENLABS_AGENT_PHONE_NUMBER_ID,
            recipients=recipients
        )
        
        return {
            "status": "success",
            "elevenlabs_response": response,
            "recipients_count": len(recipients)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"ElevenLabs API error: {str(e)}"
        }

@app.post("/calls/webhook")
async def calls_webhook(request: Request):
    payload = await request.body()
    signature_header = request.headers.get("elevenlabs-signature")
    
    # Verify signature
    if not verify_elevenlabs_signature(payload, signature_header, ELEVENLABS_WEBHOOK_SECRET):
        return {"status": "error", "message": "Invalid signature"}

    # Processing the webhook
    typed_payload = WebhookPayload.model_validate_json(payload.decode('utf-8'))
    print(f"webhook type: {typed_payload.type}")
    if typed_payload.type == WebhookType.POST_CALL_TRANSCRIPTION:
        # call backend at /calls/finish
        transcript_summary = process_transcript(typed_payload.data.transcript)
        calls_finish_body = CallsFinishBody(
            user_id=typed_payload.data.user_id,
            is_available=transcript_summary.is_available,
            deal_price=transcript_summary.deal_price,
            remarks=transcript_summary.remarks
        )
        print(f"Calling backend with body: {calls_finish_body.model_dump()}")
        response = requests.post(f"{BACKEND_URL}/api/calls/finish", json=calls_finish_body.model_dump())
        if response.status_code != 200:
            return {"status": "error", "message": "Failed to call backend"}
        return {"status": "success", "message": "Backend called successfully"}
    
    elif typed_payload.type == WebhookType.CALL_INITIATION_FAILURE:
        calls_finish_body = CallsFinishBody(
            user_id=typed_payload.data.user_id,
            is_available=False,
            deal_price=0,
            remarks="Call initiation failed"
        )
        response = requests.post(f"{BACKEND_URL}/api/calls/finish", json=calls_finish_body.model_dump())
        if response.status_code != 200:
            return {"status": "error", "message": "Failed to call backend"}
        return {"status": "success", "message": "Backend called successfully"}
    
    else:
        return {"status": "error", "message": "Invalid webhook type"}


if __name__ == "__main__":
    import uvicorn
    from pyngrok import ngrok
    import atexit
    
    # Get ngrok auth token from environment (optional, for paid accounts)
    ngrok_auth_token = os.getenv("NGROK_AUTH_TOKEN")
    if ngrok_auth_token:
        ngrok.set_auth_token(ngrok_auth_token)
    
    # Start ngrok tunnel
    port = 8000
    tunnel = ngrok.connect(port)
    public_url = tunnel.public_url
    
    print("=" * 60)
    print("🚀 FastAPI server starting...")
    print("=" * 60)
    print(f"📍 Local URL: http://localhost:{port}")
    print(f"🌐 Public URL: {public_url}")
    print(f"   - Status endpoint: {public_url}/status")
    print(f"   - Health endpoint: {public_url}/health")
    print(f"   - API docs: {public_url}/docs")
    print(f"   - Calls init: {public_url}/calls/init")
    print("=" * 60)
    print("  - Auto-reload: Enabled (server will restart on code changes)")
    print("  - Press CTRL+C to stop the server and ngrok tunnel")
    print("=" * 60)
    
    # Register cleanup function to close ngrok tunnel on exit
    def cleanup():
        ngrok.kill()
        print("\n✅ Ngrok tunnel closed")
    
    atexit.register(cleanup)
    
    # Use import string format for reload to work properly
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)

