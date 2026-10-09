# DisasterGuard AI 🛡️
### Multi-Hazard Disaster Management & Early Warning System
**AI-Powered Multi-Hazard Disaster Risk, Warning & Response Platform**

---

## 📌 Overview

**DisasterGuard AI** is an end-to-end, multi-hazard disaster risk intelligence, early warning, and emergency response decision-support system. Engineered for national disaster management authorities, district collectors, emergency responders, and field rescue teams, the platform seamlessly integrates satellite remote sensing, real-time meteorological sensor feeds, deep learning computer vision, numerical modeling, and automated evacuation routing into a unified operational command center.

The platform provides real-time situational awareness across six critical disaster categories:
- 🌊 **Flash Floods & Inundation**
- ⛰️ **Landslides & Slope Instabilities**
- 🌀 **Cyclones & High-Wind Storms**
- 🏚️ **Earthquakes & Seismic Fault Activity**
- 🔥 **Forest Wildfires & Thermal Hotspots**
- ☀️ **Extreme Heatwaves & Thermal Stress**

---

## 🏗️ Architecture & Core Pillars

DisasterGuard AI is architected around three high-performance pillars designed for high reliability and sub-second response times:

```
                               ┌───────────────────────────────────────────────────────────┐
                               │                    DisasterGuard AI                       │
                               │  Multi-Hazard Disaster Management & Early Warning System  │
                               └─────────────────────────────┬─────────────────────────────┘
                                                             │
                  ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
                  ▼                                          ▼                                          ▼
     ┌─────────────────────────┐                ┌─────────────────────────┐                ┌─────────────────────────┐
     │        PILLAR 1         │                │        PILLAR 2         │                │        PILLAR 3         │
     │    Location Services    │                │      Hazards Engine     │                │     Response Engine     │
     └────────────┬────────────┘                └────────────┬────────────┘                └────────────┬────────────┘
                  │                                          │                                          │
       • Nominatim Geo Service                    • Multi-Hazard Risk Matrix                 • Evacuation Routing
       • Open-Meteo Integration                   • Random Forest Landslide ML               • Geo-Shelter Discovery
       • IMD / CWC AWS Stations                   • DeepLabV3+ / UNet Segmentation           • Drone Rescue Computer Vision
       • Real-time Terrain Profiling              • Gemini AI Satellite Land Scan            • SOS Alert Dispatch & Webhooks
```

### 1. Pillar 1: Location Services
- **Global / Regional Geocoding**: Search and resolve coordinates, administrative levels, terrain slopes, soil profiles, and vulnerable population densities for any location across India and worldwide.
- **Meteorological Sensor Feeds**: Integrates 24-hour, 72-hour, and cumulative 7-day rainfall feeds, wind gusts, soil moisture saturation percentages, and temperature anomalies from Open-Meteo and automated weather stations.

### 2. Pillar 2: Hazards Engine
- **Multi-Hazard Risk Assessment**: Dynamically assesses risk indexes (0–100%) for floods, landslides, cyclones, earthquakes, wildfires, and heatwaves using physics-guided parameter evaluation.
- **Random Forest Landslide ML Model**: Trained on geological features (slope angle, precipitation, elevation, lithology, distance to faults/roads) delivering instantaneous hazard probability scores (`landslide_model.pkl`).
- **U-Net Satellite Segmentation**: High-resolution deep learning segmentation (`SIH26001_Landslide_UNet.keras`) that scans multispectral satellite imagery to segment active scarps and inundation boundaries.
- **Gemini Multimodal Land Scan**: Vision-language analysis of aerial and satellite imagery to identify debris buildup, structural damage, and geomorphic risks.
- **Composite Hazard Matrix**: Calculates cascading compound threats and prioritized evacuation triggers.

