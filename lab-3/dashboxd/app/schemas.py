from pydantic import BaseModel
from typing import List

class UploadResponse(BaseModel):
    uploaded: List[str]
    message: str
