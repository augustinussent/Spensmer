from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timezone
import uuid

class ReviewCreate(BaseModel):
    guest_name: str
    guest_email: EmailStr
    rating: int
    comment: str
    reservation_id: str = ""

class Review(BaseModel):
    review_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    guest_name: str
    guest_email: str
    rating: int
    comment: str
    reservation_id: str = ""
    is_visible: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
