from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timezone
import uuid

class PromoCode(BaseModel):
    promo_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str
    discount_value: float
    max_usage: int
    current_usage: int = 0
    room_type_ids: List[str] = []
    valid_from: str
    valid_until: str
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
