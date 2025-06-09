import os
import pandas as pd
import calendar
from app.utils import fetch_omdb_data, fetch_tmdb_person_image

class MovieAnalyzer:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.ratings = self._load_data('ratings')
        self.watched = self._load_data('watched')
        self.diary = self._load_data('diary')
        self.reviews = self._load_data('reviews')

        if not self.ratings.empty:
            self.ratings = self._enrich_with_omdb(self.ratings)

    def _load_data(self, name):
        path = os.path.join(self.data_dir, f"{name}.csv")
        if os.path.exists(path):
            df = pd.read_csv(path)
            df.columns = [c.lower() for c in df.columns]
            return df
        return pd.DataFrame()

    def _enrich_with_omdb(self, df):
        for col in ["genres", "director", "country", "actors"]:
            if col not in df.columns:
                df[col] = None
        for idx, row in df.iterrows():
            title = row.get("name")
            year = row.get("year")
            if pd.isna(title) or pd.isna(year):
                continue
            omdb = fetch_omdb_data(str(title), int(year))
            if omdb:
                df.at[idx, "genres"] = omdb.get("Genre")
                df.at[idx, "director"] = omdb.get("Director")
                df.at[idx, "country"] = omdb.get("Country")
                df.at[idx, "actors"] = omdb.get("Actors")
        return df

    def get_general_stats(self):
        if self.ratings.empty:
            return {
                "total_watched": 0,
                "total_rated": 0,
                "avg_rating": "N/A",
                "most_active_month_fmt": "N/A"
            }
        total_watched = self.ratings.drop_duplicates(subset=['name', 'year']).shape[0]
        total_rated = self.ratings['rating'].dropna().shape[0] if 'rating' in self.ratings.columns else 0
        avg_rating = round(self.ratings['rating'].dropna().astype(float).mean(),
                           1) if 'rating' in self.ratings.columns and not self.ratings[
            'rating'].dropna().empty else "N/A"
        if 'date' in self.ratings.columns and not self.ratings['date'].isnull().all():
            months = self.ratings['date'].dropna().astype(str).str[:7]
            most_active_month = months.value_counts().idxmax()
            # преобразуем в формат Month YYYY
            if most_active_month and most_active_month != "N/A":
                year, month = most_active_month.split('-')
                most_active_month_fmt = f"{calendar.month_name[int(month)]} {year}"
            else:
                most_active_month_fmt = "N/A"
        else:
            most_active_month = "N/A"
            most_active_month_fmt = "N/A"
        return {
            "total_watched": total_watched,
            "total_rated": total_rated,
            "avg_rating": avg_rating,
            "most_active_month_fmt": most_active_month_fmt
        }

    def get_top_genres(self, n=5):
        if 'genres' not in self.ratings.columns or self.ratings['genres'].isnull().all():
            return []
        all_genres = self.ratings['genres'].dropna().str.split(',').explode().str.strip()
        return all_genres.value_counts().head(n).index.tolist()

    def get_country_stats(self):
        if 'country' not in self.ratings.columns or self.ratings['country'].isnull().all():
            return {}
        all_countries = self.ratings['country'].dropna().str.split(',').explode().str.strip()
        return all_countries.value_counts().to_dict()

    def get_actor_stats(self):
        if 'actors' not in self.ratings.columns or self.ratings['actors'].isnull().all():
            return {}
        all_actors = self.ratings['actors'].dropna().str.split(',').explode().str.strip()
        return all_actors.value_counts().to_dict()

    def get_top_directors(self, n=7):
        if 'director' not in self.ratings.columns or self.ratings['director'].isnull().all():
            return []
        all_directors = self.ratings['director'].dropna().str.split(',').explode().str.strip()
        return all_directors.value_counts().head(n).index.tolist()

    def get_top_actors(self, n=3):
        stats = self.get_actor_stats()
        return list(stats.keys())[:n]

    def get_director_images(self, directors):
        # Возвращает список url фото для списка режиссеров
        return [fetch_tmdb_person_image(name) for name in directors]

    def get_actor_images(self, actors):
        # Возвращает список url фото для списка актёров
        return [fetch_tmdb_person_image(name) for name in actors]

    def get_recommendations(self, n=5):
        if self.ratings.empty or 'genres' not in self.ratings.columns or self.ratings['genres'].isnull().all():
            return []
        all_genres = self.ratings['genres'].dropna().str.split(',').explode().str.strip()
        top_genre = all_genres.value_counts().idxmax()
        df_genre = self.ratings[self.ratings['genres'].str.contains(top_genre, na=False)]
        if 'rating' in df_genre.columns:
            top_films = (
                df_genre.sort_values(by='rating', ascending=False)
                .drop_duplicates(subset=['name', 'year'])
                .head(n)
            )
            return [
                {
                    "title": row['name'],
                    "year": row['year'],
                    "rating": row['rating'],
                    "genres": row['genres'],
                    "director": row.get('director', ''),
                    "country": row.get('country', '')
                }
                for _, row in top_films.iterrows()
            ]
        return []
