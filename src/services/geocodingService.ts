import axios from 'axios';
import { apiClient } from './api';
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
  'nagarjuna sagar': { lat: 16.5780, lng: 79.3140, displayName: 'Nagarjuna Sagar, Palnadu District, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India' },
  'guntur': { lat: 16.3067, lng: 80.4365, displayName: 'Guntur, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India' },
  'vijayawada': { lat: 16.5062, lng: 80.6480, displayName: 'Vijayawada, NTR District, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, displayName: 'Visakhapatnam, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India' },
  'tirupati': { lat: 13.6288, lng: 79.4192, displayName: 'Tirupati, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, displayName: 'Hyderabad, Telangana, India', state: 'Telangana', country: 'India' },
  'secunderabad': { lat: 17.4399, lng: 78.4983, displayName: 'Secunderabad, Telangana, India', state: 'Telangana', country: 'India' },
  'warangal': { lat: 17.9689, lng: 79.5941, displayName: 'Warangal, Telangana, India', state: 'Telangana', country: 'India' },
  'chennai': { lat: 13.0827, lng: 80.2707, displayName: 'Chennai, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India' },
  'chennai central': { lat: 13.0827, lng: 80.2757, displayName: 'Chennai Central, Chennai, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, displayName: 'Coimbatore, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India' },
  'coonoor': { lat: 11.3530, lng: 76.7959, displayName: 'Coonoor, The Nilgiris, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India' },
  'ooty': { lat: 11.4102, lng: 76.6950, displayName: 'Ooty (Udhagamandalam), Tamil Nadu, India', state: 'Tamil Nadu', country: 'India' },
  'madurai': { lat: 9.9252, lng: 78.1198, displayName: 'Madurai, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, displayName: 'Bengaluru, Karnataka, India', state: 'Karnataka', country: 'India' },
  'bangalore': { lat: 12.9716, lng: 77.5946, displayName: 'Bengaluru, Karnataka, India', state: 'Karnataka', country: 'India' },
  'mumbai': { lat: 19.0760, lng: 72.8777, displayName: 'Mumbai, Maharashtra, India', state: 'Maharashtra', country: 'India' },
  'pune': { lat: 18.5204, lng: 73.8567, displayName: 'Pune, Maharashtra, India', state: 'Maharashtra', country: 'India' },
  'manali': { lat: 32.2396, lng: 77.1887, displayName: 'Manali, Kullu District, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'kullu': { lat: 31.9579, lng: 77.1095, displayName: 'Kullu, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'mandi': { lat: 31.7087, lng: 76.9320, displayName: 'Mandi, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'dharamshala': { lat: 32.2190, lng: 76.3234, displayName: 'Dharamshala, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'gangtok': { lat: 27.3389, lng: 88.6065, displayName: 'Gangtok, Sikkim, India', state: 'Sikkim', country: 'India' },
  'shimla': { lat: 31.1048, lng: 77.1734, displayName: 'Shimla, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India' },
  'darjeeling': { lat: 26.9854, lng: 88.2831, displayName: 'Darjeeling, West Bengal, India', state: 'West Bengal', country: 'India' },
  'kolkata': { lat: 22.5726, lng: 88.3639, displayName: 'Kolkata, West Bengal, India', state: 'West Bengal', country: 'India' },
  'munnar': { lat: 10.0889, lng: 77.0595, displayName: 'Munnar, Idukki District, Kerala, India', state: 'Kerala', country: 'India' },
  'wayanad': { lat: 11.5362, lng: 76.1308, displayName: 'Wayanad District, Kerala, India', state: 'Kerala', country: 'India' },
  'meppadi': { lat: 11.5510, lng: 76.1240, displayName: 'Meppadi, Wayanad District, Kerala, India', state: 'Kerala', country: 'India' },
  'chooralmala': { lat: 11.5362, lng: 76.1308, displayName: 'Chooralmala, Wayanad District, Kerala, India', state: 'Kerala', country: 'India' },
  'kochi': { lat: 9.9312, lng: 76.2673, displayName: 'Kochi, Ernakulam District, Kerala, India', state: 'Kerala', country: 'India' },
  'dehradun': { lat: 30.3165, lng: 78.0322, displayName: 'Dehradun, Uttarakhand, India', state: 'Uttarakhand', country: 'India' },
  'joshimath': { lat: 30.5562, lng: 79.5663, displayName: 'Joshimath, Chamoli District, Uttarakhand, India', state: 'Uttarakhand', country: 'India' },
  'chamoli': { lat: 30.4100, lng: 79.3300, displayName: 'Chamoli, Uttarakhand, India', state: 'Uttarakhand', country: 'India' },
  'rishikesh': { lat: 30.0869, lng: 78.2676, displayName: 'Rishikesh, Uttarakhand, India', state: 'Uttarakhand', country: 'India' },
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
  lat: number,
  lng: number,
  stations: MonitoringStation[] = MONITORED_STATIONS
): MonitoringStation | undefined {
  return stations.find((stn) => {
    const dist = getDistanceKm(lat, lng, stn.coordinates.lat, stn.coordinates.lng);
    return dist <= 12; // within 12km
  });
}

export const geocodingService = {
  /**
   * Search global geographic locations (cities, towns, villages, districts, landmarks).
   * Decoupled from predefined telemetry stations.
   */
  async searchLocations(
    query: string,
    stations: MonitoringStation[] = MONITORED_STATIONS
  ): Promise<SearchedLocation[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      return [];
    }

    // 1. Try Backend Geocoding Endpoint First
    try {
      const resp = await apiClient.get<{ status: string; results: any[] }>(
        `/geocoding/search?q=${encodeURIComponent(cleanQuery)}&limit=8`
      );
      if (resp.data && resp.data.results && resp.data.results.length > 0) {
        return resp.data.results.map((item) => {
          const lat = parseFloat(item.latitude || item.lat);
          const lng = parseFloat(item.longitude || item.lng || item.lon);
          const matchedStation = matchMonitoredStation(lat, lng, stations);

          return {
            placeId: item.place_id || `geo-${lat}-${lng}`,
            name: item.name || item.formatted_address?.split(',')[0] || cleanQuery,
            displayName: item.formatted_address || item.address || item.display_name,
            address: item.formatted_address || item.address || item.display_name,
            lat,
            lng,
            latitude: lat,
            longitude: lng,
            type: item.type,
            category: item.category,
            state: item.state,
            country: item.country || 'India',
            source: 'geocoding',
            isMonitored: Boolean(matchedStation),
            monitoredStation: matchedStation,
          };
        });
      }
    } catch (backendErr) {
      console.warn('[geocodingService] Backend geocoding API notice:', backendErr);
    }

    // 2. Direct OpenStreetMap Nominatim Fallback (Client-side)
    try {
      const response = await axios.get<NominatimResult[]>(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: cleanQuery,
            format: 'json',
            limit: 8,
            addressdetails: 1,
          },
          headers: {
            'Accept-Language': 'en',
          },
          timeout: 3500,
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

          const matchedStation = matchMonitoredStation(lat, lng, stations);

          return {
            placeId: item.place_id,
            name: placeName,
            displayName: item.display_name,
            address: item.display_name,
            lat,
            lng,
            latitude: lat,
            longitude: lng,
            type: item.type,
            category: item.class,
            state: item.address?.state,
            country: item.address?.country || 'India',
            source: 'geocoding',
            isMonitored: Boolean(matchedStation),
            monitoredStation: matchedStation,
          };
        });
      }
    } catch (nominatimErr) {
      console.warn('[geocodingService] Nominatim client-side notice:', nominatimErr);
    }

    // 3. Offline / Fallback handling for Indian geographic dictionary
    const lower = cleanQuery.toLowerCase();
    const fallbackResults: SearchedLocation[] = [];

    for (const [key, val] of Object.entries(OFFLINE_GEO_FALLBACK)) {
      if (key.includes(lower) || lower.includes(key)) {
        const matched = matchMonitoredStation(val.lat, val.lng, stations);
        fallbackResults.push({
          placeId: `fallback-${key}`,
          name: key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          displayName: val.displayName,
          address: val.displayName,
          lat: val.lat,
          lng: val.lng,
          latitude: val.lat,
          longitude: val.lng,
          state: val.state,
          country: val.country,
          source: 'geocoding',
          isMonitored: Boolean(matched),
          monitoredStation: matched,
        });
      }
    }

    return fallbackResults;
  },
};
