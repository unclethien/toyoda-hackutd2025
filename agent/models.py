from typing import Any
from pydantic import BaseModel
from enum import Enum


class DealerQuery(BaseModel):
    """Dealer query with car information and phone number."""
    make: str
    model: str
    year: int
    zipcode: str
    dealer_name: str
    msrp: int
    listing_price: int
    is_dealing: bool
    competing_price: int | None
    
    phone_number: str
    user_id: str

class WebhookType(str, Enum):
    POST_CALL_TRANSCRIPTION = "post_call_transcription"
    CALL_INITIATION_FAILURE = "call_initiation_failure"


class WebhookData(BaseModel):
    agent_id: str
    conversation_id: str
    status: str
    user_id: str
    transcript: list[Any]
    metadata: Any
    analysis: Any
    conversation_initiation_client_data: Any

class WebhookPayload(BaseModel):
    type: str
    data: WebhookData

class TranscriptSummary(BaseModel):
    is_available: bool
    deal_price: int
    remarks: str

class CallsFinishBody(BaseModel):
    user_id: str
    is_available: bool
    deal_price: int
    remarks: str