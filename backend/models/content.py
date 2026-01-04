from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime, timezone
import uuid

class SiteContent(BaseModel):
    content_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str
    page: str
    content_type: str
    content: Dict[str, Any]
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
