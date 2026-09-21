import { apiClient } from './api';
import { ExposureMetrics, InfrastructureAsset } from '../types/exposure';

const MOCK_EXPOSURE_DATA: Record<string, ExposureMetrics> = {
  'STN-WAYANAD-02': {
    locationId: 'STN-WAYANAD-02',
    locationName: 'Meppadi - Chooralmala Sector',
    riskLevel: 'CRITICAL',
    riskScore: 91,
    estimatedPopulationExposed: 1420,
    vulnerableGroups: {
      elderly: 240,
      children: 380,
      differentlyAbled: 65,
    },
    buildingsCount: 384,
    schoolsCount: 3,
    hospitalsCount: 2,
    roadsCount: 4,
    bridgesCount: 2,
    criticalInfrastructureCount: 5,
    assets: [
      {
        id: 'INF-W-1',
        name: 'Vellarmala Government Vocational Higher Secondary School',
        type: 'school',
        location: { lat: 11.5380, lng: 76.1320 },
        capacity: 450,
        status: 'high_risk',
        distanceFromRiskCenterKm: 0.4,
        contact: '+91 4936 288120'
      },
      {
        id: 'INF-W-2',
        name: 'Chooralmala Primary Health Centre',
        type: 'hospital',
        location: { lat: 11.5340, lng: 76.1290 },
        capacity: 40,
        status: 'high_risk',
        distanceFromRiskCenterKm: 0.3,
        contact: '+91 4936 288340'
      },
      {
        id: 'INF-W-3',
        name: 'Chooralmala Bailey Bridge Corridor',
        type: 'bridge',
        location: { lat: 11.5320, lng: 76.1340 },
        status: 'high_risk',
        distanceFromRiskCenterKm: 0.2
      },
      {
        id: 'INF-W-4',
        name: 'State Highway 59 Mountain Pass',
        type: 'road',
        location: { lat: 11.5420, lng: 76.1250 },
        status: 'evacuating',
        distanceFromRiskCenterKm: 0.6
      },
      {
        id: 'INF-W-5',
        name: 'KSEB 33kV Power Distribution Substation',
        type: 'power_substation',
        location: { lat: 11.5450, lng: 76.1400 },
        status: 'high_risk',
        distanceFromRiskCenterKm: 0.9
      }
    ]
  },
  'STN-MUNNAR-01': {
    locationId: 'STN-MUNNAR-01',
    locationName: 'Munnar Tea Estate Zone A',
    riskLevel: 'CRITICAL',
    riskScore: 87,
    estimatedPopulationExposed: 1240,
    vulnerableGroups: {
      elderly: 190,
      children: 310,
      differentlyAbled: 45,
    },
    buildingsCount: 310,
    schoolsCount: 2,
    hospitalsCount: 2,
    roadsCount: 3,
    bridgesCount: 1,
    criticalInfrastructureCount: 4,
    assets: [
      {
        id: 'INF-M-1',
        name: 'Tata Tea General Hospital Munnar',
        type: 'hospital',
        location: { lat: 10.0820, lng: 77.0620 },
        capacity: 120,
        status: 'high_risk',
        distanceFromRiskCenterKm: 0.8,
        contact: '+91 4865 230222'
      },
      {
        id: 'INF-M-2',
        name: 'Government High School Munnar Colony',
        type: 'school',
        location: { lat: 10.0920, lng: 77.0540 },
        capacity: 350,
        status: 'high_risk',
        distanceFromRiskCenterKm: 0.5
      },
      {
        id: 'INF-M-3',
        name: 'Old Munnar River Bridge',
        type: 'bridge',
        location: { lat: 10.0780, lng: 77.0650 },
        status: 'evacuating',
        distanceFromRiskCenterKm: 0.7
      }
    ]
  }
};

export const exposureService = {
  async getExposureData(locationId: string): Promise<ExposureMetrics> {
    try {
      const response = await apiClient.get<ExposureMetrics>(`/exposure/${locationId}`);
      return response.data;
    } catch (error) {
      if (MOCK_EXPOSURE_DATA[locationId]) {
        return MOCK_EXPOSURE_DATA[locationId];
      }
      // Return dynamic fallback based on location
      return {
        locationId,
        locationName: 'Selected Monitoring Zone',
        riskLevel: 'HIGH',
        riskScore: 78,
        estimatedPopulationExposed: 850,
        vulnerableGroups: { elderly: 120, children: 210, differentlyAbled: 30 },
        buildingsCount: 210,
        schoolsCount: 2,
        hospitalsCount: 1,
        roadsCount: 2,
        bridgesCount: 1,
        criticalInfrastructureCount: 3,
        assets: [
          {
            id: 'INF-GEN-1',
            name: 'Community Medical Centre',
            type: 'hospital',
            location: { lat: 10.085, lng: 77.055 },
            status: 'high_risk',
            distanceFromRiskCenterKm: 0.6
          },
          {
            id: 'INF-GEN-2',
            name: 'Primary Elementary Campus',
            type: 'school',
            location: { lat: 10.090, lng: 77.060 },
            status: 'operational',
            distanceFromRiskCenterKm: 1.1
          }
        ]
      };
    }
  }
};
