import requests
import os
import json
import shutil
from app.config import settings

OMDB_CACHE_PATH = os.path.join(settings.DATA_DIR, "omdb_cache.json")
TMDB_CACHE_PATH = os.path.join(settings.DATA_DIR, "tmdb_people_cache.json")

def load_omdb_cache():
    if os.path.exists(OMDB_CACHE_PATH):
        with open(OMDB_CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_omdb_cache(cache):
    with open(OMDB_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def fetch_omdb_data(title, year):
    cache = load_omdb_cache()
    key = f"{title.strip().lower()}_{year}"
    if key in cache:
        return cache[key]
    params = {
        "apikey": settings.OMDB_API_KEY,
        "t": title,
        "y": year,
        "r": "json"
    }
    try:
        resp = requests.get("http://www.omdbapi.com/", params=params, timeout=10)
        data = resp.json()
        if data.get("Response") == "True":
            cache[key] = data
            save_omdb_cache(cache)
            return data
        else:
            cache[key] = None
            save_omdb_cache(cache)
            return None
    except Exception as e:
        return None

def save_upload_file(upload_file, destination: str):
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

# --- TMDb photo fetch and cache ---

def load_tmdb_cache():
    if os.path.exists(TMDB_CACHE_PATH):
        with open(TMDB_CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_tmdb_cache(cache):
    with open(TMDB_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def fetch_tmdb_person_image(name):
    """
    Получает url фотографии персоны (актёра или режиссёра) с TMDb.
    """
    cache = load_tmdb_cache()
    key = name.strip().lower()
    if key in cache:
        return cache[key]
    api_key = settings.TMDB_API_KEY
    if not api_key:
        cache[key] = None
        save_tmdb_cache(cache)
        return None
    params = {
        "api_key": api_key,
        "query": name,
    }
    try:
        resp = requests.get("https://api.themoviedb.org/3/search/person", params=params, timeout=10)
        data = resp.json()
        if data.get("results"):
            person = data["results"][0]
            profile_path = person.get("profile_path")
            if profile_path:
                url = f"https://image.tmdb.org/t/p/w500{profile_path}"
                cache[key] = url
                save_tmdb_cache(cache)
                return url
        cache[key] = None
        save_tmdb_cache(cache)
        return None
    except Exception:
        return None
