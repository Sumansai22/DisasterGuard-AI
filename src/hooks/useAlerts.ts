import { useState, useEffect, useCallback } from 'react';
import { EmergencyAlert, CreateAlertPayload } from '../types/alerts';
import { alertService } from '../services/alertService';

export function useAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await alertService.getAlerts();
      if (Array.isArray(data)) {
        setAlerts(data);
      } else {
        console.warn('[useAlerts] Received non-array data from alertService, resetting to empty array:', data);
        setAlerts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load emergency alerts');
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const addAlert = async (payload: CreateAlertPayload) => {
    const created = await alertService.createAlert(payload);
    setAlerts((prev) => [created, ...prev]);
    return created;
  };

  const acknowledgeAlert = async (id: string) => {
    await alertService.updateStatus(id, 'ACKNOWLEDGED');
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  const resolveAlert = async (id: string) => {
    await alertService.updateStatus(id, 'RESOLVED');
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
    );
  };

  return { alerts, isLoading, error, addAlert, acknowledgeAlert, resolveAlert, refetch: fetchAlerts };
}
