import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { exposureService } from '../services/exposureService';
import { ExposureMetrics } from '../types/exposure';
import { ExposureSummary } from '../components/exposure/ExposureSummary';
import { CriticalInfrastructureCards } from '../components/exposure/CriticalInfrastructureCards';
import { RiskMap } from '../components/map/RiskMap';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Building2, Navigation, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ImpactAnalysisPage: React.FC = () => {
  const { selectedStation, activeLocation } = useApp();
  const [data, setData] = useState<ExposureMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeStationId = selectedStation?.id || 'munnar-zone-a';
  const centerLat = selectedStation?.coordinates.lat ?? activeLocation.lat;
  const centerLng = selectedStation?.coordinates.lng ?? activeLocation.lng;

  useEffect(() => {
    let mounted = true;
    async function loadExposure() {
      setIsLoading(true);
      try {
        const result = await exposureService.getExposureData(activeStationId);
        if (mounted) setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadExposure();
    return () => { mounted = false; };
  }, [activeStationId]);

  if (isLoading || !data) {
    return <LoadingSpinner message="Calculating Geospatial Population & Infrastructure Exposure Matrix..." fullHeight />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Impact & Critical Exposure Analysis
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Automated spatial aggregation of vulnerable demographics, critical healthcare, schools, and transport corridors
          </p>
        </div>

        <Link
          to="/evacuation"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>Plan Evacuation Corridor</span>
        </Link>
      </div>

      {/* KPI Exposure Summary Banner */}
      <ExposureSummary data={data} />

      {/* Map & Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Exposure Map (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Exposure Zone Overlay & Safe Refuge Nodes
              </h4>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Red: Hazard | Green: Safe
            </span>
          </div>

          <div className="flex-1 min-h-[460px]">
            <RiskMap
              center={[centerLat, centerLng]}
              zoom={13}
              height="480px"
              selectedStationId={selectedStation?.id}
            />
          </div>
        </div>

        {/* Right: Critical Infrastructure & Facilities List (6 cols) */}
        <div className="lg:col-span-6">
          <CriticalInfrastructureCards assets={data.assets} />
        </div>
      </div>
    </div>
  );
};
