import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Radio,
  User,
  X,
  CheckCircle2,
  ExternalLink,
  Lock,
  ArrowRight,
  Info,
  Loader2,
} from 'lucide-react';
import { useAuth, PRESET_PERSONAS } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useTranslation } from '../../i18n';
import { UserRole, ROLE_DEFINITIONS } from '../../types/auth';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchPersona } = useAuth();
  const { showSuccess, showWarning } = useFeedback();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);

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

  const handleSwitchWorkspace = (targetRole: UserRole) => {
    setSwitchingRole(targetRole);
    try {
      switchPersona(targetRole);
      const roleDef = ROLE_DEFINITIONS[targetRole];
      const persona = PRESET_PERSONAS[targetRole];
      showSuccess(`Workspace switched to ${roleDef.workspaceName} (${persona.name})`);
      onClose();
      navigate(roleDef.defaultWorkspace);
    } catch {
      showWarning('Unable to switch persona workspace cleanly. Please retry.');
    } finally {
      setSwitchingRole(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-switcher-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 text-white shadow-2xl relative font-sans max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 id="role-switcher-title" className="text-base font-bold text-white leading-tight">
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
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Development Persona Simulator Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-400 shrink-0" />
          <span>
            <strong>Persona Simulator:</strong> Switch roles to test distinct workspaces, permission restrictions, and navigation flows. Session credentials and access tokens are managed via centralized RBAC policies.
          </span>
        </div>

        {/* Roles List */}
        <div className="py-4 space-y-3">
          {roles.map((r) => {
            const isSelected = currentUser.role === r.role;
            const roleDef = ROLE_DEFINITIONS[r.role];
            const Icon = r.icon;
            const isProcessing = switchingRole === r.role;

            return (
              <div
                key={r.role}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-950/20 ring-2 ring-orange-500/30'
                    : `${r.border} ${r.bg}`
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl bg-slate-800 shrink-0 ${r.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{r.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {r.role}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/60">
                          Workspace: {roleDef.workspaceName}
                        </span>
                      </div>
                      <div className="text-xs text-orange-400/90 font-medium mt-1">
                        Persona: {r.persona.name} • {r.persona.agency}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-snug">
                        {r.description}
                      </p>

                      {/* Permissions Summary Pills */}
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-400">Permissions ({roleDef.permissions.length}):</span>
                        {roleDef.permissions.slice(0, 5).map((perm) => (
                          <span
                            key={perm}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            {perm}
                          </span>
                        ))}
                        {roleDef.permissions.length > 5 && (
                          <span className="text-[9px] font-mono text-slate-400">
                            +{roleDef.permissions.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2 pt-2 sm:pt-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-bold font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active Role
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitchWorkspace(r.role)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Switching...
                          </>
                        ) : (
                          <>
                            Switch Workspace
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Least-privilege authorization enforced across all routes and API actions.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
