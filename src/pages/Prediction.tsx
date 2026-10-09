import React, { useState } from 'react';
import { usePrediction } from '../context/PredictionContext';
import { PredictionForm } from '../components/prediction/PredictionForm';
import { PredictionResult } from '../components/prediction/PredictionResult';
import { XAIBreakdown } from '../components/prediction/XAIBreakdown';
import { CreateAlertModal } from '../components/alerts/CreateAlertModal';
import { useAlerts } from '../hooks/useAlerts';
import { BrainCircuit, ShieldCheck, History } from 'lucide-react';
import { useFeedback } from '../context/FeedbackContext';
import { useTranslation } from '../i18n';
import { PredictionFormValues } from '../types/prediction';

export const PredictionPage: React.FC = () => {
  const {
    formValues,
    setFormValues,
    latestResult,
    isLoading,
    runPrediction,
    predictionHistory,
  } = usePrediction();

  const { addAlert } = useAlerts();
  const { showSuccess, showError } = useFeedback();
  const { t } = useTranslation();
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const handleSubmit = async (values: PredictionFormValues) => {
    setFormValues(values);
    const res = await runPrediction(values);
    if (res) {
      showSuccess(`AI prediction completed: Risk Score ${res.risk_score}/100 (${res.risk_level})`);
    } else {
      showError('Prediction computation failed. Retaining entered feature values.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-5 h-5 text-orange-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Landslide Risk Prediction
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Enter environmental parameters to calculate landslide risk using the trained Random Forest model (<code className="font-mono text-orange-600">landslide_model.pkl</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            9 ML Features Bound
          </span>
        </div>
      </div>

      {/* Main Grid: Form (7 cols) + Result & XAI (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 9-Feature Prediction Form */}
        <div className="lg:col-span-7 space-y-6">
          <PredictionForm
            initialValues={formValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Prediction Result & Explainable AI */}
        <div className="lg:col-span-5 space-y-6">
          {latestResult ? (
            <>
              <PredictionResult
                result={latestResult}
                onOpenAlertModal={() => setAlertModalOpen(true)}
              />

              {latestResult.factors && (
                <XAIBreakdown
                  factors={latestResult.factors}
                  explanation={latestResult.explanation}
                  shapValues={latestResult.shap_values}
                />
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Awaiting Input Parameters
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Fill in the 9 geological features on the left or choose a Quick Test Scenario to compute the landslide risk score.
                </p>
              </div>

              <button
                onClick={() => runPrediction()}
                disabled={isLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Run Default Telemetry Prediction
              </button>
            </div>
          )}

          {/* Prediction History Drawer */}
          {predictionHistory.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Recent Inferences in Session</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                {predictionHistory.slice(1, 5).map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px]"
                  >
                    <span className="font-mono text-slate-500">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      Risk: {h.risk_score}/100
                    </span>
                    <span
                      className={`font-bold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                        h.risk_level === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : h.risk_level === 'HIGH'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {h.risk_level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Alert Generator Modal */}
      {latestResult && (
        <CreateAlertModal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          onSubmit={addAlert}
          initialScore={latestResult.risk_score}
        />
      )}
    </div>
  );
};

export default PredictionPage;
