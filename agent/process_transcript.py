from models import TranscriptSummary
from llm import LLM

def process_transcript(transcript: list[dict]) -> TranscriptSummary:
    llm = LLM()
    role_map = {
        "user": "DEALER",
        "agent": "ADVISOR",
    }
    text_transcript = "\n".join([
        f"{role_map[turn['role']]}: {turn['message']}" for turn in transcript
    ])
    with open("prompts/transcript_summary.md", "r") as f:
        system_prompt = f.read()
    return llm(system_prompt, text_transcript, TranscriptSummary)