import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CreateAlertPayload, AlertSeverity } from '../../types/alerts';
import { Send, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MONITORED_STATIONS } from '../../utils/constants';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAlertPayload) => Promise<any>;
  initialLocation?: string;
  initialScore?: number;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialLocation = 'Meppadi - Chooralmala Sector (Wayanad)',
  initialScore = 91,
}) => {
  const [severity, setSeverity] = useState<AlertSeverity>('CRITICAL');
  const [locationName, setLocationName] = useState(initialLocation);
  const [riskScore, setRiskScore] = useState<number>(initialScore);
  const [message, setMessage] = useState(
    'Heavy continuous rainfall exceeding 120mm/24h on steep saturated soil slope. Severe debris flow hazard detected by LandslideGuard AI.'
  );
  const [recommendedAction, setRecommendedAction] = useState(
    'Initiate immediate phased evacuation to Higher Ground Relief Centre. Halt uphill vehicular traffic.'
  );
  const [recipients, setRecipients] = useState<string[]>([
    'District Collectorate',
    'NDRF Battalion HQ',
    'Kerala SDMA Operations Room',
    'Public SMS Cell Broadcast',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const availableRecipients = [
    'District Collectorate',
    'NDRF Battalion HQ',
    'Kerala SDMA Operations Room',
    'Public SMS Cell Broadcast',
    'District Police & Traffic Command',
    'Public Works Dept (PWD)',
    'Fire & Emergency Services',
  ];

  const toggleRecipient = (name: string) => {
    setRecipients((prev) =>
      prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        severity,
        locationName,
        riskScore,
        message,
        recommendedAction,
        recipients,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Emergency Landslide Alert"
      subtitle="Issue authenticated early warning broadcast to disaster response agencies"
      maxWidth="xl"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            Alert successfully generated.
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Disaster management authorities and SMS cell broadcast relays have been notified.
          </p>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
          {/* Severity & Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Alert Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold"
              >
                <option value="CRITICAL">🚨 CRITICAL (Immediate Evacuation)</option>
                <option value="HIGH">⚠️ HIGH (Active Monitoring & Standby)</option>
                <option value="MODERATE">ℹ️ MODERATE (Advisory Watch)</option>
                <option value="INFO">ℹ️ INFO (Informational)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Risk Score (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={riskScore}
                onChange={(e) => setRiskScore(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Affected Location / Zone
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-semibold"
              placeholder="e.g. Meppadi - Chooralmala Sector"
              required
            />
          </div>

          {/* Alert Message */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Hazard Description & Trigger Reason
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>

          {/* Recommended Action */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Recommended Protective Action
            </label>
            <textarea
              rows={2}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>

          {/* Multi-select Recipients */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Select Broadcast Distribution List
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {availableRecipients.map((rec) => (
                <label
                  key={rec}
                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={recipients.includes(rec)}
                    onChange={() => toggleRecipient(rec)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="truncate">{rec}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || recipients.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Dispatching Alert...' : 'Generate Emergency Alert'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
