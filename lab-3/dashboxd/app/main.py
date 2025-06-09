import os, re, pickle, requests
from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, JSONResponse
from typing import List

from app.config import settings
from app.utils import save_upload_file, fetch_omdb_data
from app.analytics import MovieAnalyzer

# Создание FastAPI-приложения
app = FastAPI(title="DashBoxd")

# Монтирование статики и шаблонов
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# --- Загрузка pickle-файлов рекомендаций ---
DATA_DIR = settings.DATA_DIR
with open(os.path.join(DATA_DIR, 'movie_list.pkl'),   'rb') as f:
    movies_df = pickle.load(f)   # DataFrame с movieId, title, tags...
with open(os.path.join(DATA_DIR, 'similarity.pkl'), 'rb') as f:
    similarity = pickle.load(f)  # матрица похожести
with open(os.path.join(DATA_DIR, 'movieId_to_imdb.pkl'), 'rb') as f:
    raw = pickle.load(f)

movieId_to_imdb = {}
for k, v in raw.items():
    try:
        mid = int(k)
    except (ValueError, TypeError):
        # пропускаем любые нечисловые ключи
        continue
    movieId_to_imdb[mid] = v

# --- Построение нормализованного индекса по title с учётом артиклей ---
normalized_title_to_idx = {}
for idx, raw_title in enumerate(movies_df['title']):
    title_norm = raw_title.lower().strip()
    normalized_title_to_idx[title_norm] = idx
    # варианты с артиклем в конце: ", the", ", a", ", an"
    for art in [', the', ', a', ', an']:
        if title_norm.endswith(art):
            base = title_norm[:-len(art)].strip()
            alt = art[2:].strip() + ' ' + base
            normalized_title_to_idx[alt] = idx

# --- Обычные роуты ---
@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/upload")
async def upload_page(request: Request):
    return templates.TemplateResponse("upload.html", {"request": request})

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    expected = {"ratings.csv", "watched.csv", "diary.csv", "profile.csv", "reviews.csv"}
    received = {f.filename for f in files}
    if received != expected:
        return {"error": "Please upload exactly these files: ratings.csv, watched.csv, diary.csv, profile.csv, reviews.csv"}
    os.makedirs(DATA_DIR, exist_ok=True)
    for f in files:
        dest = os.path.join(DATA_DIR, f.filename)
        save_upload_file(f, dest)
    return RedirectResponse(url="/dashboard", status_code=303)

@app.get("/instruction")
async def instruction_page(request: Request):
    return templates.TemplateResponse("instruction.html", {"request": request})

@app.get("/dashboard")
async def dashboard(request: Request):
    analyzer       = MovieAnalyzer(DATA_DIR)
    stats          = analyzer.get_general_stats()
    top_genres     = analyzer.get_top_genres()
    country_stats  = analyzer.get_country_stats()
    recommendations = analyzer.get_recommendations()
    top_directors  = analyzer.get_top_directors()
    top_actors     = analyzer.get_top_actors()
    director_images= analyzer.get_director_images(top_directors)
    actor_images   = analyzer.get_actor_images(top_actors)


    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "stats": stats,
        "top_directors": top_directors,
        "top_actors": top_actors,
        "director_images": director_images,
        "actor_images": actor_images,
        "country_stats": country_stats,
        "recommendations": recommendations,
        "omdb_api_key": settings.OMDB_API_KEY
    })

# --- Роут рекомендаций по похожести контента ---
def fetch_poster_from_omdb(imdb_id=None, title=None, year=None):
    """Вернёт URL постера или пустую строку."""
    params = {"apikey": settings.OMDB_API_KEY}
    if imdb_id:
        params["i"] = imdb_id
    else:
        params["t"] = title
        if year:
            params["y"] = year
    try:
        r = requests.get("https://www.omdbapi.com/", params=params, timeout=5)
        rj = r.json()
        if rj.get("Response") == "True" and rj.get("Poster") and rj["Poster"] != "N/A":
            return rj["Poster"]
    except Exception:
        pass
    return ""

@app.get("/recommend")
async def recommend(request: Request, title: str):
    key = title.lower().strip()
    key_list = key.split()
    if key not in normalized_title_to_idx:
        if key_list[0] in ['the', 'a', 'an']:
            key = f"{' '.join(key_list[1: -1])}, {key_list[0]} {key_list[-1]}"
        else:
            key = f"{key_list[0]} {' '.join(key_list[1: -1])} {key_list[-1]}"
        if key not in normalized_title_to_idx:
            raise HTTPException(status_code=404, detail=f"Movie '{title}' not found")
    idx = normalized_title_to_idx[key]

    sims = list(enumerate(similarity[idx]))
    top5 = sorted(sims, key=lambda x: x[1], reverse=True)[1:6]

    results = []
    for i, score in top5:
        raw = movies_df.iloc[i]["title"]
        m = re.match(r'^(.*)\s*\((\d{4})\)$', raw)
        if m:
            base, year = m.group(1).strip(), m.group(2)
        else:
            base, year = raw, None

        poster = ""
        imdb_id = movieId_to_imdb.get(int(movies_df.iloc[i]["movieId"]))
        if imdb_id:
            poster = fetch_poster_from_omdb(imdb_id=imdb_id)
        if not poster:
            poster = fetch_poster_from_omdb(title=base, year=year)
        if not poster:
            for art in [", the", ", a", ", an"]:
                if base.lower().endswith(art):
                    core = base[:-len(art)].strip()
                    alt  = art[2:].strip() + " " + core
                    poster = fetch_poster_from_omdb(title=alt, year=year)
                    if poster:
                        break
        if not poster:
            stripped = re.sub(r'\s*\(.*?\)', '', base).strip()
            if stripped != base:
                poster = fetch_poster_from_omdb(title=stripped, year=year)

        results.append({
            "title":  raw,
            "score":  float(score),
            "poster": poster or ""
        })

    return JSONResponse({"input": title, "recommendations": results})