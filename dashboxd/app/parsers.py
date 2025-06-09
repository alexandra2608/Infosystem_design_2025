import pandas as pd

def parse_ratings(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    df = df.rename(columns={
        "Date": "date",
        "Name": "name",
        "Year": "year",
        "Letterboxd URI": "uri",
        "Rating": "rating"
    })
    return df

def parse_watched(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    df = df.rename(columns={
        "Date": "date",
        "Name": "name",
        "Year": "year",
        "Letterboxd URI": "uri"
    })
    return df

def parse_diary(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    df = df.rename(columns={
        "Date": "date",
        "Name": "name",
        "Year": "year",
        "Letterboxd URI": "uri",
        "Rating": "rating",
        "Rewatch": "rewatch",
        "Tags": "tags",
        "Watched Date": "watched_date"
    })
    return df

def parse_profile(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    df = df.rename(columns={
        "Date Joined": "date_joined",
        "Username": "username",
        "Given Name": "given_name",
        "Family Name": "family_name",
        "Email Address": "email",
        "Location": "location",
        "Website": "website",
        "Bio": "bio",
        "Pronoun": "pronoun",
        "Favorite Films": "favorite_films"
    })
    return df

def parse_reviews(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    df = df.rename(columns={
        "Date": "date",
        "Name": "name",
        "Year": "year",
        "Letterboxd URI": "uri",
        "Rating": "rating",
        "Rewatch": "rewatch",
        "Review": "review",
        "Tags": "tags",
        "Watched Date": "watched_date"
    })
    return df
