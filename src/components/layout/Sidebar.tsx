import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  BrainCircuit,
  CloudRain,
  Building2,
  Navigation,
  History,
  ShieldCheck,
  Cpu,
  User,
  Layers,
  Crosshair,
  X,
  Radio,
  Compass,
  Sliders,
  MessageSquarePlus,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';
import { useTranslation } from '../../i18n';
import { landScanService } from '../../services/landScanService';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  badgeCount?: number;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { isOnline } = useApp();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUnetReady, setIsUnetReady] = useState<boolean>(true);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [selectedModelDialog, setSelectedModelDialog] = useState<'rf' | 'unet' | null>(null);

  useEffect(() => {
    landScanService
      .getModelStatus()
      .then((res) => setIsUnetReady(res.status === 'ready'))
      .catch(() => setIsUnetReady(false));
  }, []);

  const navGroups: NavGroup[] = [
    {
      groupName: t('nav.groupMain', 'MAIN'),
      items: [
        { name: t('nav.overview', 'Overview'), path: '/', icon: LayoutDashboard },
        { name: t('nav.damageAssessment', 'Damage Assessment'), path: '/damage-assessment', icon: Building2, badge: 'PS-53' },
        { name: t('nav.mapGis', 'Map & GIS'), path: '/risk-map', icon: MapPin },
        { name: t('nav.priorities', 'Inspection Priorities'), path: '/priorities', icon: Compass },
      ],
    },
    {
      groupName: t('nav.groupResponse', 'RESPONSE OPERATIONS'),
      items: [
        { name: t('nav.droneRescue', 'Drone & Rescue'), path: '/drone-rescue', icon: Crosshair },
        { name: t('nav.weatherRainfall', 'Weather & Rainfall'), path: '/rainfall', icon: CloudRain },
        { name: t('nav.evacuationShelters', 'Evacuation & Shelters'), path: '/evacuation', icon: Navigation },
        { name: t('nav.incidentsSos', 'Incidents & SOS'), path: '/alerts', icon: Radio, badgeCount: 4 },
      ],
    },
    {
      groupName: t('nav.groupRecords', 'RECORDS'),
      items: [
        { name: t('nav.reportsHistory', 'Reports & History'), path: '/historical', icon: History },
        { name: t('nav.userFeedback', 'User Feedback'), path: '/feedback', icon: MessageSquarePlus },
      ],
    },
    {
      groupName: t('nav.groupAdmin', 'ADMINISTRATION'),
      items: [
        { name: t('nav.adminCenter', 'Admin Center'), path: '/admin', icon: ShieldCheck, badge: 'ROOT' },
        { name: t('nav.settings', 'Settings'), path: '/settings', icon: Sliders },
      ],
    },
  ];

  /**
   * Precise active matching per navigation item to guarantee independence.
   * Prevents combined/overlapping active highlights across adjacent links.
   */
  const isItemActive = (itemPath: string): boolean => {
    const currentPath = location.pathname;

    if (itemPath === '/') {
      return currentPath === '/';
    }

    if (itemPath === '/priorities') {
      return currentPath === '/priorities';
    }

    if (itemPath === '/damage-assessment') {
      return currentPath === '/damage-assessment';
    }

    if (itemPath === '/admin') {
      return currentPath === '/admin' || currentPath.startsWith('/admin/');
    }

    if (itemPath === '/settings') {
      return currentPath === '/settings';
    }

    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen?.(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:z-30 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : 'md:w-20 lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-950/40">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-white text-base tracking-tight truncate leading-tight">
                  DisasterGuard <span className="text-orange-400">AI</span>
                </span>
                <span className="text-[10px] text-orange-400/90 font-mono tracking-wider font-bold">
                  Multi-Hazard DSS • NDMA
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen?.(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Region */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              {(!collapsed || mobileOpen) && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                  {group.groupName}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen?.(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                      active
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-900/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {(!collapsed || mobileOpen) && <span className="truncate flex-1">{item.name}</span>}

                    {(!collapsed || mobileOpen) && item.badge && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        active
                          ? 'bg-orange-700/80 text-orange-100 border border-orange-500/50'
                          : 'bg-slate-800 text-orange-400 border border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {(!collapsed || mobileOpen) && item.badgeCount && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500 text-white animate-pulse">
                        {item.badgeCount}
                      </span>
                    )}

                    {/* Tooltip for collapsed desktop state */}
                    {collapsed && !mobileOpen && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer — Model Status Cards & Authenticated Persona Area */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2.5 shrink-0">
          {/* Model Status Cards */}
          {!collapsed ? (
            <div className="space-y-1.5">
              {/* Random Forest Card (Clickable Diagnostics) */}
              <button
                type="button"
                onClick={() => setSelectedModelDialog('rf')}
                className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors text-xs cursor-pointer block"
                title="Click to view Random Forest inference diagnostics"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-orange-400" />
                    Random Forest
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 font-mono truncate">
                  landslide_model.pkl (9-Param)
                </p>
              </button>

              {/* U-Net Vision Card (Clickable Diagnostics) */}
              <button
                type="button"
                onClick={() => setSelectedModelDialog('unet')}
                className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors text-xs cursor-pointer block"
                title="Click to view U-Net segmentation diagnostics"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    U-Net Vision
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded border font-bold ${
                      isUnetReady
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}
                  >
                    {isUnetReady ? 'READY' : 'STANDBY'}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 font-mono truncate">
                  SIH26001_Landslide_UNet.keras
                </p>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1" title="Models: RF & U-Net (Active)">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
          )}

          {/* User Profile / Switch Persona */}
          <button
            type="button"
            onClick={() => setShowRoleModal(true)}
            className="w-full flex items-center justify-between pt-1 border-t border-slate-800/60 hover:bg-slate-800/60 p-1.5 rounded-xl transition-colors text-left cursor-pointer"
            title={`Active Persona: ${currentUser.name} (${currentUser.role}) — Click to switch`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/30 shrink-0">
                <User className="w-4 h-4 text-orange-400" />
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-white truncate leading-none">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-orange-400 font-mono truncate mt-1">
                    {currentUser.role} • {currentUser.designation || currentUser.agency}
                  </span>
                </div>
              )}
            </div>
          </button>
        </div>
      </aside>

      {/* Model Diagnostic Modal */}
      {selectedModelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-white shadow-2xl relative text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-400" />
                <span>
                  {selectedModelDialog === 'rf'
                    ? 'Random Forest Geotechnical Classifier'
                    : 'U-Net 2D Satellite Segmentation Engine'}
                </span>
              </h3>
              <button
                onClick={() => setSelectedModelDialog(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedModelDialog === 'rf' ? (
              <div className="space-y-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div><strong>Model File:</strong> backend/ml_models/landslide_model.pkl</div>
                  <div><strong>Architecture:</strong> Scikit-Learn Random Forest</div>
                  <div><strong>Features:</strong> 9 Parameters (Slope, Rainfall, Moisture, etc.)</div>
                  <div><strong>Inference Latency:</strong> ~24ms (Local Engine)</div>
                  <div><strong>Health Status:</strong> <span className="text-emerald-400 font-bold">ONLINE & OPERATIONAL</span></div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Trained on multi-regional historical landslide datasets to provide real-time probability estimates for slope failures under varying precipitation regimes.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div><strong>Model File:</strong> SIH26001_Landslide_UNet.keras</div>
                  <div><strong>Architecture:</strong> Convolutional Encoder-Decoder</div>
                  <div><strong>Input Format:</strong> 128x128 Multispectral Band Imagery</div>
                  <div><strong>Inference Mode:</strong> {isUnetReady ? 'READY (TensorFlow/Keras)' : 'STANDBY'}</div>
                  <div><strong>Health Status:</strong> <span className="text-cyan-400 font-bold">{isUnetReady ? 'ONLINE' : 'STANDBY'}</span></div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Performs pixel-level delineation of landslide scar zones and calculates high-resolution geospatial area footprints from satellite imagery passes.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedModelDialog(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </>
  );
};
