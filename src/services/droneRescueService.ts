import {
  DroneAnalysisResult,
  DroneTelemetry,
  PresetDroneScenario,
  DroneIncident,
  RescueAlertDispatchPayload,
} from '../types/droneRescue';

const getDroneApiBase = () => {
  const base = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    ''
  ).trim().replace(/\/+$/, '');
  return base ? `${base}/api/drone` : '/api/drone';
};

export const droneRescueService = {
  async getPresets(): Promise<PresetDroneScenario[]> {
    try {
      const res = await fetch(`${getDroneApiBase()}/presets`);
      if (!res.ok) throw new Error('Failed to fetch presets');
      const data = await res.json();
      return data.presets || [];
    } catch (e) {
      console.warn('Using fallback preset scenarios', e);
      return [
        {
          id: 'preset_bhimavaram_flood',
          title: 'Bhimavaram Canal Flood Inundation Scan',
          hazard: 'FLASH FLOOD',
          location: 'Bhimavaram, Andhra Pradesh',
          drone_id: 'DRONE-01',
          description: 'Aerial scan over submerged residential quarters and Godavari branch canal bank following flash surge.',
          latitude: 16.5448,
          longitude: 81.5212,
          altitude_m: 48.0,
          video_url: '/demo/drone-rescue-real-footage.mp4',
        },
        {
          id: 'preset_chooralmala_landslide',
          title: 'Chooralmala Debris Corridor Rescue Scan',
          hazard: 'LANDSLIDE',
          location: 'Wayanad, Kerala',
          drone_id: 'DRONE-02',
          description: 'Thermal & RGB quadcopter reconnaissance along Chooralmala collapsed bridge sector.',
          latitude: 11.5234,
          longitude: 76.1689,
          altitude_m: 62.0,
          video_url: '/demo/drone-rescue-real-footage.mp4',
        },
        {
          id: 'preset_chennai_cyclone',
          title: 'Chennai Coastal Storm Surge Stranded Scan',
          hazard: 'CYCLONE',
          location: 'Chennai, Tamil Nadu',
          drone_id: 'DRONE-03',
          description: 'Scanning marooned rooftops and waterlogged arterial corridors in low-lying coastal zone.',
          latitude: 13.0827,
          longitude: 80.2707,
          altitude_m: 35.0,
          video_url: '/demo/drone-rescue-real-footage.mp4',
        },
      ];
    }
  },

  async analyzePreset(presetId: string): Promise<DroneAnalysisResult> {
    const res = await fetch(`${getDroneApiBase()}/analyze-preset?preset_id=${presetId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to analyze preset scenario');
    const data = await res.json();
    return data.analysis;
  },

  async uploadFootage(
    file: File,
    hazardContext: string,
    locationName: string,
    droneId: string = 'DRONE-01',
    latitude?: number,
    longitude?: number,
    altitude?: number
  ): Promise<{ analysis: DroneAnalysisResult; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hazard_context', hazardContext);
    formData.append('location_name', locationName);
    formData.append('drone_id', droneId);
    if (latitude) formData.append('latitude', latitude.toString());
    if (longitude) formData.append('longitude', longitude.toString());
    if (altitude) formData.append('altitude_m', altitude.toString());

    const res = await fetch(`${getDroneApiBase()}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload and analysis failed' }));
      throw new Error(err.detail || 'Upload and analysis failed');
    }
    const data = await res.json();
    return { analysis: data.analysis, fileUrl: data.file_url };
  },

  async getTelemetry(): Promise<DroneTelemetry> {
    const res = await fetch(`${getDroneApiBase()}/telemetry`);
    if (!res.ok) throw new Error('Failed to get drone telemetry');
    const data = await res.json();
    return data.telemetry;
  },

  async connectFeed(params: {
    streamUrl: string;
    droneId?: string;
    hazardContext?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
  }): Promise<DroneTelemetry> {
    const res = await fetch(`${getDroneApiBase()}/telemetry/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream_url: params.streamUrl,
        drone_id: params.droneId || 'DRONE-01',
        hazard_context: params.hazardContext || 'FLASH FLOOD',
        location_name: params.locationName || 'Bhimavaram',
        latitude: params.latitude,
        longitude: params.longitude,
        altitude_m: params.altitude,
      }),
    });
    if (!res.ok) throw new Error('Failed to connect live stream endpoint');
    const data = await res.json();
    return data.telemetry;
  },

  async disconnectFeed(): Promise<DroneTelemetry> {
    const res = await fetch(`${getDroneApiBase()}/telemetry/disconnect`, { method: 'POST' });
    const data = await res.json();
    return data.telemetry;
  },

  async listIncidents(): Promise<DroneIncident[]> {
    try {
      const res = await fetch(`${getDroneApiBase()}/incidents`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.incidents || [];
    } catch {
      return [];
    }
  },

  async verifyIncident(incidentId: string): Promise<DroneIncident> {
    const res = await fetch(`${getDroneApiBase()}/incidents/${incidentId}/verify`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to verify incident');
    const data = await res.json();
    return data.incident;
  },

  async markFalsePositive(incidentId: string): Promise<DroneIncident> {
    const res = await fetch(`${getDroneApiBase()}/incidents/${incidentId}/false-positive`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark false positive');
    const data = await res.json();
    return data.incident;
  },

  async dispatchRescue(payload: RescueAlertDispatchPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${getDroneApiBase()}/incidents/${payload.incident_id}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to dispatch rescue order');
    return await res.json();
  },
};
