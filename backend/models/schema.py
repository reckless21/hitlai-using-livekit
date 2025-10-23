from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HelpRequest(BaseModel):
    id: str
    question: str
    created_at: datetime
    status: str = "unresolved"
