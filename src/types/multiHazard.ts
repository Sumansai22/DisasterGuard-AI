export type HazardType =
  | 'ALL'
  | 'LANDSLIDE'
  | 'FLASH_FLOOD'
  | 'CLOUDBURST'
  | 'CYCLONE'
  | 'DEBRIS_FLOW'
  | 'EARTHQUAKE'
  | 'URBAN_FLOOD'
  | 'WILDFIRE'
  | 'HEATWAVE';

export interface HazardProfile {
  id: HazardType;
  name: string;
  shortName: string;
  iconName: string;
  emoji: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  primaryTriggers: string[];
  monitoringParameters: string[];
  thresholdUnit: string;
}

export interface HazardScoreBreakdown {
  type: HazardType;
  name: string;
  score: number; // 0-100
  level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  status: 'NORMAL' | 'MONITORING' | 'WARNING' | 'CRITICAL_ALERT';
  primaryTrigger: string;
  confidence: number;
  cascadingThreat: string | null;
  keyMetrics: Record<string, string | number>;
  trend: 'RISING' | 'STABLE' | 'RECEDING';
}

export interface HazardSpecificExposure {
  hazard_type: string;
  title: string;
  affected_area_km2: number;
  population_exposed: number;
  vulnerable_demographics: {
    elderly: number;
    children: number;
  };
  roads_exposed_km: number;
  hospitals_exposed: number;
  schools_exposed: number;
  critical_facilities_exposed: number;
  verified_shelters_available: number;
  severity: string;
  confidence: number;
  evacuation_priority: string;
  cascading_threat: string;
  source: string;
  data_status: string;
  specific_metrics: Record<string, string | number>;
  recommended_action: string;
}

export interface MultiHazardAssessment {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    isMonitored: boolean;
  };
  compositeRiskScore: number; // 0-100
  compositeRiskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  dominantHazard: HazardType;
  activeHazardsCount: number;
  hazards: HazardScoreBreakdown[];
  hazardExposures?: Record<string, HazardSpecificExposure>;
  cascadingChain: {
    primary: HazardType;
    secondary: HazardType[];
    triggerCondition: string;
    severityMultiplier: number;
  }[];
  impactExposure: {
    estimatedPopulationAtRisk: number;
    vulnerableDemographics: {
      elderlyCount: number;
      childrenCount: number;
      hospitalizedCount: number;
    };
    criticalAssetsExposed: number;
    transportCorridorsAffected: number;
    safeSheltersAvailable: number;
  };
  emergencyResponse: {
    alertLevel: 'ADVISORY' | 'WATCH' | 'WARNING' | 'EMERGENCY_EVACUATION';
    ndmaProtocolCode: string;
    leadAgency: string;
    recommendedActions: string[];
    evacuationPriority: 'NONE' | 'STANDBY' | 'VOLUNTARY' | 'MANDATORY';
  };
  timestamp: string;
}

