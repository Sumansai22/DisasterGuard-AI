import axios from 'axios';
import { SearchedLocation, MonitoringStation } from '../types/map';
import { MONITORED_STATIONS } from '../utils/constants';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// Fallback offline coordinates for well-known Indian cities/regions to ensure SIH demo works in offline/firewalled networks
const OFFLINE_GEO_FALLBACK: Record<string, { lat: number; lng: number; displayName: string; state: string; country: string }> = {
  'macherla': { lat: 16.4806, lng: 79.4328, displayName: 'Macherla, Palnadu District, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, displayName: 'Hyderabad, Telangana, India', state: 'Telangana', country: 'India' },
  'chennai': { lat: 13.0827, lng: 80.2707, displayName: 'Chennai, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, displayName: 'Bengaluru, Karnataka, India', state: 'Karnataka', country: 'India' },
  'bangalore': { lat: 12.9716, lng: 77.5946, displayName: 'Bengaluru, Karnataka, India', state: 'Karnataka', country: 'India' },
  'mumbai': { lat: 19.0760, lng: 72.8777, displayName: 'Mumbai, Maharashtra, India', state: 'Maharashtra', country: 'India' },
  'manali': { lat: 32.2396, lng: 77.1887, displayName: 'Manali, Kullu District, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'kullu': { lat: 31.9579, lng: 77.1095, displayName: 'Kullu, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'mandi': { lat: 31.7087, lng: 76.9320, displayName: 'Mandi, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'gangtok': { lat: 27.3389, lng: 88.6065, displayName: 'Gangtok, Sikkim, India', state: 'Sikkim', country: 'India' },
  'shimla': { lat: 31.1048, lng: 77.1734, displayName: 'Shimla, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'darjeeling': { lat: 26.9854, lng: 88.2831, displayName: 'Darjeeling, West Bengal, India', state: 'West Bengal', country: 'India' },
  'munnar': { lat: 10.0889, lng: 77.0595, displayName: 'Munnar, Idukki District, Kerala, India', state: 'Kerala', country: 'India' },
  'wayanad': { lat: 11.5362, lng: 76.1308, displayName: 'Wayanad District, Kerala, India', state: 'Kerala', country: 'India' },
  'dehradun': { lat: 30.3165, lng: 78.0322, displayName: 'Dehradun, Uttarakhand, India', state: 'Uttarakhand', country: 'India' },
  'delhi': { lat: 28.6139, lng: 77.2090, displayName: 'New Delhi, Delhi, India', state: 'Delhi', country: 'India' },
};

// Calculate Haversine distance in KM
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find if location corresponds to an active monitoring station
function matchMonitoredStation(
  name: string,
  lat: number,
  lng: number,
  stations: MonitoringStation[] = MONITORED_STATIONS
): MonitoringStation | undefined {
  const lowerName = name.toLowerCase();

  // 1. Direct name or region match
  const directMatch = stations.find((stn) => {
    const stnName = stn.name.toLowerCase();
    const stnRegion = stn.region.toLowerCase();
    return (
      lowerName.includes(stnName) ||
      stnName.includes(lowerName) ||
      lowerName.includes(stnRegion) ||
      stnRegion.includes(lowerName)
    );
  });

  if (directMatch) return directMatch;

  // 2. Proximity match (< 15km to an existing sensor node)
  const proximityMatch = stations.find((stn) => {
    const dist = getDistanceKm(lat, lng, stn.coordinates.lat, stn.coordinates.lng);
    return dist <= 15;
  });

  return proximityMatch;
}

export const geocodingService = {
  /**
   * Search global locations using OpenStreetMap Nominatim with fallback resilience
   */
  async searchLocations(
    query: string,
    stations: MonitoringStation[] = MONITORED_STATIONS
  ): Promise<SearchedLocation[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      return [];
    }

    try {
      const response = await axios.get<NominatimResult[]>(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: cleanQuery,
            format: 'json',
            limit: 6,
            addressdetails: 1,
          },
          headers: {
            'Accept-Language': 'en',
          },
          timeout: 4500,
        }
      );

      if (response.data && response.data.length > 0) {
        return response.data.map((item) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const placeName =
            item.name ||
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.display_name.split(',')[0];

          const matchedStation = matchMonitoredStation(placeName, lat, lng, stations);

          return {
            placeId: item.place_id,
            name: placeName,
            displayName: item.display_name,
            lat,
            lng,
            type: item.type,
            category: item.class,
            state: item.address?.state,
            country: item.address?.country,
            isMonitored: Boolean(matchedStation),
            monitoredStation: matchedStation,
          };
        });
      }
    } catch (err) {
      console.warn('[geocodingService] Nominatim online search notice:', err);
    }

    // Offline / Fallback handling for common searched places
    const lower = cleanQuery.toLowerCase();
    const fallbackResults: SearchedLocation[] = [];

    // Check offline dictionary
    for (const [key, val] of Object.entries(OFFLINE_GEO_FALLBACK)) {
      if (key.includes(lower) || lower.includes(key)) {
        const matched = matchMonitoredStation(key, val.lat, val.lng, stations);
        fallbackResults.push({
          placeId: `fallback-${key}`,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          displayName: val.displayName,
          lat: val.lat,
          lng: val.lng,
          state: val.state,
          country: val.country,
          isMonitored: Boolean(matched),
          monitoredStation: matched,
        });
      }
    }

    // Also check if query matches any monitoring stations directly
    for (const stn of stations) {
      if (
        stn.name.toLowerCase().includes(lower) ||
        stn.region.toLowerCase().includes(lower) ||
        stn.state.toLowerCase().includes(lower)
      ) {
        if (!fallbackResults.some((r) => r.name.toLowerCase() === stn.name.toLowerCase())) {
          fallbackResults.unshift({
            placeId: stn.id,
            name: stn.name,
            displayName: `${stn.name}, ${stn.region}, ${stn.state}, India`,
            lat: stn.coordinates.lat,
            lng: stn.coordinates.lng,
            state: stn.state,
            country: 'India',
            isMonitored: true,
            monitoredStation: stn,
          });
        }
      }
    }

    return fallbackResults;
  },
};
