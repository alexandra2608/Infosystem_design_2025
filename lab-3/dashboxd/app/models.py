from pydantic import BaseModel
from typing import List, Optional

class UploadedFileInfo(BaseModel):
    filename: str
    content_type: str

class MovieRecord(BaseModel):
    title: str
    year: Optional[int]
    genres: List[str]
    rating: Optional[float]
    country: Optional[str]
    director: Optional[str]
    actors: Optional[List[str]]
