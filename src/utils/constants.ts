import { PresetScenario, RiskLevel } from '../types/prediction';
import { MonitoringStation, RiskZonePolygon } from '../types/map';
import { SafeZone } from '../types/evacuation';
import { RiskThresholdConfig, ModelMetadata } from '../types/admin';

// The exact 9 features expected by landslide_model.pkl
export const MODEL_FEATURE_NAMES = [
  'Rainfall_mm',
  'Slope_Angle',
  'Soil_Saturation',
  'Vegetation_Cover',
  'Earthquake_Activity',
  'Proximity_to_Water',
  'Soil_Type_Gravel',
  'Soil_Type_Sand',
  'Soil_Type_Silt'
] as const;

// Default configurable thresholds
export const DEFAULT_RISK_THRESHOLDS: RiskThresholdConfig = {
  lowMax: 20,
  moderateMax: 40,
  elevatedMax: 60,
  highMax: 80,
  criticalMin: 81,
  rainfallWarningMm: 75,
  rainfallCriticalMm: 120,
};

// Official model metadata (strictly adhering to landslide_model.pkl)
export const MODEL_METADATA: ModelMetadata = {
  modelName: 'Landslide Early Warning Classifier',
  version: '2.4.1-SIH26',
  architecture: 'Random Forest Classifier (scikit-learn)',
  fileReference: 'landslide_model.pkl',
  featuresCount: 9,
  featuresList: [...MODEL_FEATURE_NAMES],
  trainingTimestamp: '2026-08-15T10:00:00Z',
  datasetName: 'GSI & IMD Geological Landslide Hazard Multi-sensor Repository',
  samplesCount: 48500,
  metrics: {
    accuracy: 0.934,
    precision: 0.912,
    recall: 0.948,
    f1Score: 0.930,
    rocAuc: 0.968
  }
};

// Preset Scenarios for quick evaluation / SIH demo
export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'monsoon-critical',
    name: 'Monsoon Torrential Downpour (Critical)',
    category: 'Monsoon Extreme',
    description: 'High rainfall, steep 38° slope, 88% soil saturation with high water proximity and silt soil.',
    input: {
      Rainfall_mm: 135,
      Slope_Angle: 38,
      Soil_Saturation: 88,
      Vegetation_Cover: 22,
      Earthquake_Activity: 0.3,
      Proximity_to_Water: 80,
      soilType: 'Silt'
    }
  },
  {
    id: 'wayanad-high-risk',
    name: 'Western Ghats Slope Saturation (High)',
    category: 'Monsoon Extreme',
    description: 'Persistent rainfall over 24h on deforested tea estate slope with sandy soil.',
    input: {
      Rainfall_mm: 98,
      Slope_Angle: 32,
      Soil_Saturation: 79,
      Vegetation_Cover: 35,
      Earthquake_Activity: 0.1,
      Proximity_to_Water: 140,
      soilType: 'Sand'
    }
  },
  {
    id: 'seismic-trigger',
    name: 'Himalayan Foothills Moderate Rain + Seismic',
    category: 'Seismic Trigger',
    description: 'Steep gravel slope with tremor activity and moderate precipitation.',
    input: {
      Rainfall_mm: 65,
      Slope_Angle: 42,
      Soil_Saturation: 58,
      Vegetation_Cover: 40,
      Earthquake_Activity: 0.8,
      Proximity_to_Water: 320,
      soilType: 'Gravel'
    }
  },
  {
    id: 'safe-lowland',
    name: 'Dense Forest Low-Risk Valley (Safe)',
    category: 'Safe Lowland',
    description: 'Gentle slope with dense canopy cover, gravel soil, and normal rainfall.',
    input: {
      Rainfall_mm: 15,
      Slope_Angle: 12,
      Soil_Saturation: 28,
      Vegetation_Cover: 85,
      Earthquake_Activity: 0.0,
      Proximity_to_Water: 600,
      soilType: 'Gravel'
    }
  }
];

