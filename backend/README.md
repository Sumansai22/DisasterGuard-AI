# LandslideGuard AI Backend

FastAPI + PostgreSQL backend for SIH26001.

## 1. Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Node/Vite frontend running on `http://localhost:5173`

## 2. Setup

From the `backend` directory:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set your PostgreSQL password.

## 3. PostgreSQL

Create the database:

```sql
CREATE DATABASE landslide_guard;
```

Or use the included Docker Compose file from the project root:

```powershell
docker compose up -d db
```

The database schema is created automatically by SQLAlchemy when the API starts. `database/schema.sql` is also provided for reference/manual creation.

## 4. ML model

Copy the trained model to:

```text
backend/ml_models/landslide_model.pkl
```

The API loads the model once at startup.

IMPORTANT: the default prediction feature order is:

1. rainfall
2. soil_moisture
3. soil_temperature
4. slope
5. elevation
6. ndvi
7. distance_to_fault

If your trained model uses a different feature set/order, update `FEATURE_ORDER` in `app/api/prediction.py` to exactly match training, or send the `features` array in that exact order.

Do not use a guessed feature order in a real deployment.

## 5. Start backend

From `backend`:

```powershell
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

API:
`http://localhost:8000`

Swagger:
`http://localhost:8000/docs`

## 6. Main endpoints

- `GET /api/health`
- `GET /api/dashboard/summary`
- `POST /api/predict`
- `GET /api/predict`
- `GET /api/stations`
- `POST /api/stations`
- `PUT /api/stations/{station_id}`
- `DELETE /api/stations/{station_id}`
- `GET /api/alerts`
- `PUT /api/alerts/{alert_id}/acknowledge`
- `GET /api/weather/{station_id}`
- `POST /api/weather/{station_id}`
- `GET /api/audit-logs`
- `POST /api/audit-logs`

## 7. Test prediction

Create a station first, then POST:

```json
{
  "station_id": 1,
  "rainfall": 145.5,
  "soil_moisture": 72.3,
  "soil_temperature": 28.4,
  "slope": 34.5,
  "elevation": 850,
  "ndvi": 0.42,
  "distance_to_fault": 12.4
}
```

## 8. Frontend

The existing React frontend should call:

```text
http://localhost:8000/api/...
```

Keep database credentials and the `.env` file on the backend only.


## 9. Trained model included in this package

The supplied model is included as `ml_models/landslide_model.pkl`.

It is a scikit-learn `RandomForestClassifier` with 300 trees and 9 input features. The exact feature names detected from the model are:

1. `Rainfall_mm`
2. `Slope_Angle`
3. `Soil_Saturation`
4. `Vegetation_Cover`
5. `Earthquake_Activity`
6. `Proximity_to_Water`
7. `Soil_Type_Gravel`
8. `Soil_Type_Sand`
9. `Soil_Type_Silt`

The backend uses these exact names and order and passes a pandas DataFrame to avoid feature-name mismatch warnings.

The model uses binary classes `[0, 1]`; the API reports the probability of class `1` as `risk_score`.
