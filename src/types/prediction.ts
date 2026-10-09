export type SoilType = 'Gravel' | 'Sand' | 'Silt';

export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

// EXACT 9 features required by landslide_model.pkl (RandomForestClassifier)
export interface PredictionInput {
  Rainfall_mm: number;
  Slope_Angle: number;
  Soil_Saturation: number;
  Vegetation_Cover: number;
  Earthquake_Activity: number;
  Proximity_to_Water: number;
  Soil_Type_Gravel: number;
  Soil_Type_Sand: number;
  Soil_Type_Silt: number;
}

export interface PredictionFormValues {
  Rainfall_mm: number;
  Slope_Angle: number;
  Soil_Saturation: number;
  Vegetation_Cover: number;
  Earthquake_Activity: number;
  Proximity_to_Water: number;
  soilType: SoilType;
}

export interface FactorContribution {
  name: string;
  value: number | string;
  impact: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  score: number; // 0-100 normalized factor weight
  direction: 'increases' | 'decreases' | 'neutral';
  explanation: string;
}

export interface PredictionResponse {
  prediction: number; // 0 = No Risk, 1 = Risk Detected
  probability?: number; // 0.0 - 1.0
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  confidence: number; // e.g. 91%
  timestamp: string;
  is_demo?: boolean;
  model_name?: string;
  factors?: FactorContribution[];
  explanation?: string;
  shap_values?: Record<string, number>;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  category: 'Monsoon Extreme' | 'Moderate Warning' | 'Safe Lowland' | 'Seismic Trigger';
  input: PredictionFormValues;
}

export type PredictionResultData = PredictionResponse;
