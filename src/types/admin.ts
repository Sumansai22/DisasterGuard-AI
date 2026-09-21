export interface SystemHealthComponent {
  name: string;
  category: 'ML Model' | 'Prediction API' | 'Database' | 'Weather Data' | 'Map Service';
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastChecked: string;
  details: string;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
  source: 'InferenceEngine' | 'SensorsStream' | 'AuthService' | 'AlertDispatcher';
  message: string;
}

export interface RiskThresholdConfig {
  lowMax: number;        // 20
  moderateMax: number;   // 40
  elevatedMax: number;   // 60
  highMax: number;       // 80
  criticalMin: number;   // 81
  rainfallWarningMm: number; // 70 mm
  rainfallCriticalMm: number; // 120 mm
}

export interface ModelMetadata {
  modelName: string;
  version: string;
  architecture: string;
  fileReference: string; // 'landslide_model.pkl'
  featuresCount: number;
  featuresList: string[];
  trainingTimestamp: string;
  datasetName: string;
  samplesCount: number;
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  };
}
