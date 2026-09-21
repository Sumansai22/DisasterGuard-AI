import { PredictionFormValues } from '../types/prediction';

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof PredictionFormValues, string>>;
}

export function validatePredictionInput(values: PredictionFormValues): ValidationResult {
  const errors: Partial<Record<keyof PredictionFormValues, string>> = {};

  if (values.Rainfall_mm < 0 || isNaN(values.Rainfall_mm)) {
    errors.Rainfall_mm = 'Rainfall must be a non-negative number (≥ 0 mm).';
  } else if (values.Rainfall_mm > 1000) {
    errors.Rainfall_mm = 'Rainfall value exceeds realistic upper limit (1000 mm).';
  }

  if (values.Slope_Angle < 0 || values.Slope_Angle > 90 || isNaN(values.Slope_Angle)) {
    errors.Slope_Angle = 'Slope Angle must be between 0° and 90°.';
  }

  if (values.Soil_Saturation < 0 || values.Soil_Saturation > 100 || isNaN(values.Soil_Saturation)) {
    errors.Soil_Saturation = 'Soil Saturation must be between 0% and 100%.';
  }

  if (values.Vegetation_Cover < 0 || values.Vegetation_Cover > 100 || isNaN(values.Vegetation_Cover)) {
    errors.Vegetation_Cover = 'Vegetation Cover must be between 0% and 100%.';
  }

  if (values.Earthquake_Activity < 0 || isNaN(values.Earthquake_Activity)) {
    errors.Earthquake_Activity = 'Earthquake Activity must be a non-negative value (≥ 0.0).';
  }

  if (values.Proximity_to_Water < 0 || isNaN(values.Proximity_to_Water)) {
    errors.Proximity_to_Water = 'Proximity to Water must be a non-negative distance (≥ 0 m).';
  }

  if (!values.soilType || !['Gravel', 'Sand', 'Silt'].includes(values.soilType)) {
    errors.soilType = 'Please select a valid soil type (Gravel, Sand, or Silt).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
