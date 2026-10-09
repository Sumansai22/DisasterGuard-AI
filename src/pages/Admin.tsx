import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Sliders,
  MapPin,
  FileText,
  Users,
  Activity,
  CheckCircle2,
  HardDrive,
  Cpu,
  Database,
  Layers,
  Search,
  Plus,
  AlertTriangle,
  UserCheck,
  Download,
  Printer,
  Radio,
  Eye,
  KeyRound,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { UserRole, UserProfile } from '../types/auth';
import { DamageAssessmentRecord } from '../types/damageAssessment';
import { damageAssessmentService } from '../services/damageAssessmentService';
import { StationManager } from '../components/admin/StationManager';
import { ThresholdConfig } from '../components/admin/ThresholdConfig';
import { SystemStatusIndicator } from '../components/common/SystemStatus';

type AdminTab =
  | 'overview'
  | 'users'
  | 'incidents'
  | 'assessments'
  | 'aimodels'
  | 'integrations'
  | 'auditlogs'
  | 'reports'
  | 'config';

export const AdminPage: React.FC = () => {
  const { currentUser, allUsers, addUser, toggleUserStatus, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [assessments, setAssessments] = useState<DamageAssessmentRecord[]>([]);

  // User management state
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('INSPECTOR');
  const [newUserAgency, setNewUserAgency] = useState('State Disaster Response Force');

  useEffect(() => {
    setAssessments(damageAssessmentService.getAllAssessments());
  }, []);

  // Filter users
  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.agency.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Export assessments to CSV
  const handleExportAssessmentsCsv = () => {
    const headers = [
      'Assessment ID',
      'Title',
      'Disaster Event',
      'Hazard Type',
      'Location',
      'District',
      'State',
      'Physical Damage Grade',
      'Priority Tier',
      'Composite Score',
      'Verification Status',
      'Reviewer',
      'Last Updated',
    ];

    const rows = assessments.map((a) => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.disasterEvent.replace(/"/g, '""')}"`,
      a.disasterType,
      `"${a.locationName.replace(/"/g, '""')}"`,
      a.district,
      a.state,
      a.estimatedDamageCategory,
      a.priorityTier,
      a.scores.compositePriorityScore,
      a.verificationStatus,
      `"${a.humanReview?.reviewerName || 'Unassigned'}"`,
      a.updatedAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DisasterGuard_PS53_Assessments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      agency: newUserAgency.trim(),
      status: 'ACTIVE',
      badgeId: `AGY-${newUserRole.substring(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  return (
    <div className="space-y-6 max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">
              ROOT CONTROL CENTER
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Platform Administration & System Governance
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage users, AI model lifecycles, bitemporal damage assessments, and data-source integrations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 bg-slate-900 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-2 shadow-xs">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin: {currentUser.name} ({currentUser.role})</span>
          </span>
        </div>
      </div>

      {/* Structured Admin Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'users', label: 'Users & RBAC', icon: Users },
          { key: 'assessments', label: 'Damage Prioritization', icon: Layers },
          { key: 'aimodels', label: 'AI/ML Models', icon: Cpu },
          { key: 'integrations', label: 'Data Feeds & Telemetry', icon: Server },
          { key: 'auditlogs', label: 'Audit Trail', icon: FileText },
          { key: 'reports', label: 'Reports & Exports', icon: Download },
          { key: 'config', label: 'Thresholds & Config', icon: Sliders },
          { key: 'incidents', label: 'Telemetry Stations', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* A. ADMIN OVERVIEW                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">TOTAL USERS</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{allUsers.length}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">Active Authorized Accounts</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">DAMAGE ASSESSMENTS</span>
              <span className="text-2xl font-black text-orange-600 font-mono mt-1 block">{assessments.length}</span>
              <span className="text-[11px] text-slate-500">PS-53 Ingested Records</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">CRITICAL P1 TASKS</span>
              <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                {assessments.filter((a) => a.priorityTier === 'P1_URGENT').length}
              </span>
              <span className="text-[11px] text-red-700 font-semibold">Urgent Field Deployments</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">AI INFERENCE ENGINES</span>
              <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">3 / 3</span>
              <span className="text-[11px] text-emerald-700 font-semibold">RF, U-Net, YOLOv8 Ready</span>
            </div>
          </div>

          {/* Priority Distribution & System Health Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm">Priority Tier Distribution (PS-53 Engine)</h3>
                <span className="text-[10px] font-mono text-slate-500">Real-time Triage Weights</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { tier: 'P1_URGENT', label: 'P1 URGENT (< 2 Hours)', color: 'bg-red-500', count: assessments.filter((a) => a.priorityTier === 'P1_URGENT').length },
                  { tier: 'P2_HIGH', label: 'P2 HIGH (< 6 Hours)', color: 'bg-orange-500', count: assessments.filter((a) => a.priorityTier === 'P2_HIGH').length },
                  { tier: 'P3_MEDIUM', label: 'P3 MEDIUM (< 24 Hours)', color: 'bg-amber-500', count: assessments.filter((a) => a.priorityTier === 'P3_MEDIUM').length },
                  { tier: 'P4_LOW', label: 'P4 LOW (Routine Survey)', color: 'bg-emerald-500', count: assessments.filter((a) => a.priorityTier === 'P4_LOW').length },
                ].map((item) => {
                  const pct = assessments.length > 0 ? (item.count / assessments.length) * 100 : 0;
                  return (
                    <div key={item.tier} className="space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-slate-800">{item.label}</span>
                        <span>{item.count} sites ({Math.round(pct)}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm">Recent Administrative Actions</h3>
                <span className="text-[10px] font-mono text-slate-500">Audit Stream</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">[AUTH]</span>
                  <span className="text-slate-700">Root session activated by {currentUser.name}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="text-orange-600 font-bold">[ML]</span>
                  <span className="text-slate-700">landslide_model.pkl feature validation verified (9 features)</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <span className="text-blue-600 font-bold">[PS-53]</span>
                  <span className="text-slate-700">Calculated priority ranking for {assessments.length} disaster sites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B. USER AND ROLE MANAGEMENT (RBAC)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">User & Role-Based Access Control (RBAC)</h3>
              <p className="text-slate-500 text-[11px]">Manage disaster authority accounts, field inspectors, and citizen credentials</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-3">User & Badge</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Agency / Department</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 text-xs">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{u.email} • {u.badgeId || u.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'INSPECTOR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.role === 'OPERATOR'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{u.agency}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-[11px] font-medium"
                      >
                        {u.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* C. DAMAGE ASSESSMENTS ADMINISTRATION (PS-53)                             */}
      {/* ========================================================================= */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Damage Assessment Registry (PS-53)</h3>
              <p className="text-slate-500 text-[11px]">Inspect all structural assessments, bitemporal imagery records, and verification decisions</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAssessmentsCsv}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <Link
                to="/damage-assessment"
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <span>Open Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {assessments.map((a) => (
              <div key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{a.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">({a.id})</span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-red-100 text-red-800 font-bold">
                      {a.priorityTier.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {a.locationName} • Damage: <strong>{a.estimatedDamageCategory}</strong> • Score: <strong>{a.scores.compositePriorityScore}/100</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    "{a.priorityRationale}"
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    a.verificationStatus === 'VERIFIED_CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {a.verificationStatus}
                  </span>
                  <Link
                    to="/damage-assessment"
                    className="p-1 rounded hover:bg-slate-100 text-slate-600"
                    title="Inspect in workspace"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* D. AI/ML MODELS REGISTRY                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'aimodels' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Random Forest Model */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Cpu className="w-4 h-4 text-orange-600" />
                  <span>Random Forest 9-Param</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div><strong>File:</strong> ml_models/landslide_model.pkl</div>
                <div><strong>Framework:</strong> Scikit-learn Classifier</div>
                <div><strong>Parameters:</strong> 9 Geotechnical Features</div>
                <div><strong>Average Latency:</strong> 24ms</div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Predicts localized slope failure probability using validated physical soil and slope measurements.
              </p>
            </div>

            {/* U-Net Model */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>U-Net 2D Segmentation</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div><strong>File:</strong> SIH26001_Landslide_UNet.keras</div>
                <div><strong>Architecture:</strong> 2D CNN Encoder-Decoder</div>
                <div><strong>Input Shape:</strong> (128, 128, 14 Multispectral)</div>
                <div><strong>Output:</strong> Binary Hazard Scar Mask</div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Segments landslide scar boundaries and calculates affected terrain square meterage from satellite passes.
              </p>
            </div>

            {/* YOLOv8 Model */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Radio className="w-4 h-4 text-red-600" />
                  <span>YOLOv8 Nano Drone Vision</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div><strong>File:</strong> yolov8n.pt</div>
                <div><strong>Framework:</strong> Ultralytics YOLOv8</div>
                <div><strong>Task:</strong> Real-time Person & Distress Detection</div>
                <div><strong>Kinematic Scoring:</strong> Posture & Immobility</div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Scans high-definition aerial UAV footage to detect stranded disaster victims in inundated sectors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* E. DATA FEEDS & TELEMETRY INTEGRATIONS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <SystemStatusIndicator variant="full" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* F. AUDIT TRAIL LOGS                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'auditlogs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Central Audit Trail & Compliance Log</h3>
              <p className="text-slate-500 text-[11px]">Immutable record of verification decisions, priority overrides, and dispatches</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Tamper-Evident Ledger
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
            {assessments.flatMap((a) => a.auditTrail).map((entry) => (
              <div key={entry.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="text-slate-400 font-bold shrink-0">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span className="font-bold px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 shrink-0">
                  {entry.action}
                </span>
                <div className="flex-1 min-w-0 font-sans">
                  <span className="text-slate-800">{entry.details}</span>
                  <span className="text-slate-400 font-mono text-[10px] block mt-0.5">Operator: {entry.operator}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* G. REPORTS & EXPORTS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Disaster Management Reports & Exports</h3>
              <p className="text-slate-500 text-[11px]">Generate official inspection dossiers for NDMA, SDMA, and District Collectors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="font-bold text-slate-900">PS-53 Damage Prioritization Structured Data (CSV)</h4>
              <p className="text-slate-600 text-[11px]">
                Full tabular export containing coordinates, physical damage categories, weighted scores, and reviewer signatures.
              </p>
              <button
                onClick={handleExportAssessmentsCsv}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Assessment CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="font-bold text-slate-900">Official NDMA Incident Prioritization Dossier (PDF)</h4>
              <p className="text-slate-600 text-[11px]">
                Print-ready official document with bitemporal satellite imagery, EMS-98 scorecards, and justification signoff.
              </p>
              <Link
                to="/damage-assessment"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Report Generator</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* H. THRESHOLDS & CONFIG                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <ThresholdConfig />

          {/* Environment Variables Inspector (Names only, no secrets exposed) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-orange-600" />
              <span>Configured Environment Architecture (Security Audited)</span>
            </h3>
            <p className="text-slate-500 text-[11px]">
              Active environment variable names in production. Secret values are protected server-side and never exposed in browser runtime.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
              {[
                { name: 'VITE_API_BASE_URL', status: 'Active (Render Endpoint)' },
                { name: 'DATABASE_URL', status: 'Configured (SQLite / Postgres)' },
                { name: 'MODEL_PATH', status: 'Configured (ml_models/)' },
                { name: 'CORS_ORIGINS', status: 'Enforced' },
                { name: 'PORT', status: 'Configured (8000)' },
                { name: 'GEMINI_API_KEY', status: 'Server-Side Only' },
                { name: 'GOOGLE_ROUTES_API_KEY', status: 'Server-Side Only' },
                { name: 'SECRET_KEY', status: 'Server-Side Only' },
              ].map((ev) => (
                <div key={ev.name} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 truncate">{ev.name}</div>
                  <div className="text-[10px] text-emerald-700">{ev.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* I. TELEMETRY STATIONS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'incidents' && <StationManager />}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 text-slate-800 text-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Add Authorized Personnel</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">System Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                >
                  <option value="ADMIN">ADMIN — Full Control</option>
                  <option value="INSPECTOR">INSPECTOR — Field Verification</option>
                  <option value="OPERATOR">OPERATOR — Command Dispatch</option>
                  <option value="CITIZEN">CITIZEN — Public Reporting</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Agency</label>
                <input
                  type="text"
                  value={newUserAgency}
                  onChange={(e) => setNewUserAgency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 text-white font-bold rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
