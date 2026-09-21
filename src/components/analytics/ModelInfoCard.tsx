import React, { useState } from 'react';
import { ModelMetadata } from '../../types/admin';
import { Modal } from '../common/Modal';
import { Cpu, FileCode2, CheckCircle2, Layers, ShieldCheck, Info } from 'lucide-react';

interface ModelInfoCardProps {
  metadata: ModelMetadata;
}

export const ModelInfoCard: React.FC<ModelInfoCardProps> = ({ metadata }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{metadata.modelName}</h3>
              <p className="text-xs text-slate-500">{metadata.architecture}</p>
            </div>
          </div>

          <button
            onClick={() => setDetailsOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Model Details
          </button>
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Model File Reference
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs truncate block mt-0.5">
              {metadata.fileReference}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Features Used
            </span>
            <span className="font-mono font-bold text-orange-600 text-xs block mt-0.5">
              {metadata.featuresCount} Features Exactly
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Prediction Type
            </span>
            <span className="font-bold text-slate-900 text-xs block mt-0.5">
              Binary & Probability
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Deployment State
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Backend Serving
            </span>
          </div>
        </div>

        {/* 9 Features Badges */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Exact 9 Input Features Mapped:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {metadata.featuresList.map((feat) => (
              <span
                key={feat}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Model Details Modal */}
      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="Model Card: Landslide Early Warning Classifier"
        subtitle="Audited scikit-learn RandomForestClassifier specification"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-700 font-sans">
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 leading-relaxed">
            <strong>Runtime Architecture:</strong> The frontend client never loads the binary{' '}
            <code className="font-mono bg-orange-100 px-1 rounded">landslide_model.pkl</code> in
            the browser. All inferences are routed via secure FastAPI endpoints to Python runtime.
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Training Dataset & Hyperparameters:
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Dataset:</strong> {metadata.datasetName}</li>
              <li><strong>Sample Count:</strong> {metadata.samplesCount.toLocaleString()} geological sensor observations</li>
              <li><strong>Estimators:</strong> 100 decision trees (criterion: Gini impurity)</li>
              <li><strong>Max Depth:</strong> 14 (tuned with 5-fold cross-validation)</li>
              <li><strong>Training Date:</strong> {new Date(metadata.trainingTimestamp).toLocaleDateString()}</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setDetailsOpen(false)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
