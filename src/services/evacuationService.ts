import { apiClient } from './api';
import { SafeZone, EvacuationRoutePlan, HazardZoneInfo, TravelMode, PlaceSearchResult, LocationPointData } from '../types/evacuation';

export const evacuationService = {
  /**
   * Search real places and addresses with coordinates via backend geocoding endpoint
   */
  async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await apiClient.get<{ results: PlaceSearchResult[] }>('/evacuation/search-place', {
        params: { q: query.trim() },
      });
      return response.data.results || [];
    } catch (err) {
      console.warn('[evacuationService] Search place fallback note:', err);
      return [];
    }
  },

  /**
   * Fetches location-filtered emergency safe zones relative to given coordinates
   */
  async getSafeZones(latitude?: number, longitude?: number, radiusKm: number = 120): Promise<SafeZone[]> {
    try {
      const params: Record<string, any> = { radius_km: radiusKm };
      if (latitude !== undefined && longitude !== undefined) {
        params.latitude = latitude;
        params.longitude = longitude;
      }
      const response = await apiClient.get<{ shelters: SafeZone[]; results?: SafeZone[] }>('/evacuation/shelters', { params });
      return response.data.shelters || response.data.results || [];
    } catch (err) {
      console.warn('[evacuationService] Error fetching location-based shelters:', err);
      return [];
    }
  },

  /**
   * Fetches active landslide hazard zones and buffer epicenters from the backend
   */
  async getHazardZones(): Promise<HazardZoneInfo[]> {
    try {
      const response = await apiClient.get<HazardZoneInfo[]>('/evacuation/hazard-zones');
      return response.data;
    } catch {
      return [];
    }
  },

  /**
   * Computes multi-modal road/pathway evacuation routes between FROM and TO
   */
  async calculateRoute(params: {
    origin: LocationPointData;
    destination?: LocationPointData;
    safeZoneId?: string;
    safehouse_id?: string;
    travelMode?: TravelMode;
    travel_mode?: TravelMode;
  }): Promise<EvacuationRoutePlan> {
    const mode = params.travelMode || params.travel_mode || 'DRIVE';
    const payload: Record<string, any> = {
      origin: {
        name: params.origin.name,
        latitude: params.origin.latitude,
        longitude: params.origin.longitude,
        formatted_address: params.origin.formatted_address || params.origin.name,
      },
      originLat: params.origin.latitude,
      originLng: params.origin.longitude,
      originName: params.origin.name,
      travel_mode: mode,
      travelMode: mode,
    };

    if (params.destination) {
      payload.destination = {
        name: params.destination.name,
        latitude: params.destination.latitude,
        longitude: params.destination.longitude,
        formatted_address: params.destination.formatted_address || params.destination.name,
      };
      payload.destLat = params.destination.latitude;
      payload.destLng = params.destination.longitude;
      payload.destName = params.destination.name;
    }

    if (params.safeZoneId) {
      payload.safehouse_id = params.safeZoneId;
      payload.safeZoneId = params.safeZoneId;
    }

    const response = await apiClient.post<EvacuationRoutePlan>('/evacuation/routes', payload);
    return response.data;
  },
};
