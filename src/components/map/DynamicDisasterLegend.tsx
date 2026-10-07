import React, { useState } from 'react';
import { DisasterMapLayersState } from '../../types/map';
import { ChevronUp, ChevronDown, ListFilter } from 'lucide-react';

interface DynamicDisasterLegendProps {
  layers: DisasterMapLayersState;
}

export const DynamicDisasterLegend: React.FC<DynamicDisasterLegendProps> = ({ layers }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-lg text-xs font-sans max-w-xs transition-all">
      {/* Header with collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-t-xl border-b border-slate-100 font-bold text-slate-800 text-[11px] uppercase tracking-wider"
      >
        <div className="flex items-center gap-1.5">
          <ListFilter className="w-3.5 h-3.5 text-slate-600" />
          <span>Active Map Legend</span>
        </div>
        {collapsed ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {!collapsed && (
        <div className="p-3 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {/* Landslide Risk Classification */}
          {layers.hazards.landslideRisk && (
            <div>
              <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                Landslide Hazard Score
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                  <span className="text-[11px] text-slate-800 font-medium">🚨 CRITICAL (&gt;80) — Evacuate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></span>
                  <span className="text-[11px] text-slate-800 font-medium">🔴 HIGH (61-80) — Active Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-[11px] text-slate-800 font-medium">🟠 ELEVATED (41-60) — Precaution</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0"></span>
                  <span className="text-[11px] text-slate-800 font-medium">🟡 MODERATE (21-40) — Watch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-[11px] text-slate-800 font-medium">🟢 LOW (0-20) — Stable</span>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Infrastructure */}
          {layers.emergency.emergencyShelters && (
            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                Emergency Facilities
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span>🏠</span>
                  <span>Safe Shelter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🏥</span>
                  <span>Hospital</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🚒</span>
                  <span>Fire Station</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🚑</span>
                  <span>Ambulance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>👮</span>
                  <span>Police</span>
                </div>
              </div>
            </div>
          )}

          {/* Sensors Status */}
          {(layers.sensors.rainfallSensors || layers.sensors.soilMoistureSensors || layers.sensors.slopeSensors) && (
            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                IoT Sensor Telemetry
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span>Offline</span>
                </div>
              </div>
            </div>
          )}

          {/* Evacuation Routes */}
          {(layers.evacuation.safeEvacuationRoutes || layers.evacuation.blockedRoads || layers.evacuation.alternativeRoutes) && (
            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                Evacuation Corridors
              </div>
              <div className="space-y-1 text-[11px] text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 rounded-full bg-emerald-500"></span>
                  <span>━━ Recommended Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 rounded-full bg-blue-500"></span>
                  <span>━━ Alternative Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 border-b-2 border-dashed border-red-500"></span>
                  <span>- - Blocked / Hazard</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
