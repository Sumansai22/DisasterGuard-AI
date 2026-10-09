import React, { useState } from 'react';
import { CheckSquare, Square, Plus, ShieldCheck, Clock, FileText } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  notes?: string;
}

interface EmergencyActionChecklistProps {
  incidentId?: string;
  hazardType?: string;
}

const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: '1', label: 'Hazard detected & verified by operational telemetry', completed: true },
  { id: '2', label: 'Impact zone & affected perimeter geofenced on GIS map', completed: true },
  { id: '3', label: 'Nearby high-ground emergency shelters capacity audited', completed: false },
  { id: '4', label: 'Evacuation corridors & dangerous road intersections evaluated', completed: false },
  { id: '5', label: 'Search & rescue teams (NDRF/SDRF) mobilized or put on standby', completed: false },
  { id: '6', label: 'Public CAP early-warning bulletin drafted and verified', completed: false },
  { id: '7', label: 'Vulnerable demographics (elderly, children, medical facilities) flagged', completed: false },
];

export const EmergencyActionChecklist: React.FC<EmergencyActionChecklistProps> = ({ incidentId }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    // Attempt local persistence per incident
    const storageKey = `dg_checklist_${incidentId || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_CHECKLIST_ITEMS;
  });

  const [activeItemNotes, setActiveItemNotes] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const toggleItem = (id: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it));
    setItems(updated);
    const storageKey = `dg_checklist_${incidentId || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const saveNote = (id: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, notes: tempNote } : it));
    setItems(updated);
    const storageKey = `dg_checklist_${incidentId || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setActiveItemNotes(null);
    setTempNote('');
  };

  const completedCount = items.filter((it) => it.completed).length;
  const totalCount = items.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 font-sans min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2 truncate">
              <span>Emergency Response Checklist</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                OPERATIONAL SOP
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              NDMA protocol execution tracker for current incident scenario
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs font-mono font-bold text-slate-700">
            Progress: {completedCount} / {totalCount} ({progressPct}%)
          </span>
          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPct === 100 ? 'bg-emerald-500' : progressPct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it.id}
            className={`p-3 rounded-xl border transition-all ${
              it.completed
                ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-700'
                : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <button
                type="button"
                onClick={() => toggleItem(it.id)}
                className="flex items-start gap-2.5 text-left flex-1 cursor-pointer"
              >
                <span className="mt-0.5 text-emerald-600 shrink-0">
                  {it.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                </span>
                <span className={`text-xs font-semibold leading-relaxed ${it.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {it.label}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveItemNotes(activeItemNotes === it.id ? null : it.id);
                  setTempNote(it.notes || '');
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-700 flex items-center gap-1 shrink-0 p-1 cursor-pointer"
                title="Add Notes"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{it.notes ? 'Edit Note' : 'Add Note'}</span>
              </button>
            </div>

            {/* Note text if present */}
            {it.notes && activeItemNotes !== it.id && (
              <div className="mt-2 ml-6 text-[11px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-200/70">
                <span className="font-bold text-slate-400">Note:</span> {it.notes}
              </div>
            )}

            {/* Note Editor Drawer */}
            {activeItemNotes === it.id && (
              <div className="mt-2 ml-6 pt-2 border-t border-slate-200/60 space-y-2 animate-in fade-in">
                <textarea
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  placeholder="Record operator log note..."
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveNote(it.id)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Save Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveItemNotes(null)}
                    className="px-2 py-1 text-slate-500 text-[11px] hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-1 text-[10px] text-slate-400 font-mono text-right">
        Local state persistence synchronized • SOP v2026.4
      </div>
    </div>
  );
};