// Key Monitoring Stations across India's most vulnerable landslide corridors
export const MONITORED_STATIONS: MonitoringStation[] = [
  {
    id: 'STN-MUNNAR-01',
    name: 'Munnar Tea Estate Zone A',
    region: 'Idukki District',
    state: 'Kerala',
    coordinates: { lat: 10.0889, lng: 77.0595 },
    riskScore: 87,
    riskLevel: 'CRITICAL',
    prediction: 'High Landslide Probability',
    confidence: 93,
    parameters: {
      rainfall_mm: 124,
      slope_angle: 36,
      soil_saturation: 86,
      vegetation_cover: 30,
      earthquake_activity: 0.2,
      proximity_to_water: 95,
      soil_type: 'Silt'
    },
    lastReading: '4 mins ago',
    status: 'ONLINE'
  },
  {
    id: 'STN-WAYANAD-02',
    name: 'Meppadi - Chooralmala Sector',
    region: 'Wayanad District',
    state: 'Kerala',
    coordinates: { lat: 11.5362, lng: 76.1308 },
    riskScore: 91,
    riskLevel: 'CRITICAL',
    prediction: 'Critical Landslide Warning',
    confidence: 96,
    parameters: {
      rainfall_mm: 148,
      slope_angle: 41,
      soil_saturation: 92,
      vegetation_cover: 24,
      earthquake_activity: 0.15,
      proximity_to_water: 50,
      soil_type: 'Silt'
    },
    lastReading: '2 mins ago',
    status: 'ONLINE'
  },
  {
    id: 'STN-SHIMLA-03',
    name: 'Shimla Ridge - Summer Hill',
    region: 'Shimla District',
    state: 'Himachal Pradesh',
    coordinates: { lat: 31.1048, lng: 77.1734 },
    riskScore: 74,
    riskLevel: 'HIGH',
    prediction: 'Elevated Hazard Detected',
    confidence: 89,
    parameters: {
      rainfall_mm: 86,
      slope_angle: 34,
      soil_saturation: 76,
      vegetation_cover: 42,
      earthquake_activity: 0.4,
      proximity_to_water: 210,
      soil_type: 'Sand'
    },
    lastReading: '8 mins ago',
    status: 'ONLINE'
  },
  {
    id: 'STN-DARJEELING-04',
    name: 'Darjeeling Paglajhora Pass',
    region: 'Darjeeling District',
    state: 'West Bengal',
    coordinates: { lat: 26.9854, lng: 88.2831 },
    riskScore: 56,
    riskLevel: 'ELEVATED',
    prediction: 'Moderate Risk Advisory',
    confidence: 84,
    parameters: {
      rainfall_mm: 58,
      slope_angle: 29,
      soil_saturation: 62,
      vegetation_cover: 55,
      earthquake_activity: 0.3,
      proximity_to_water: 310,
      soil_type: 'Gravel'
    },
    lastReading: '12 mins ago',
    status: 'ONLINE'
  },
  {
    id: 'STN-CHAMOLI-05',
    name: 'Joshimath Helang Corridor',
    region: 'Chamoli District',
    state: 'Uttarakhand',
    coordinates: { lat: 30.5562, lng: 79.5663 },
    riskScore: 68,
    riskLevel: 'HIGH',
    prediction: 'Slope Subsidence Risk',
    confidence: 90,
    parameters: {
      rainfall_mm: 72,
      slope_angle: 39,
      soil_saturation: 71,
      vegetation_cover: 38,
      earthquake_activity: 0.5,
      proximity_to_water: 180,
      soil_type: 'Gravel'
    },
    lastReading: '6 mins ago',
    status: 'ONLINE'
  },
  {
    id: 'STN-NILGIRIS-06',
    name: 'Coonoor Ghat Section',
    region: 'The Nilgiris',
    state: 'Tamil Nadu',
    coordinates: { lat: 11.3530, lng: 76.7959 },
    riskScore: 32,
    riskLevel: 'MODERATE',
    prediction: 'Normal Low Watch',
    confidence: 86,
    parameters: {
      rainfall_mm: 34,
      slope_angle: 24,
      soil_saturation: 44,
      vegetation_cover: 68,
      earthquake_activity: 0.05,
      proximity_to_water: 420,
      soil_type: 'Sand'
    },
    lastReading: '15 mins ago',
    status: 'ONLINE'
  },
  {
    id: 'STN-DEHRADUN-07',
    name: 'Mussoorie Bypass Valley',
    region: 'Dehradun',
    state: 'Uttarakhand',
    coordinates: { lat: 30.4598, lng: 78.0644 },
    riskScore: 16,
    riskLevel: 'LOW',
    prediction: 'Safe Conditions',
    confidence: 95,
    parameters: {
      rainfall_mm: 12,
      slope_angle: 15,
      soil_saturation: 25,
      vegetation_cover: 82,
      earthquake_activity: 0.0,
      proximity_to_water: 800,
      soil_type: 'Gravel'
    },
    lastReading: '20 mins ago',
    status: 'ONLINE'
  }
];

