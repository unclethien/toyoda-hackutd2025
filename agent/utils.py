"""
Utility functions for the agent service.
"""
import hmac
import time
from hashlib import sha256
from typing import Optional


def verify_elevenlabs_signature(
    payload: bytes,
    signature_header: Optional[str],
    webhook_secret: str,
    timestamp_tolerance: int = 30 * 60  # 30 minutes in seconds
) -> bool:
    """
    Verify ElevenLabs webhook signature.
    
    Args:
        payload: The raw request body as bytes
        signature_header: The value of the 'elevenlabs-signature' header
        webhook_secret: The webhook secret from environment variables
        timestamp_tolerance: Maximum age of timestamp in seconds (default: 30 minutes)
    
    Returns:
        True if signature is valid, False otherwise
    """
    if signature_header is None:
        return False
    
    # Parse timestamp and signature from header
    # Format: "t=timestamp,v0=signature"
    try:
        parts = signature_header.split(",")
        timestamp_str = parts[0][2:]  # Remove "t=" prefix
        hmac_signature = parts[1]  # Keep "v0=" prefix as part of signature
    except (IndexError, ValueError):
        return False
    
    # Validate timestamp
    try:
        timestamp = int(timestamp_str)
        tolerance = int(time.time()) - timestamp_tolerance
        if timestamp < tolerance:
            return False
    except ValueError:
        return False
    
    # Compute expected signature
    full_payload_to_sign = f"{timestamp_str}.{payload.decode('utf-8')}"
    mac = hmac.new(
        key=webhook_secret.encode("utf-8"),
        msg=full_payload_to_sign.encode("utf-8"),
        digestmod=sha256,
    )
    expected_digest = 'v0=' + mac.hexdigest()
    
    # Compare signatures
    if hmac_signature != expected_digest:
        return False
    
    return True

