import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { ModelMetadata } from '../types/admin';
import { ModelInfoCard } from '../components/analytics/ModelInfoCard';
import { PerformanceMetrics } from '../components/analytics/PerformanceMetrics';
import { FeatureImportanceChart } from '../components/analytics/FeatureImportanceChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BarChart3, ShieldCheck, Database, Layers, Binary, Cpu } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [featureImportance, setFeatureImportance] = useState<
    { feature: string; importance: number; description: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const [meta, feat] = await Promise.all([
          analyticsService.getModelMetadata(),
          analyticsService.getFeatureImportance(),
        ]);
        if (mounted) {
          setMetadata(meta);
          setFeatureImportance(feat);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadAnalytics();
    return () => { mounted = false; };
  }, []);

  if (isLoading || !metadata) {
    return <LoadingSpinner message="Auditing Random Forest Model Architecture & Performance..." fullHeight />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Model Telemetry & Statistical Analytics
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Rigorous evaluation metrics, Gini feature importance ranking, and model card for <code className="text-orange-600 font-mono">landslide_model.pkl</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Inference Online (FastAPI)
          </span>
        </div>
      </div>

      {/* Model Metadata Card */}
      <ModelInfoCard metadata={metadata} />

      {/* Model Evaluation Metrics */}
      <PerformanceMetrics metrics={metadata.metrics} />

      {/* Global Feature Importance Chart */}
      <FeatureImportanceChart data={featureImportance} />

      {/* Architecture Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Model Pipeline & Ingestion Architecture
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">1. Hydrological Ingestion</div>
            <p className="text-slate-500 leading-relaxed">
              24-hour moving average rainfall from IMD automatic pluviometers combined with volumetric piezometer saturation sensor readings.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">2. Topographical & Soil Mapping</div>
            <p className="text-slate-500 leading-relaxed">
              Digital Elevation Models (DEM) slope gradients and categorized soil matrix with automated one-hot transformation to Gravel, Sand, and Silt.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">3. Ensemble Classification</div>
            <p className="text-slate-500 leading-relaxed">
              100-tree RandomForestClassifier computes calibrated posterior probabilities, returning risk scores mapped directly to early-warning alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