### 3. Pillar 3: Response Engine
- **Dynamic Evacuation Corridor Generation**: Calculates primary and secondary emergency transit corridors avoiding hazard zones and flooded bottlenecks.
- **Geo-Shelter Discovery & Triage**: Catalogs relief camps, hospitals, safe zones, and food/medical staging locations with capacity and resource tracking.
- **AI Drone Rescue Scanner**: Live aerial drone video stream analysis powered by computer vision to detect stranded survivors, distress signals (waving, SOS markers), and structural entrapment with geo-tagged coordinate overlays.
- **Automated CAP/SMS Alert Broadcast**: Generates multi-channel notifications (CAP XML, SMS, WhatsApp, Webhooks) targeted by hazard severity and geofence.

---

## 🌐 Multilingual Accessibility

DisasterGuard AI is fully localized into 6 major regional and national languages with seamless on-the-fly switching:
1. **English (Default)**
2. **తెలుగు (Telugu)**
3. **हिन्दी (Hindi)**
4. **தமிழ் (Tamil)**
5. **മലയാളം (Malayalam)**
6. **ಕನ್ನಡ (Kannada)**

All UI labels, KPIs, hazard categories, evacuation warnings, incident statuses, and emergency SOP cards dynamically update across all localized languages.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Mapping & GIS**: Leaflet, React-Leaflet, OpenStreetMap / Satellite Tiles
- **Internationalization**: Custom React i18n Context with 6 complete locale dictionaries

### Backend
- **Framework**: FastAPI (Python 3.10+) with Uvicorn
- **Machine Learning**: Scikit-Learn (Random Forest), TensorFlow / Keras (U-Net), NumPy, Pandas
- **AI / LLM**: Google Gemini 1.5 Flash / Pro Multimodal API
- **Database**: SQLite with SQLAlchemy ORM (WAL mode enabled)
- **External APIs**: Open-Meteo Weather API, OpenStreetMap Nominatim Geocoding

---

## 📦 Project Structure

```
landslideguard-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/           # API Endpoints (hazards, weather, routing, drone, places)
│   │   ├── core/                 # App configuration and database engine
│   │   ├── models/               # SQLAlchemy models (predictions, alerts, shelters)
│   │   ├── modules/              # 3-Pillar Modular Architecture
│   │   │   ├── location/         # Pillar 1: Location services & weather
│   │   │   ├── hazards/          # Pillar 2: ML models, segmentation, Gemini scan
│   │   │   └── response/         # Pillar 3: Routing, shelters, drone scanner
│   │   └── services/             # ML Model loaders (Random Forest, UNet)
│   ├── landslide_model.pkl       # Random Forest ML model weights
│   ├── SIH26001_Landslide_UNet.keras # Deep Learning segmentation weights
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── alerts/               # Alert generation and CAP broadcast
│   │   ├── common/               # UI components, modals, banners, error boundaries
│   │   ├── dashboard/            # Modular responsive dashboard widgets
│   │   ├── drone/                # AI Drone Rescue Scanner & video player
│   │   ├── evacuation/           # Evacuation routing and shelter finder
│   │   ├── layout/               # Header, Sidebar, Footer, Navigation
│   │   └── map/                  # GIS Map, hazard heatmaps, layer toggles
│   ├── context/                  # DisasterManagementContext & State Management
│   ├── i18n/                     # Localization files (en, te, hi, ta, ml, kn)
│   ├── modules/                  # Frontend modular service client layer
│   ├── types/                    # TypeScript interfaces and hazard data models
│   └── App.tsx
├── public/                       # Assets, demo drone video, logos
├── index.html                    # Single Page App entry with DisasterGuard branding
└── package.json
```

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will be available at `http://localhost:8000` (Swagger docs at `/docs`).

### 2. Frontend Setup
```bash
npm install
npm run dev
```
The DisasterGuard AI frontend command center will launch at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```

---

## 📄 License & Attribution
Designed and built for automated multi-hazard disaster resilience, risk mitigation, and emergency response.

# DisasterGuard-AI
