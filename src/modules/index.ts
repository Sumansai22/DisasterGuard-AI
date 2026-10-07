/**
 * ============================================================
 * DISASTERGUARD AI — DISASTER MANAGEMENT PLATFORM CORE MODULES
 * ============================================================
 * Clean, scalable modular architecture for:
 * 1. Location Services (Geocoding, Weather, Environmental Telemetry)
 * 2. Hazards Engine (Multi-Hazard Risk, AI Vision, RF, U-Net, Alerts)
 * 3. Response Engine (Evacuation Corridors, Safe Shelters, Rescue Dispatch)
 */

export * from './location';
export * from './hazards';
export * from './response';

export { locationServices } from './location';
export { hazardsEngine } from './hazards';
export { responseEngine } from './response';
