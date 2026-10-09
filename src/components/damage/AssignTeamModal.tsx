import React, { useState } from 'react';
import {
  Users,
  X,
  Radio,
  Clock,
  Send,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { DamageAssessmentRecord, AssignedRescueTeam } from '../../types/damageAssessment';
import { damageAssessmentService } from '../../services/damageAssessmentService';

interface AssignTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: DamageAssessmentRecord;
  onAssigned: (updated: DamageAssessmentRecord) => void;
}

const PRESET_TEAMS: Omit<AssignedRescueTeam, 'assignedAt'>[] = [
  {
    teamId: 'TEAM-NDRF-04A',
    teamName: 'NDRF 4th Battalion Quick Response Unit Alpha',
    teamType: 'NDRF',
    contactPerson: 'Insp. Anand Verma',
    contactRadio: 'CH-07 (148.550 MHz)',
    etaMinutes: 20,
  },
  {
    teamId: 'TEAM-SDRF-02B',
    teamName: 'SDRF High-Altitude Structural Search Team',
    teamType: 'SDRF',
    contactPerson: 'Sub-Insp. Devendra Singh',
    contactRadio: 'CH-12 (152.125 MHz)',
    etaMinutes: 35,
  },
  {
    teamId: 'TEAM-PWD-ENG',
    teamName: 'PWD Disaster Structural Integrity Engineers',
    teamType: 'PWD_STRUCTURAL',
    contactPerson: 'Er. Meenakshi Sundaram',
    contactRadio: 'CH-03 (144.200 MHz)',
    etaMinutes: 45,
  },
  {
    teamId: 'TEAM-CD-RAPID',
    teamName: 'District Civil Defense Evacuation Squad',
    teamType: 'CIVIL_DEFENSE',
    contactPerson: 'Officer Rajesh Pillai',
    contactRadio: 'CH-09 (149.800 MHz)',
    etaMinutes: 15,
  },
];

export const AssignTeamModal: React.FC<AssignTeamModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onAssigned,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Omit<AssignedRescueTeam, 'assignedAt'>>(PRESET_TEAMS[0]);
  const [customEta, setCustomEta] = useState<number>(selectedTeam.etaMinutes);

  if (!isOpen) return null;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const team: AssignedRescueTeam = {
      ...selectedTeam,
      etaMinutes: customEta,
      assignedAt: new Date().toISOString(),
    };

    const updated = damageAssessmentService.assignRescueTeam(assessment.id, team);
    if (updated) {
      onAssigned(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-4 sm:p-6 text-slate-800 relative font-sans max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                Dispatch Inspection Team
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {assessment.id} • Priority {assessment.priorityTier.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleDispatch} className="overflow-y-auto flex-1 py-4 space-y-3.5 text-xs">
          <p className="text-slate-600">
            Select emergency inspection unit based on location proximity and priority tier:
          </p>

          <div className="space-y-2">
            {PRESET_TEAMS.map((team) => {
              const isSelected = selectedTeam.teamId === team.teamId;
              return (
                <div
                  key={team.teamId}
                  onClick={() => {
                    setSelectedTeam(team);
                    setCustomEta(team.etaMinutes);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 truncate">
                      <Shield className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-600' : 'text-slate-400'}`} />
                      {team.teamName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                      ETA ~{team.etaMinutes}m
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Contact: {team.contactPerson}</span>
                    <span className="text-orange-700 font-semibold">{team.contactRadio}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block font-bold text-slate-700 mb-1">
              Field Arrival ETA (Minutes)
            </label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="5"
                max="360"
                value={customEta}
                onChange={(e) => setCustomEta(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Directive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
