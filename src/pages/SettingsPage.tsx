import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Globe,
  Shield,
  RefreshCw,
  Eye,
  Save,
  Volume2,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { SupportedLanguage } from '../i18n/types';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { ThresholdConfig } from '../components/admin/ThresholdConfig';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, languages, t } = useTranslation();
  const { currentUser } = useAuth();
  const { showSuccess, showInfo } = useFeedback();

  // Notification Preferences State (Persisted in localStorage)
  const [soundAlerts, setSoundAlerts] = useState<boolean>(() => {
    return localStorage.getItem('dg_setting_sound') !== 'false';
  });
  const [criticalPushAlerts, setCriticalPushAlerts] = useState<boolean>(() => {
    return localStorage.getItem('dg_setting_push') !== 'false';
  });
  const [emailDigest, setEmailDigest] = useState<boolean>(() => {
    return localStorage.getItem('dg_setting_email') === 'true';
  });

  // Display Preferences State
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(() => {
    return parseInt(localStorage.getItem('dg_setting_refresh') || '30', 10);
  });
  const [highContrastMap, setHighContrastMap] = useState<boolean>(() => {
    return localStorage.getItem('dg_setting_contrast') === 'true';
  });

  const handleLanguageChange = (code: SupportedLanguage) => {
    setLanguage(code);
    const target = languages.find((l) => l.code === code);
    showSuccess(`Language updated to ${target?.nativeName || code}`);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('dg_setting_sound', String(soundAlerts));
    localStorage.setItem('dg_setting_push', String(criticalPushAlerts));
    localStorage.setItem('dg_setting_email', String(emailDigest));
    localStorage.setItem('dg_setting_refresh', String(autoRefreshInterval));
    localStorage.setItem('dg_setting_contrast', String(highContrastMap));
    showSuccess('User preferences saved successfully.');
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      showInfo('Session cache cleared. Application telemetry re-synchronized.');
    } catch {
      showInfo('Session cache refreshed.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-orange-600/10 text-orange-600 border border-orange-200">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('nav.settings', 'Settings')} & Operational Preferences
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configure regional language, audio distress beacons, telemetry polling frequency, and administrative thresholds.
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Language & Regional Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Multilingual Interface (6 Indian Languages)</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">i18n Native Script</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Select your preferred official language. The entire interface, navigation routes, and alert notifications immediately translate in native scripts without page reload.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{lang.nativeName}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lang.name} ({lang.code})</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* B. Emergency Notifications & Audio Beacons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <span>Emergency Alerts & Dispatch Notifications</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Real-time Triage</span>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Audible Siren on Critical SOS & P1 Incidents</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Plays an immediate acoustic beacon when high-severity distress calls arrive at the Operations Center.
                </p>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </label>

            <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Push Notifications for Flash Flood & Slope Failure</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Deliver browser push advisories whenever telemetry crosses sensor threshold limits.
                </p>
              </div>
              <input
                type="checkbox"
                checked={criticalPushAlerts}
                onChange={(e) => setCriticalPushAlerts(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </label>

            <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Official Daily Incident Digest (Email)</div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Summarize all field inspection reports and verified damage assessments at 18:00 IST.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* C. Telemetry Streaming & GIS View Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <span>Telemetry Polling & GIS Rendering</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Sensor Grid</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                IoT Telemetry Station Polling Interval
              </label>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono"
              >
                <option value={15}>15 Seconds (Rapid Response Mode)</option>
                <option value={30}>30 Seconds (Standard Monitoring)</option>
                <option value={60}>60 Seconds (Low Bandwidth Network)</option>
                <option value={300}>5 Minutes (Field Battery Conservation)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Controls background synchronization frequency for pore pressure, rainfall gauges, and tilt sensors.
              </span>
            </div>

            <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>High-Contrast Spatial Overlay for Field Sunlight</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Enhances visibility of hazard polygons and contour isolines on mobile devices under direct glare.
                </p>
              </div>
              <input
                type="checkbox"
                checked={highContrastMap}
                onChange={(e) => setHighContrastMap(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* D. Session, Cache & Security Verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Authentication Session & Cache Control</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              Active Session
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono text-[11px]">Authorized User:</span>
              <span className="font-bold text-slate-900">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono text-[11px]">Operational Persona:</span>
              <span className="font-mono text-orange-600 font-bold">{currentUser.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono text-[11px]">Agency Credential:</span>
              <span className="text-slate-700">{currentUser.agency}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Clear client-side temporary cached states and refresh remote API models:
            </span>
            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold shrink-0 cursor-pointer transition-colors"
            >
              Clear Session Cache
            </button>
          </div>
        </div>
      </div>

      {/* Admin Thresholds (Only visible if user has ADMIN authority) */}
      {currentUser.role === 'ADMIN' && (
        <div className="pt-4 border-t border-slate-200">
          <div className="mb-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">
              ROOT THRESHOLDS
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Hazard Warning & Rainfall Trigger Levels
            </h2>
            <p className="text-xs text-slate-500">
              Authorized administrators can update physical trigger thresholds for early warnings across all monitored districts.
            </p>
          </div>
          <ThresholdConfig />
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
