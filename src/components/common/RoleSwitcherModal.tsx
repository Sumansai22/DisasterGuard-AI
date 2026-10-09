import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Radio,
  User,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth, PRESET_PERSONAS } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useTranslation } from '../../i18n';
import { UserRole } from '../../types/auth';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchPersona } = useAuth();
  const { showSuccess } = useFeedback();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const roles: {
    role: UserRole;
    title: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    persona: (typeof PRESET_PERSONAS)[UserRole];
  }[] = [
    {
      role: 'ADMIN',
      title: 'Disaster Authority Administrator',
      description: 'Full control center: user management, model lifecycle, threshold configs, and auditable governance.',
      icon: ShieldCheck,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 hover:bg-purple-900/50',
      border: 'border-purple-800/80',
      persona: PRESET_PERSONAS.ADMIN,
    },
    {
      role: 'INSPECTOR',
      title: 'NDRF / Field Inspector',
      description: 'Field inspection tasks: GPS routing, ground truth verification, structural damage observations, and status updates.',
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
      border: 'border-emerald-800/80',
      persona: PRESET_PERSONAS.INSPECTOR,
    },
    {
      role: 'OPERATOR',
      title: 'Emergency Operations Lead',
      description: 'District command center: triage incoming distress signals, monitor multi-hazard feeds, and dispatch response teams.',
      icon: Radio,
      color: 'text-orange-400',
      bg: 'bg-orange-950/40 hover:bg-orange-900/50',
      border: 'border-orange-800/80',
      persona: PRESET_PERSONAS.OPERATOR,
    },
    {
      role: 'CITIZEN',
      title: 'Citizen & Community Volunteer',
      description: 'Public portal: citizen incident reporting with photo proof, personal dashboard, and emergency advisories.',
      icon: User,
      color: 'text-blue-400',
      bg: 'bg-blue-950/40 hover:bg-blue-900/50',
      border: 'border-blue-800/80',
      persona: PRESET_PERSONAS.CITIZEN,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 text-white shadow-2xl relative font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {t('roles.switchPersona', 'Role-Based Access Control (RBAC) Switcher')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('roles.currentPersona', 'Switch active persona to experience role-specific platform workspaces')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="py-4 space-y-2.5">
          {roles.map((r) => {
            const isSelected = currentUser.role === r.role;
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                onClick={() => {
                  switchPersona(r.role);
                  showSuccess(`Persona updated: ${r.title} (${r.persona.name})`);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-950/30 ring-2 ring-orange-500/30'
                    : `${r.border} ${r.bg}`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-lg bg-slate-800 shrink-0 ${r.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{r.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {r.role}
                        </span>
                      </div>
                      <div className="text-xs text-orange-400/90 font-medium mt-0.5">
                        Active Persona: {r.persona.name} ({r.persona.agency})
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {r.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-orange-400 shrink-0 text-xs font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-500">
          Enforces RBAC navigation across Admin Center, Field Inspector Workspace, and Citizen Portal.
        </div>
      </div>
    </div>
  );
};
