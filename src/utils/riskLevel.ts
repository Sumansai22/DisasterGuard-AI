import { RiskLevel, FactorContribution, PredictionInput, SoilType } from '../types/prediction';
import { DEFAULT_RISK_THRESHOLDS } from './constants';
import { RiskThresholdConfig } from '../types/admin';

export function getRiskLevelFromScore(
  score: number,
  config: RiskThresholdConfig = DEFAULT_RISK_THRESHOLDS
): RiskLevel {
  if (score <= config.lowMax) return 'LOW';
  if (score <= config.moderateMax) return 'MODERATE';
  if (score <= config.elevatedMax) return 'ELEVATED';
  if (score <= config.highMax) return 'HIGH';
  return 'CRITICAL';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW':
      return '#10b981'; // Green
    case 'MODERATE':
      return '#eab308'; // Yellow
    case 'ELEVATED':
      return '#f97316'; // Orange-amber
    case 'HIGH':
      return '#ea580c'; // Orange
    case 'CRITICAL':
      return '#ef4444'; // Red
    default:
      return '#64748b';
  }
}

export function getRiskBadgeClasses(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (level) {
    case 'LOW':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'ELEVATED':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500'
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-900',
        border: 'border-orange-300',
        dot: 'bg-orange-600'
      };
    case 'CRITICAL':
      return {
        bg: 'bg-red-100',
        text: 'text-red-900',
        border: 'border-red-300',
        dot: 'bg-red-600'
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-200',
        dot: 'bg-slate-500'
      };
  }
}

// Convert soil type dropdown into exact 3 one-hot encoded flags
export function encodeSoilType(soil: SoilType): {
  Soil_Type_Gravel: number;
  Soil_Type_Sand: number;
  Soil_Type_Silt: number;
} {
  return {
    Soil_Type_Gravel: soil === 'Gravel' ? 1 : 0,
    Soil_Type_Sand: soil === 'Sand' ? 1 : 0,
    Soil_Type_Silt: soil === 'Silt' ? 1 : 0,
  };
}

export function decodeSoilType(gravel: number, sand: number, silt: number): SoilType {
  if (gravel === 1) return 'Gravel';
  if (sand === 1) return 'Sand';
  return 'Silt';
}

// Transparent Explainable AI Feature Breakdown
export function calculateInputConditionFactors(input: PredictionInput): FactorContribution[] {
  // Compute normalized contribution scores (0-100) based on domain physical risk thresholds
  
  // 1. Rainfall (0 to 200mm scale)
  const rainfallNorm = Math.min(100, (input.Rainfall_mm / 150) * 100);
  const rainfallImpact =
    rainfallNorm > 70 ? 'Very High' : rainfallNorm > 50 ? 'High' : rainfallNorm > 30 ? 'Moderate' : 'Low';

  // 2. Slope Angle (0 to 60 deg scale)
  const slopeNorm = Math.min(100, (input.Slope_Angle / 45) * 100);
  const slopeImpact =
    slopeNorm > 75 ? 'Very High' : slopeNorm > 55 ? 'High' : slopeNorm > 35 ? 'Moderate' : 'Low';

  // 3. Soil Saturation (0 to 100%)
  const satNorm = input.Soil_Saturation;
  const satImpact =
    satNorm > 80 ? 'Very High' : satNorm > 60 ? 'High' : satNorm > 40 ? 'Moderate' : 'Low';

  // 4. Vegetation Cover (Lower cover = higher risk)
  const vegRisk = 100 - input.Vegetation_Cover;
  const vegImpact =
    input.Vegetation_Cover < 25 ? 'Very High' : input.Vegetation_Cover < 45 ? 'High' : input.Vegetation_Cover < 70 ? 'Moderate' : 'Low';

  // 5. Earthquake Activity (0 to 2.0 scale)
  const eqNorm = Math.min(100, (input.Earthquake_Activity / 1.0) * 100);
  const eqImpact =
    input.Earthquake_Activity > 0.6 ? 'High' : input.Earthquake_Activity > 0.2 ? 'Moderate' : 'Low';

  // 6. Water Proximity (Closer = higher risk)
  const waterNorm = Math.max(0, 100 - Math.min(100, (input.Proximity_to_Water / 500) * 100));
  const waterImpact =
    input.Proximity_to_Water < 100 ? 'High' : input.Proximity_to_Water < 300 ? 'Moderate' : 'Low';

  return [
    {
      name: 'Precipitation (Rainfall)',
      value: `${input.Rainfall_mm} mm`,
      impact: rainfallImpact,
      score: Math.round(rainfallNorm),
      direction: input.Rainfall_mm > 60 ? 'increases' : 'neutral',
      explanation: input.Rainfall_mm > 80 ? 'Heavy precipitation causes rapid pore-water pressure buildup.' : 'Rainfall levels within safe hydrological bounds.'
    },
    {
      name: 'Slope Incline',
      value: `${input.Slope_Angle}°`,
      impact: slopeImpact,
      score: Math.round(slopeNorm),
      direction: input.Slope_Angle > 30 ? 'increases' : 'neutral',
      explanation: input.Slope_Angle > 35 ? 'Critical gravitational shear stress on steep gradient.' : 'Moderate or gentle topographical slope.'
    },
    {
      name: 'Soil Moisture Saturation',
      value: `${input.Soil_Saturation}%`,
      impact: satImpact,
      score: Math.round(satNorm),
      direction: input.Soil_Saturation > 70 ? 'increases' : 'neutral',
      explanation: input.Soil_Saturation > 75 ? 'Near-saturation drastically reduces internal soil shear strength.' : 'Adequate soil drainage capacity remaining.'
    },
    {
      name: 'Canopy & Vegetation Cover',
      value: `${input.Vegetation_Cover}%`,
      impact: vegImpact,
      score: Math.round(vegRisk),
      direction: input.Vegetation_Cover < 40 ? 'increases' : 'decreases',
      explanation: input.Vegetation_Cover < 40 ? 'Sparse root matrix offers insufficient mechanical soil binding.' : 'Dense root systems stabilize topsoil layers.'
    },
    {
      name: 'Hydrological Proximity',
      value: `${input.Proximity_to_Water} m`,
      impact: waterImpact,
      score: Math.round(waterNorm),
      direction: input.Proximity_to_Water < 150 ? 'increases' : 'neutral',
      explanation: input.Proximity_to_Water < 150 ? 'Nearby stream or drainage channel exacerbates toe erosion.' : 'Safe distance from major watercourses.'
    },
    {
      name: 'Seismic / Tremor Activity',
      value: `${input.Earthquake_Activity}`,
      impact: eqImpact,
      score: Math.round(eqNorm),
      direction: input.Earthquake_Activity > 0.3 ? 'increases' : 'neutral',
      explanation: input.Earthquake_Activity > 0.3 ? 'Ground vibration can trigger spontaneous slope destabilization.' : 'No significant seismic triggers recorded.'
    }
  ];
}
