/**
 * ============================================================
 * RESPONSE ENGINE MODULE
 * ============================================================
 * Handles evacuation route calculation with safety corridors,
 * location-aware emergency shelters, critical infrastructure routing,
 * drone distress lifecycle tracking, and rescue team dispatch.
 */

import { evacuationService } from '../../services/evacuationService';
import { droneRescueService } from '../../services/droneRescueService';

export * from '../../types/evacuation';

export const responseEngine = {
  // Evacuation Corridors & Safety Analysis
  evacuation: evacuationService,
  searchPlaces: evacuationService.searchPlaces.bind(evacuationService),
  getSafeZones: evacuationService.getSafeZones.bind(evacuationService),
  getHazardZones: evacuationService.getHazardZones.bind(evacuationService),
  calculateRoute: evacuationService.calculateRoute.bind(evacuationService),

  // Search & Rescue Incident Dispatch
  rescue: {
    listIncidents: droneRescueService.listIncidents.bind(droneRescueService),
    verifyIncident: droneRescueService.verifyIncident.bind(droneRescueService),
    markFalsePositive: droneRescueService.markFalsePositive.bind(droneRescueService),
    dispatchRescue: droneRescueService.dispatchRescue.bind(droneRescueService),
  },
};

export default responseEngine;
