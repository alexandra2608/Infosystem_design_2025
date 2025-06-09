import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATA_DIR = os.getenv("DATA_DIR", "app/data")
    OMDB_API_KEY = os.getenv("OMDB_API_KEY", "")
    TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")

settings = Settings()