// Polygonal Risk Zones
export const RISK_ZONES: RiskZonePolygon[] = [
  {
    id: 'ZONE-WAYANAD-RED',
    name: 'Chooralmala Red Polygon Zone',
    riskLevel: 'CRITICAL',
    riskScore: 92,
    landslideProbability: 0.94,
    areaSqKm: 4.8,
    center: { lat: 11.5362, lng: 76.1308 },
    polygon: [
      [11.550, 76.115],
      [11.555, 76.145],
      [11.525, 76.155],
      [11.515, 76.120]
    ]
  },
  {
    id: 'ZONE-MUNNAR-ORANGE',
    name: 'Munnar Valley High Risk Sector',
    riskLevel: 'HIGH',
    riskScore: 84,
    landslideProbability: 0.86,
    areaSqKm: 6.2,
    center: { lat: 10.0889, lng: 77.0595 },
    polygon: [
      [10.105, 77.040],
      [10.110, 77.075],
      [10.070, 77.080],
      [10.065, 77.045]
    ]
  },
  {
    id: 'ZONE-SHIMLA-ORANGE',
    name: 'Shimla Urban Slope Slump Zone',
    riskLevel: 'HIGH',
    riskScore: 74,
    landslideProbability: 0.77,
    areaSqKm: 3.5,
    center: { lat: 31.1048, lng: 77.1734 },
    polygon: [
      [31.118, 77.155],
      [31.120, 77.190],
      [31.090, 77.195],
      [31.088, 77.160]
    ]
  },
  {
    id: 'ZONE-DARJEELING-YELLOW',
    name: 'Paglajhora Moderate Advisory Polygon',
    riskLevel: 'ELEVATED',
    riskScore: 56,
    landslideProbability: 0.58,
    areaSqKm: 5.1,
    center: { lat: 26.9854, lng: 88.2831 },
    polygon: [
      [27.000, 88.265],
      [27.005, 88.300],
      [26.965, 88.305],
      [26.960, 88.270]
    ]
  }
];

// Safe Zones & Relief Shelters
export const SAFE_ZONES: SafeZone[] = [
  {
    id: 'SAFE-01',
    name: 'Government Higher Secondary Relief Camp',
    type: 'Relief Camp',
    location: { lat: 11.5650, lng: 76.1050 },
    capacityTotal: 1200,
    capacityOccupied: 430,
    facilities: ['Medical Dispensary', 'Clean Water', 'Backup Generator', 'Helipad', 'Community Kitchen'],
    contactNumber: '+91 4936 202100',
    isAvailable: true
  },
  {
    id: 'SAFE-02',
    name: 'Munnar Indoor Sports Complex & Center',
    type: 'Higher Ground Stadium',
    location: { lat: 10.1250, lng: 77.0350 },
    capacityTotal: 2500,
    capacityOccupied: 720,
    facilities: ['Trauma Center', 'Communication Node', 'High Elevation Plateau', 'Food Stocks'],
    contactNumber: '+91 4865 230400',
    isAvailable: true
  },
  {
    id: 'SAFE-03',
    name: 'Shimla Central Multi-Purpose Shelter',
    type: 'Community Hall',
    location: { lat: 31.0850, lng: 77.1450 },
    capacityTotal: 1500,
    capacityOccupied: 310,
    facilities: ['Heating', 'Ambulance Station', 'Satellite Phone Link'],
    contactNumber: '+91 177 2801200',
    isAvailable: true
  }
];
