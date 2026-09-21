import React, { createContext, useContext, useState } from 'react';
import { PredictionFormValues, PredictionResponse, PredictionInput } from '../types/prediction';
import { predictionService } from '../services/predictionService';
import { encodeSoilType } from '../utils/riskLevel';
import { useApp } from './AppContext';

interface PredictionContextType {
  formValues: PredictionFormValues;
  setFormValues: React.Dispatch<React.SetStateAction<PredictionFormValues>>;
  latestResult: PredictionResponse | null;
  isLoading: boolean;
  error: string | null;
  predictionHistory: PredictionResponse[];
  runPrediction: (values?: PredictionFormValues) => Promise<PredictionResponse | null>;
  loadPreset: (values: PredictionFormValues) => void;
  resetForm: () => void;
}

const DEFAULT_FORM_VALUES: PredictionFormValues = {
  Rainfall_mm: 118,
  Slope_Angle: 36,
  Soil_Saturation: 84,
  Vegetation_Cover: 32,
  Earthquake_Activity: 0.2,
  Proximity_to_Water: 120,
  soilType: 'Silt',
};

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode } = useApp();
  const [formValues, setFormValues] = useState<PredictionFormValues>(DEFAULT_FORM_VALUES);
  const [latestResult, setLatestResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionResponse[]>([]);

  const runPrediction = async (customValues?: PredictionFormValues): Promise<PredictionResponse | null> => {
    const values = customValues || formValues;
    setIsLoading(true);
    setError(null);

    // Build the EXACT 9 features required by landslide_model.pkl
    const soilEncoded = encodeSoilType(values.soilType);
    const payload: PredictionInput = {
      Rainfall_mm: Number(values.Rainfall_mm),
      Slope_Angle: Number(values.Slope_Angle),
      Soil_Saturation: Number(values.Soil_Saturation),
      Vegetation_Cover: Number(values.Vegetation_Cover),
      Earthquake_Activity: Number(values.Earthquake_Activity),
      Proximity_to_Water: Number(values.Proximity_to_Water),
      Soil_Type_Gravel: soilEncoded.Soil_Type_Gravel,
      Soil_Type_Sand: soilEncoded.Soil_Type_Sand,
      Soil_Type_Silt: soilEncoded.Soil_Type_Silt,
    };

    try {
      const result = await predictionService.predictRisk(payload, isDemoMode);
      setLatestResult(result);
      setPredictionHistory((prev) => [result, ...prev.slice(0, 9)]);
      return result;
    } catch (err: any) {
      const message = err?.message || 'Unable to connect to prediction model service.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (presetInput: PredictionFormValues) => {
    setFormValues({ ...presetInput });
  };

  const resetForm = () => {
    setFormValues(DEFAULT_FORM_VALUES);
  };

  return (
    <PredictionContext.Provider
      value={{
        formValues,
        setFormValues,
        latestResult,
        isLoading,
        error,
        predictionHistory,
        runPrediction,
        loadPreset,
        resetForm,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return context;
};
