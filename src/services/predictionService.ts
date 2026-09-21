import { apiClient } from './api';
import { PredictionInput, PredictionResponse } from '../types/prediction';
import { calculateInputConditionFactors, getRiskLevelFromScore } from '../utils/riskLevel';

// Simulate accurate model response when offline / backend not yet started
function simulateRandomForestPrediction(input: PredictionInput): PredictionResponse {
  // Domain formula simulating the trained Random Forest classifier:
  // Landslide Risk is primarily driven by:
  // 1. Rainfall (mm) & Soil Saturation (%)
  // 2. Slope Angle (degrees)
  // 3. Soil Type (Silt > Sand > Gravel)
  // 4. Vegetation Cover (inverse effect)
  // 5. Earthquake Activity & Water Proximity

  let risk = 0;
  
  // Rainfall weight
  risk += (Math.min(input.Rainfall_mm, 200) / 200) * 35;

  // Slope weight
  risk += (Math.min(input.Slope_Angle, 60) / 60) * 25;

  // Soil Saturation weight
  risk += (input.Soil_Saturation / 100) * 20;

  // Vegetation Cover protection (-15 to 0)
  risk -= (input.Vegetation_Cover / 100) * 15;

  // Soil Type factor: Silt (+10), Sand (+5), Gravel (0)
  if (input.Soil_Type_Silt === 1) risk += 12;
  else if (input.Soil_Type_Sand === 1) risk += 6;
  else if (input.Soil_Type_Gravel === 1) risk += 1;

  // Earthquake vibration
  risk += Math.min(input.Earthquake_Activity * 15, 15);

  // Proximity to water (closer = higher risk)
  if (input.Proximity_to_Water < 100) risk += 10;
  else if (input.Proximity_to_Water < 250) risk += 5;

  // Clamp risk score between 5 and 98
  const riskScore = Math.max(5, Math.min(98, Math.round(risk)));
  const probability = Number((riskScore / 100).toFixed(2));
  const riskLevel = getRiskLevelFromScore(riskScore);
  const prediction = riskScore >= 45 ? 1 : 0;
  const confidence = Math.min(98, Math.max(82, Math.round(85 + (riskScore > 50 ? riskScore * 0.12 : (100 - riskScore) * 0.1))));

  let explanation = '';
  if (riskScore >= 75) {
    explanation = 'Critical combination of intense rainfall, saturated soil layers, and steep terrain creates severe pore-water destabilization.';
  } else if (riskScore >= 50) {
    explanation = 'Elevated hazard detected due to significant slope gradient and reduced soil shear strength under current precipitation.';
  } else if (riskScore >= 30) {
    explanation = 'Moderate risk advisory: slope remains stable under current conditions, but caution is advised if rainfall increases.';
  } else {
    explanation = 'Stable terrain with robust vegetation cover and low soil moisture. Landslide risk is minimal.';
  }

  return {
    prediction,
    probability,
    risk_score: riskScore,
    risk_level: riskLevel,
    confidence,
    timestamp: new Date().toISOString(),
    is_demo: true,
    model_name: 'landslide_model.pkl (RandomForestClassifier)',
    factors: calculateInputConditionFactors(input),
    explanation,
    shap_values: {
      Rainfall_mm: Number(((input.Rainfall_mm / 150) * 0.35).toFixed(3)),
      Slope_Angle: Number(((input.Slope_Angle / 45) * 0.25).toFixed(3)),
      Soil_Saturation: Number(((input.Soil_Saturation / 100) * 0.20).toFixed(3)),
      Vegetation_Cover: Number((-(input.Vegetation_Cover / 100) * 0.15).toFixed(3)),
      Proximity_to_Water: Number((input.Proximity_to_Water < 150 ? 0.08 : 0.02).toFixed(3)),
      Earthquake_Activity: Number((input.Earthquake_Activity * 0.1).toFixed(3)),
    }
  };
}

export const predictionService = {
  /**
   * Send the exact 9 features to POST /api/predict
   */
  async predictRisk(input: PredictionInput, forceMock = false): Promise<PredictionResponse> {
    if (forceMock) {
      // Simulate network latency for realism
      await new Promise((resolve) => setTimeout(resolve, 600));
      return simulateRandomForestPrediction(input);
    }

    try {
      const response = await apiClient.post<PredictionResponse>('/predict', input);
      const data = response.data;
      
      // Enhance with explanation factors if backend does not provide them
      if (!data.factors) {
        data.factors = calculateInputConditionFactors(input);
      }
      if (!data.risk_level) {
        data.risk_level = getRiskLevelFromScore(data.risk_score);
      }
      if (!data.confidence) {
        data.confidence = 91;
      }
      return data;
    } catch (error) {
      console.warn('[predictionService] Backend /api/predict unavailable, using simulated model response:', error);
      // Fallback to simulated offline model calculation
      await new Promise((resolve) => setTimeout(resolve, 400));
      return simulateRandomForestPrediction(input);
    }
  }
};
