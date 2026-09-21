import { useState, useEffect } from 'react';
import { RiskZonePolygon, MonitoringStation } from '../types/map';
import { mapService } from '../services/mapService';

export function useRiskZones() {
  const [zones, setZones] = useState<RiskZonePolygon[]>([]);
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [zonesData, stationsData] = await Promise.all([
          mapService.getRiskZones(),
          mapService.getMonitoringStations(),
        ]);
        if (mounted) {
          setZones(zonesData);
          setStations(stationsData);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load map data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  return { zones, stations, isLoading, error };
}
