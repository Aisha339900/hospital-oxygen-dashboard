from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
import certifi
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from prophet import Prophet
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import PyMongoError


BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "hospital-oxygen-dashboard")
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "measurementhistories")
DEFAULT_FORECAST_DAYS = 7

mongo_client: MongoClient | None = None
measurement_collection: Collection | None = None


def to_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if pd.isna(number):
        return None
    return number


def to_date_string(value: pd.Timestamp | datetime) -> str:
    timestamp = pd.Timestamp(value)
    if timestamp.tzinfo is not None:
        timestamp = timestamp.tz_convert(None)
    return timestamp.strftime("%Y-%m-%d")


def get_measurement_collection() -> Collection:
    global mongo_client, measurement_collection

    if measurement_collection is not None:
        return measurement_collection

    if not MONGODB_URI:
        raise HTTPException(
            status_code=500,
            detail="MONGODB_URI is not configured in the environment.",
        )

    mongo_client = MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=5000,
        tlsCAFile=certifi.where(),
    )
    try:
        mongo_client.admin.command("ping")
    except PyMongoError as exc:
        mongo_client.close()
        mongo_client = None
        raise HTTPException(
            status_code=500,
            detail=f"Unable to connect to MongoDB: {exc}",
        ) from exc

    database = mongo_client[MONGODB_DB_NAME]
    measurement_collection = database[MONGODB_COLLECTION]
    return measurement_collection


def load_history_frame(collection: Collection) -> pd.DataFrame:
    projection = {
        "date": 1,
        "measurements.oxygen_purity.value": 1,
    }
    cursor = collection.find({}, projection).sort("date", 1)

    rows: List[Dict[str, Any]] = []
    for document in cursor:
        raw_date = document.get("date")
        oxygen_purity = (
            document.get("measurements", {})
            .get("oxygen_purity", {})
            .get("value")
        )

        parsed_date = pd.to_datetime(raw_date, utc=True, errors="coerce")
        parsed_value = to_float(oxygen_purity)

        if pd.isna(parsed_date) or parsed_value is None:
            continue

        rows.append({"ds": parsed_date, "y": parsed_value})

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No usable oxygen purity history found in {MONGODB_DB_NAME}."
            ),
        )

    frame = pd.DataFrame(rows)
    frame["ds"] = pd.to_datetime(frame["ds"], utc=True, errors="coerce")
    frame = frame.dropna(subset=["ds", "y"])

    if frame.empty:
        raise HTTPException(
            status_code=404,
            detail="Historical oxygen purity data could not be normalized.",
        )

    frame["ds"] = frame["ds"].dt.tz_convert(None).dt.floor("D")
    frame["y"] = pd.to_numeric(frame["y"], errors="coerce")
    frame = frame.dropna(subset=["ds", "y"])

    daily_frame = (
        frame.groupby("ds", as_index=False, sort=True)
        .agg({"y": "mean"})
        .sort_values("ds")
        .reset_index(drop=True)
    )

    if len(daily_frame) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least two daily data points are required to train Prophet.",
        )

    return daily_frame


def train_model(history_frame: pd.DataFrame) -> Prophet:
    model = Prophet(
        interval_width=0.95,
        changepoint_prior_scale=0.05,
        weekly_seasonality=True,
        daily_seasonality=False,
        yearly_seasonality="auto",
    )
    model.fit(history_frame)
    return model


def build_forecast_payload(
    model: Prophet,
    history_frame: pd.DataFrame,
    forecast_days: int,
) -> Dict[str, Any]:
    future_frame = model.make_future_dataframe(
        periods=forecast_days,
        freq="D",
        include_history=True,
    )
    forecast_frame = model.predict(future_frame)

    last_history_date = history_frame["ds"].max()
    forecast_only = forecast_frame[forecast_frame["ds"] > last_history_date].tail(
        forecast_days,
    )

    forecast_points = [
        {
            "date": to_date_string(row.ds),
            "ds": to_date_string(row.ds),
            "yhat": round(float(row.yhat), 4),
            "yhat_lower": round(float(row.yhat_lower), 4),
            "yhat_upper": round(float(row.yhat_upper), 4),
        }
        for row in forecast_only.itertuples(index=False)
    ]

    history_predictions = forecast_frame[forecast_frame["ds"].isin(history_frame["ds"])]
    history_analysis = history_frame.merge(
        history_predictions[["ds", "yhat", "yhat_lower", "yhat_upper"]],
        on="ds",
        how="left",
    )

    anomalies = history_analysis[
        (history_analysis["y"] < history_analysis["yhat_lower"])
        | (history_analysis["y"] > history_analysis["yhat_upper"])
    ]

    anomaly_points = [
        {
            "date": to_date_string(row.ds),
            "ds": to_date_string(row.ds),
            "actual_value": round(float(row.y), 4),
            "predicted_value": round(float(row.yhat), 4),
            "yhat_lower": round(float(row.yhat_lower), 4),
            "yhat_upper": round(float(row.yhat_upper), 4),
        }
        for row in anomalies.itertuples(index=False)
    ]

    return {
        "metric": "oxygen_purity",
        "source": {
            "database": MONGODB_DB_NAME,
            "collection": MONGODB_COLLECTION,
        },
        "training": {
            "records_used": int(len(history_frame)),
            "start_date": to_date_string(history_frame["ds"].min()),
            "end_date": to_date_string(history_frame["ds"].max()),
        },
        "forecast_days": forecast_days,
        "forecast": forecast_points,
        "anomalies": anomaly_points,
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    global mongo_client, measurement_collection
    if mongo_client is not None:
        mongo_client.close()
    mongo_client = None
    measurement_collection = None


app = FastAPI(
    title="Hospital Oxygen Forecast API",
    version="1.0.0",
    description="Forecasts oxygen purity trends from MongoDB historical measurements using Prophet.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/oxygen-purity/forecast")
def forecast_oxygen_purity(
    days: int = Query(
        DEFAULT_FORECAST_DAYS,
        ge=1,
        le=30,
        description="Number of future days to forecast.",
    ),
) -> Dict[str, Any]:
    collection = get_measurement_collection()
    history_frame = load_history_frame(collection)
    model = train_model(history_frame)
    return build_forecast_payload(model, history_frame, days)
