/**
 * ============================================================
 * HAZARDS ENGINE MODULE
 * ============================================================
 * Core analytics, risk assessment, AI vision, Random Forest, 
 * U-Net segmentation, rainfall analytics, and early alerts.
 */

import { multiHazardService } from '../../services/multiHazardService';
import { predictionService } from '../../services/predictionService';
import { landScanService } from '../../services/landScanService';
import { rainfallService } from '../../services/rainfallService';
import { exposureService } from '../../services/exposureService';
import { alertService } from '../../services/alertService';
import { droneRescueService } from '../../services/droneRescueService';
import { mapService } from '../../services/mapService';

export * from '../../types/multiHazard';
export * from '../../types/prediction';
export * from '../../types/landScan';
export * from '../../types/rainfall';
export * from '../../types/exposure';
export * from '../../types/alerts';
export * from '../../types/droneRescue';

export const hazardsEngine = {
  // Multi-Hazard Risk Scoring & Profiles
  multiHazard: multiHazardService,
  getAssessment: multiHazardService.getAssessment.bind(multiHazardService),
  getHazardTypes: multiHazardService.getHazardTypes.bind(multiHazardService),
  getSummary: multiHazardService.getSummary.bind(multiHazardService),

  // Landslide Risk ML Predictor (Random Forest)
  prediction: predictionService,
  predictLandslideRisk: predictionService.predictRisk.bind(predictionService),

  // Satellite & Drone Land Scan (U-Net + Gemini Vision)
  landScan: landScanService,
  analyzeLandImage: landScanService.analyzeLandImage.bind(landScanService),
  getModelStatus: landScanService.getModelStatus.bind(landScanService),
  getScanHistory: landScanService.getScanHistory.bind(landScanService),

  // Drone Vision & Distress AI Scanner
  droneVision: droneRescueService,
  getPresets: droneRescueService.getPresets.bind(droneRescueService),
  analyzeDronePreset: droneRescueService.analyzePreset.bind(droneRescueService),
  uploadDroneFootage: droneRescueService.uploadFootage.bind(droneRescueService),
  getDroneTelemetry: droneRescueService.getTelemetry.bind(droneRescueService),

  // Rainfall & Hydro-Meteorological Engine
  rainfall: rainfallService,
  getRainfallOverview: rainfallService.getOverview.bind(rainfallService),
  getRainfallHistory: rainfallService.getHistory.bind(rainfallService),

  // Population, Infrastructure & Exposure Analysis
  exposure: exposureService,
  getExposureData: exposureService.getExposureData.bind(exposureService),

  // Early Warning Alerts & Notifications
  alerts: alertService,
  getActiveAlerts: alertService.getAlerts.bind(alertService),
  createAlert: alertService.createAlert.bind(alertService),
  updateAlertStatus: alertService.updateStatus.bind(alertService),

  // GIS Disaster Map Data
  gisMap: mapService,
  getRiskZones: mapService.getRiskZones.bind(mapService),
  getMonitoringStations: mapService.getMonitoringStations.bind(mapService),
  getDisasterMapContext: mapService.getDisasterMapContext.bind(mapService),
};

export default hazardsEngine;
