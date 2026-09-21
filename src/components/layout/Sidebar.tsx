import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  BrainCircuit,
  ScanLine,
  CloudRain,
  Building2,
  Navigation,
  BellRing,
  History,
  BarChart3,
  ShieldCheck,
  Cpu,
  User,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { landScanService } from '../../services/landScanService';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { isOnline } = useApp();
  const [isUnetReady, setIsUnetReady] = useState<boolean>(true);

  useEffect(() => {
    landScanService
      .getModelStatus()
      .then((res) => setIsUnetReady(res.status === 'ready'))
      .catch(() => setIsUnetReady(false));
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Risk Map', path: '/risk-map', icon: MapPin },
    { name: 'AI Prediction', path: '/prediction', icon: BrainCircuit, badge: '9 Features' },
    { name: 'AI Land Scan', path: '/ai-land-scan', icon: ScanLine, badge: 'U-Net 2D' },
    { name: 'Rainfall Monitoring', path: '/rainfall', icon: CloudRain },
    { name: 'Impact Analysis', path: '/impact-analysis', icon: Building2 },
    { name: 'Evacuation Routes', path: '/evacuation', icon: Navigation },
    { name: 'Alerts', path: '/alerts', icon: BellRing, badgeCount: 4 },
    { name: 'Historical Analysis', path: '/historical', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Admin', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-950/40">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-white text-base tracking-tight truncate leading-tight">
                LandslideGuard <span className="text-orange-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold">
                SIH26001 • NDMA DSS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className={`px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${collapsed ? 'hidden' : 'block'}`}>
          Monitoring & Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && <span className="truncate flex-1">{item.name}</span>}

              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-orange-400 border border-slate-700">
                  {item.badge}
                </span>
              )}

              {!collapsed && item.badgeCount && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500 text-white animate-pulse">
                  {item.badgeCount}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2.5">
        {/* Model Status Cards */}
        {!collapsed ? (
          <div className="space-y-1.5">
            {/* Random Forest Card */}
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-orange-400" />
                  Random Forest
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ACTIVE
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono truncate">
                landslide_model.pkl (Tabular)
              </p>
            </div>

            {/* U-Net Card */}
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  U-Net Vision
                </span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
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
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5" title="Models: RF & U-Net (Active)">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
        )}

        {/* User Profile */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs border border-slate-700">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate leading-none">
                  Officer S. Sharma
                </span>
                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                  SDMA Emergency Desk
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
