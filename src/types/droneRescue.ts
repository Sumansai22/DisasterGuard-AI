export type RescuePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RescueIncidentStatus =
  | 'AI_DETECTED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'DISPATCHED'
  | 'RESCUED'
  | 'FALSE_POSITIVE';

export interface BoundingBox {
  x: number; // 0.0 - 1.0 (normalized)
  y: number; // 0.0 - 1.0 (normalized)
  width: number;
  height: number;
  x_px?: number;
  y_px?: number;
  width_px?: number;
  height_px?: number;
}

export interface TrackedPersonDetection {
  detection_id: string;
  person_id: string; // e.g. "PERSON #12"
  tracking_id: number;
  confidence: number;
  timestamp_sec: number;
  timestamp_str: string; // e.g. "00:14"
  frame_number: number;
  bbox: BoundingBox;
  distress_score: number; // 0.0 - 1.0 (e.g. 0.91 -> 91%)
  priority: RescuePriority;
  status: RescueIncidentStatus;
  indicators: string[];
  hazard_context?: string;
  latitude?: number | null;
  longitude?: number | null;
  gps_available: boolean;
  location_label?: string;
  posture?: string;
  snapshot_url?: string;
}

export interface DroneTelemetry {
  drone_id: string;
  connected: boolean;
  altitude_m?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  heading_deg?: number | null;
  speed_kmh?: number | null;
  battery_pct?: number | null;
  signal_pct?: number | null;
  stream_url?: string | null;
  mission_name?: string;
  active_hazard?: string;
}

export interface DroneAnalysisSummary {
  total_people_detected: number;
  possible_distress_count: number;
  high_priority_count: number;
  rescue_alerts_count: number;
  verified_count: number;
  dispatched_count: number;
}

export interface DroneAnalysisResult {
  analysis_id: string;
  media_type: 'video' | 'image' | 'live_stream';
  filename: string;
  duration_sec: number;
  total_frames_analyzed: number;
  fps_sampled: number;
  summary: DroneAnalysisSummary;
  detections: TrackedPersonDetection[];
  telemetry?: DroneTelemetry;
  disaster_location?: string;
  active_hazard?: string;
  created_at: string;
}

export interface PresetDroneScenario {
  id: string;
  title: string;
  hazard: string;
  location: string;
  drone_id: string;
  description: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  video_url: string;
  thumbnail_url?: string;
}

export interface DroneIncident {
  incident_id: string;
  analysis_id?: string;
  detection_id?: string;
  person_id: string;
  tracking_id: number;
  priority: RescuePriority;
  status: RescueIncidentStatus;
  confidence: number;
  distress_score: number;
  hazard: string;
  location_label: string;
  latitude?: number | null;
  longitude?: number | null;
  gps_available: boolean;
  timestamp_str: string;
  indicators: string[];
  assigned_team?: string | null;
  created_at: string;
  operator_notes?: string;
}

export interface RescueAlertDispatchPayload {
  incident_id: string;
  person_id: string;
  priority: string;
  distress_score: number;
  confidence: number;
  hazard: string;
  destination: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
}
