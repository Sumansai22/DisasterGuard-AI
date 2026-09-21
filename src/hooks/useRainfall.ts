import { useState, useEffect } from 'react';
import { RainfallOverviewResponse } from '../types/rainfall';
import { rainfallService } from '../services/rainfallService';

export function useRainfall(stationId?: string) {
  const [data, setData] = useState<RainfallOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadRainfall() {
      try {
        setIsLoading(true);
        const result = await rainfallService.getOverview(stationId);
        if (mounted) setData(result);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to fetch rainfall telemetries');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadRainfall();
    return () => { mounted = false; };
  }, [stationId]);

  return { data, isLoading, error };
}
