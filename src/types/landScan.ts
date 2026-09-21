export type SeverityLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';

export interface HazardRegion {
  label?: string;
  box_2d?: [number, number, number, number];
  mask?: [number, number][];
}

export interface ModelMetadata {
  model_name: string;
  input_resolution?: string;
  original_resolution?: string;
  pixel_accuracy?: number;
  f1_score?: number;
  iou?: number;
}

export interface LandScanResponse {
  success: boolean;
  filename: string;
  image_valid_for_landslide_analysis?: boolean;
  landslide_detected: boolean;
  landslide_percentage: number;
  hazard_area_percent?: number;
  severity: SeverityLevel;
  confidence: number;
  gemini_confidence?: number;
  hazard_status?: string;
  reason?: string;
  evidence?: string[];
  original_image: string;
  segmentation_mask: string;
  overlay_image: string;
  message: string;
  scan_id?: number | null;
  created_at?: string | null;
  model_name?: string;
  model_metadata?: ModelMetadata;
  hazard_regions?: HazardRegion[];
}

export interface ModelStatusResponse {
  unet_available?: boolean;
  gemini_available?: boolean;
  ai_land_scan_provider?: string;
  gemini_model?: string;
  status?: string;
  unet_details?: {
    is_ready?: boolean;
    model_name?: string;
    architecture?: string;
    pixel_accuracy?: number;
    f1_score?: number;
    iou?: number;
    precision?: number;
    recall?: number;
  };
}

export interface ScanHistoryRecord {
  id: number;
  filename: string;
  landslide_detected: boolean;
  landslide_percentage: number;
  hazard_area_percent?: number;
  severity: SeverityLevel;
  confidence: number;
  gemini_confidence?: number;
  created_at: string;
}

export interface ScanHistoryResponse {
  total: number;
  scans: ScanHistoryRecord[];
}
