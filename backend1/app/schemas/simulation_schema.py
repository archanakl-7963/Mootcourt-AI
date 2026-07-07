from pydantic import BaseModel
from typing import Optional

class CreateSessionRequest(BaseModel):
    dispute_description: str
    side: str  # 'petitioner' or 'respondent'
    mode: str  # 'judge' or 'counsel'
    judge_personality: Optional[str] = None  # 'scalia', 'brennan', 'arbitrator'

class SendMessageRequest(BaseModel):
    message: str
