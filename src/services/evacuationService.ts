import { apiClient } from './api';
import { SafeZone, EvacuationRoutePlan } from '../types/evacuation';
import { SAFE_ZONES } from '../utils/constants';

let safeZonesState = [...SAFE_ZONES];

export const evacuationService = {
  async getSafeZones(): Promise<SafeZone[]> {
    try {
      const response = await apiClient.get<SafeZone[]>('/safe-zones');
      return response.data;
    } catch (error) {
      return safeZonesState;
    }
  },

  async calculateRoute(originLat: number, originLng: number, safeZoneId: string): Promise<EvacuationRoutePlan> {
    try {
      const response = await apiClient.post<EvacuationRoutePlan>('/evacuation-route', {
        originLat,
        originLng,
        safeZoneId
      });
      return response.data;
    } catch (error) {
      // Simulate shortest-path obstacle-avoiding evacuation route
      const safeZone = safeZonesState.find(s => s.id === safeZoneId) || safeZonesState[0];
      
      // Build realistic waypoints between origin and safe zone
      const latDiff = safeZone.location.lat - originLat;
      const lngDiff = safeZone.location.lng - originLng;

      const waypoints: [number, number][] = [
        [originLat, originLng],
        [originLat + latDiff * 0.25 + 0.003, originLng + lngDiff * 0.2 - 0.002],
        [originLat + latDiff * 0.55 - 0.002, originLng + lngDiff * 0.6 + 0.003],
        [originLat + latDiff * 0.85 + 0.001, originLng + lngDiff * 0.85 + 0.001],
        [safeZone.location.lat, safeZone.location.lng]
      ];

      return {
        id: `ROUTE-SIM-${Date.now()}`,
        affectedZoneId: 'ACTIVE-ZONE',
        affectedZoneName: 'Origin Monitoring Zone',
        originCoordinates: { lat: originLat, lng: originLng },
        targetSafeZone: safeZone,
        distanceKm: 3.2,
        estimatedTimeMin: 9,
        routeSafety: 'SAFE',
        waypoints,
        steps: [
          {
            stepNumber: 1,
            instruction: 'Head North-West away from active slope drainage channel towards Ridge Road.',
            distanceMeters: 600,
            status: 'SAFE'
          },
          {
            stepNumber: 2,
            instruction: 'Turn right at the tea factory junction onto reinforced State Highway bypass.',
            distanceMeters: 1400,
            hazardNote: 'Avoid lower shoulder near stream bank.',
            status: 'CAUTION'
          },
          {
            stepNumber: 3,
            instruction: 'Proceed straight along the elevated plateau pass directly into the relief camp gates.',
            distanceMeters: 1200,
            status: 'SAFE'
          }
        ],
        isSimulation: true,
        generatedAt: new Date().toISOString()
      };
    }
  }
};