export const HAZARD_PROFILES: Record<HazardType, HazardProfile> = {
  ALL: {
    id: 'ALL',
    name: 'All Hazards (Composite DSS)',
    shortName: 'All Hazards',
    iconName: 'ShieldAlert',
    emoji: '🌐',
    color: '#3b82f6',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-800',
    description: 'Unified composite multi-hazard risk across all meteorological and geological vectors.',
    primaryTriggers: ['Composite Threshold Exceedance', 'Compound Weather Event'],
    monitoringParameters: ['Composite Index', 'Cross-Hazard Surcharge'],
    thresholdUnit: 'Index (0-100)',
  },
  LANDSLIDE: {
    id: 'LANDSLIDE',
    name: 'Landslide & Slope Instability',
    shortName: 'Landslide',
    iconName: 'Mountain',
    emoji: '🏔️',
    color: '#ea580c',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-200',
    badgeText: 'text-orange-800',
    description: 'Slope gravitational failure triggered by intense precipitation, soil pore-pressure, and seismic shear.',
    primaryTriggers: ['Pore Water Pressure > 75%', 'Slope Incline > 32°', 'Cumulative Rain > 120mm'],
    monitoringParameters: ['Rainfall (mm)', 'Slope Angle (°)', 'Soil Saturation (%)', 'U-Net Satellite Segmentation'],
    thresholdUnit: 'Pore Saturation %',
  },
  FLASH_FLOOD: {
    id: 'FLASH_FLOOD',
    name: 'Flash Flood & River Inundation',
    shortName: 'Flash Flood',
    iconName: 'Waves',
    emoji: '🌊',
    color: '#0284c7',
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-200',
    badgeText: 'text-sky-800',
    description: 'Rapid catchment water level surge, riverbank overtopping, and low-lying inundation.',
    primaryTriggers: ['River Hydrograph Surcharge > 85%', 'Catchment Runoff Surcharge', 'Upstream Dam Discharge'],
    monitoringParameters: ['River Discharge (m³/s)', 'Gauge Stage (m)', 'Runoff Coefficient'],
    thresholdUnit: 'River Stage (m)',
  },
  CLOUDBURST: {
    id: 'CLOUDBURST',
    name: 'Cloudburst & Severe Convective Storm',
    shortName: 'Cloudburst',
    iconName: 'CloudRain',
    emoji: '⛈️',
    color: '#6366f1',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-800',
    description: 'Sudden, aggressive localized precipitation exceeding 100mm/hr over a small geographic cell.',
    primaryTriggers: ['Doppler Reflectivity > 55 dBZ', 'Precipitation Rate > 100 mm/hr', 'Cloud Top Temperature < -60°C'],
    monitoringParameters: ['Doppler Radar (dBZ)', 'Pluviometer Surge (mm/hr)', 'CAPE Index'],
    thresholdUnit: 'mm/hr',
  },
  CYCLONE: {
    id: 'CYCLONE',
    name: 'Cyclone & Coastal Storm Surge',
    shortName: 'Cyclone',
    iconName: 'Wind',
    emoji: '🌪️',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-800',
    description: 'Tropical cyclonic vortex causing destructive wind gusts, tidal storm surges, and torrential downpours.',
    primaryTriggers: ['Sustained Wind > 88 km/h', 'Central Pressure < 980 hPa', 'Tidal Surge > 1.5m'],
    monitoringParameters: ['Wind Gust (km/h)', 'Barometric Pressure (hPa)', 'Tidal Gauge (m)'],
    thresholdUnit: 'Wind Speed (km/h)',
  },
  DEBRIS_FLOW: {
    id: 'DEBRIS_FLOW',
    name: 'Debris Flow & Rockfall',
    shortName: 'Debris Flow',
    iconName: 'Layers',
    emoji: '🪨',
    color: '#d97706',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    description: 'High-velocity gravitational torrent of water-saturated rock, soil, and boulders down steep gullies.',
    primaryTriggers: ['Gully Channel Surcharge', 'Cohesive Shear Failure', 'Unconsolidated Colluvium'],
    monitoringParameters: ['Acoustic Emission (Hz)', 'Gully Flow Velocity (m/s)', 'Colluvium Depth (m)'],
    thresholdUnit: 'Velocity (m/s)',
  },
  EARTHQUAKE: {
    id: 'EARTHQUAKE',
    name: 'Seismic & Fault Destabilization',
    shortName: 'Earthquake',
    iconName: 'Activity',
    emoji: '⚡',
    color: '#dc2626',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-800',
    description: 'Tectonic fault rupture causing seismic ground acceleration and secondary slope liquefaction.',
    primaryTriggers: ['Peak Ground Acceleration PGA > 0.15g', 'Magnitude > 4.5 M', 'Focal Depth < 15km'],
    monitoringParameters: ['PGA (g)', 'Richter Magnitude', 'Seismograph Velocity (mm/s)'],
    thresholdUnit: 'PGA (g)',
  },
  URBAN_FLOOD: {
    id: 'URBAN_FLOOD',
    name: 'Urban Inundation & Drainage Choke',
    shortName: 'Urban Flood',
    iconName: 'Building',
    emoji: '🏢',
    color: '#0d9488',
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-200',
    badgeText: 'text-teal-800',
    description: 'High impervious surface runoff exceeding municipal stormwater drainage capacity.',
    primaryTriggers: ['Storm Drain Surcharge > 90%', 'Impervious Runoff > 80%', 'Tidal Outfall Backflow'],
    monitoringParameters: ['Drain Surcharge (%)', 'Street Ponding Depth (cm)', 'Pump Station Head (m)'],
    thresholdUnit: 'Ponding Depth (cm)',
  },
  WILDFIRE: {
    id: 'WILDFIRE',
    name: 'Wildfire & Forest Canopy Fire',
    shortName: 'Wildfire',
    iconName: 'Flame',
    emoji: '🔥',
    color: '#f97316',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-200',
    badgeText: 'text-orange-800',
    description: 'Fast-spreading vegetation and forest fire driven by low moisture, high temperature, and wind.',
    primaryTriggers: ['Fuel Dryness > 70%', 'Thermal Hotspot Anomaly', 'Surface Wind > 25 km/h'],
    monitoringParameters: ['MODIS Thermal Hotspots', 'Soil Moisture (%)', 'Wind Velocity (km/h)'],
    thresholdUnit: 'Hotspot Count',
  },
  HEATWAVE: {
    id: 'HEATWAVE',
    name: 'Extreme Heatwave & Thermal Stress',
    shortName: 'Heatwave',
    iconName: 'Sun',
    emoji: '🌡️',
    color: '#f59e0b',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    description: 'Abnormally high diurnal surface and ambient temperature exceeding regional climatological thresholds.',
    primaryTriggers: ['Ambient Temp > 40°C (Plains) / 30°C (Hills)', 'Heat Index > 45°C', 'Consecutive Days > 3'],
    monitoringParameters: ['Ambient Temperature (°C)', 'Heat Index (°C)', 'Wet Bulb Temp (°C)'],
    thresholdUnit: '°C',
  },
};
