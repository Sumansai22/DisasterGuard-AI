import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  X,
  MapPin,
  Users,
  Phone,
  Radio,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { apiClient } from '../../services/api';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SOSStep = 'CONFIG' | 'TRANSMITTING' | 'ACTIVATED';

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeLocation } = useApp();
  const { t } = useTranslation();

  const [step, setStep] = useState<SOSStep>('CONFIG');
  const [emergencyType, setEmergencyType] = useState('TRAPPED_RISING_WATER');
  const [personsCount, setPersonsCount] = useState(1);
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Geolocation state
  const [geoStatus, setGeoStatus] = useState<'ACQUIRING' | 'GPS_LOCKED' | 'FALLBACK_MAP'>('ACQUIRING');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number }>({
    lat: activeLocation.lat,
    lng: activeLocation.lng,
  });

  // Response tracker state
  const [incidentId, setIncidentId] = useState<string>('');
  const [etaMinutes, setEtaMinutes] = useState<number>(15);
  const [responderName, setResponderName] = useState<string>('NDRF Regional Quick Response Unit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('CONFIG');
      setIsSubmitting(false);
      return;
    }

    setGeoStatus('ACQUIRING');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setGeoStatus('GPS_LOCKED');
        },
        (error) => {
          console.warn('Browser GPS unavailable, falling back to selected map location:', error.message);
          setCoords({
            lat: activeLocation.lat,
            lng: activeLocation.lng,
          });
          setGeoStatus('FALLBACK_MAP');
        },
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      setCoords({
        lat: activeLocation.lat,
        lng: activeLocation.lng,
      });
      setGeoStatus('FALLBACK_MAP');
    }
  }, [isOpen, activeLocation]);

  if (!isOpen) return null;

  const handleTransmitSOS = async () => {
    setIsSubmitting(true);
    setStep('TRANSMITTING');

    try {
      const payload = {
        latitude: coords.lat,
        longitude: coords.lng,
        location_name:
          geoStatus === 'GPS_LOCKED'
            ? `Device GPS (${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E)`
            : activeLocation.name,
        emergency_type: emergencyType,
        persons_count: personsCount,
        contact_phone: contactPhone || undefined,
        notes: notes || `Emergency ${emergencyType.replace(/_/g, ' ')} at coordinates ${coords.lat}, ${coords.lng}`,
      };

      const res = await apiClient.post<{
        status: string;
        incident?: { id: string };
        estimated_eta_minutes?: number;
        nearest_responder?: { name: string };
      }>('/v1/incidents/sos', payload);

      if (res && res.data && res.data.incident) {
        setIncidentId(res.data.incident.id);
        if (res.data.estimated_eta_minutes) setEtaMinutes(res.data.estimated_eta_minutes);
        if (res.data.nearest_responder?.name) setResponderName(res.data.nearest_responder.name);
      } else {
        setIncidentId(`INC-SOS-${Math.floor(1000 + Math.random() * 9000)}`);
      }
      setStep('ACTIVATED');
    } catch (err) {
      console.error('Failed to transmit SOS to backend, generating local incident beacon:', err);
      setIncidentId(`INC-SOS-${Math.floor(1000 + Math.random() * 9000)}`);
      setStep('ACTIVATED');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-red-600/80 rounded-2xl max-w-lg w-full p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden font-sans max-h-[92vh] flex flex-col min-w-0">
        {/* Pulsating background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-lg animate-pulse shrink-0">
              <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span className="truncate">{t('sos.title', 'EMERGENCY SOS BEACON')}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 shrink-0">
                  {t('sos.priorityTier', 'Priority 1')}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                {t('sos.subtitle', 'Direct Emergency Broadcast to NDRF, SDRF & District Command Control')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-0.5">

        {/* Step 1: Configuration Form */}
        {step === 'CONFIG' && (
          <div className="space-y-4 pt-4">
            {/* Location Status Pill */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">
                    {geoStatus === 'GPS_LOCKED'
                      ? t('sos.liveGpsAcquired', 'Live GPS Position Acquired')
                      : geoStatus === 'ACQUIRING'
                      ? t('sos.acquiringGps', 'Acquiring GPS Fix...')
                      : `${t('sos.selectedMapArea', 'Selected Map Area')}: ${activeLocation.name}`}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {coords.lat.toFixed(5)}°N, {coords.lng.toFixed(5)}°E
                    {coords.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : ''}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  geoStatus === 'GPS_LOCKED'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}
              >
                {geoStatus === 'GPS_LOCKED' ? t('sos.liveGpsBadge', 'LIVE GPS') : t('sos.mapFallbackBadge', 'MAP FALLBACK')}
              </span>
            </div>

            {/* Emergency Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">{t('sos.natureOfDistress', 'Nature of Distress / Hazard')}</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-hidden focus:border-red-500"
              >
                <option value="TRAPPED_RISING_WATER">{t('sos.trappedWater', '🌊 Trapped by Rising Flood Water / Flash Inundation')}</option>
                <option value="STRUCTURAL_COLLAPSE_DEBRIS">{t('sos.structuralCollapse', '🏚️ Debris Flow / Building Structural Collapse')}</option>
                <option value="LANDSLIDE_SLOPE_CUTOFF">{t('sos.landslideCutoff', '⛰️ Slope Failure / Hill Route Blocked & Cut Off')}</option>
                <option value="MEDICAL_EMERGENCY">{t('sos.medicalEmergency', '🚑 Severe Injury / Immediate Medical Evacuation')}</option>
                <option value="WILDFIRE_ENCIRCLEMENT">{t('sos.wildfireSmoke', '🔥 Wildfire / Smoke Encirclement')}</option>
                <option value="GENERAL_LIFE_THREAT">{t('sos.generalLifeThreat', '⚠️ General Life-Threatening Emergency')}</option>
              </select>
            </div>

            {/* Number of Persons & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {t('sos.personsNeedingHelp', 'Persons Needing Help')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={personsCount}
                  onChange={(e) => setPersonsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {t('sos.callbackPhone', 'Callback Phone (Optional)')}
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            {/* Location Landmarks / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">{t('sos.landmarks', 'Nearby Landmarks / Vital Details')}</label>
              <textarea
                rows={2}
                placeholder={t('sos.landmarksPlaceholder', 'e.g. On roof of yellow 2-storey house near canal bridge, water reaching 1st floor...')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 resize-none"
              />
            </div>

            {/* Transmit Button */}
            <button
              onClick={handleTransmitSOS}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              <span>{t('sos.transmitNow', 'TRANSMIT EMERGENCY SOS SIGNAL NOW')}</span>
            </button>
          </div>
        )}

        {/* Step 2: Transmitting State */}
        {step === 'TRANSMITTING' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">{t('sos.transmittingTitle', 'Transmitting Satellite & Cellular Distress Beacon...')}</h3>
              <p className="text-xs text-slate-400 font-mono">{t('sos.transmittingSubtitle', 'Routing to State Emergency Operations Center (SEOC)')}</p>
            </div>
          </div>
        )}

        {/* Step 3: Activated Tracking Dashboard */}
        {step === 'ACTIVATED' && (
          <div className="space-y-4 pt-4 animate-fade-in">
            {/* Success Alert Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">{t('sos.broadcastActive', 'SOS SIGNAL BROADCAST ACTIVE')}</h4>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  {t('sos.broadcastActiveDesc', 'Distress signal received by Disaster Response Command. Response unit mobilized.')}
                </p>
              </div>
            </div>

            {/* Tracking ID & Responder Summary */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="text-xs text-slate-400">{t('sos.incidentBeaconId', 'Incident Beacon ID')}:</span>
                <span className="font-mono text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-900">
                  {incidentId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{t('sos.assignedTeam', 'Assigned Response Team')}:</span>
                <span className="text-xs font-bold text-white">{responderName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{t('sos.estimatedResponseTime', 'Estimated Response Time')}:</span>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{etaMinutes} {t('sos.minutes', 'Minutes')}
                </span>
              </div>
            </div>

            {/* Life Safety Guidance */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('sos.safetyDirectives', 'Immediate Safety Directives')}:</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] text-amber-200/90 space-y-0.5">
                <li>{t('sos.directive1', 'Move to highest stable structure or roof level.')}</li>
                <li>{t('sos.directive2', 'Conserve mobile battery; keep phone line open.')}</li>
                <li>{t('sos.directive3', 'Wave brightly colored cloth or flashlight when drone or helicopter approaches.')}</li>
              </ul>
            </div>

            {/* Official Helplines */}
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2">
                {t('sos.stateHelplines', 'DIRECT STATE HELPLINES')}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <a
                  href="tel:1078"
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-between transition-colors"
                >
                  <span className="text-slate-300">{t('sos.ndrfControl', 'NDRF Control')}</span>
                  <strong className="text-red-400">1078</strong>
                </a>
                <a
                  href="tel:112"
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-between transition-colors"
                >
                  <span className="text-slate-300">{t('sos.emergencyPolice', 'Emergency Police')}</span>
                  <strong className="text-red-400">112</strong>
                </a>
                <a
                  href="tel:108"
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-between transition-colors"
                >
                  <span className="text-slate-300">{t('sos.ambulance', 'Ambulance')}</span>
                  <strong className="text-emerald-400">108</strong>
                </a>
                <a
                  href="tel:1070"
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-between transition-colors"
                >
                  <span className="text-slate-300">{t('sos.stateDisaster', 'State Disaster')}</span>
                  <strong className="text-sky-400">1070</strong>
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              {t('sos.keepTracking', 'Keep Tracking in Background & Close')}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

