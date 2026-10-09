import React, { useState } from 'react';
import {
  User,
  AlertTriangle,
  Upload,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  Phone,
  Shield,
  FileText,
  Radio,
  Building2,
  Navigation,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IncidentSubmission } from '../types/auth';

const INITIAL_SUBMISSIONS: IncidentSubmission[] = [
  {
    id: 'CIT-REP-8821',
    userId: 'USR-CTZ-550',
    userName: 'Ravi Kumar',
    incidentType: 'ROAD_BLOCKAGE',
    locationName: 'Meppadi Primary Access Road Km 14',
    coordinates: { lat: 11.542, lng: 76.168 },
    description: 'Mudslide with 4 downed power lines blocking both lanes. No vehicles can pass.',
    severity: 'HIGH',
    status: 'TRIAGED',
    timestamp: '2026-10-09T08:15:00Z',
  },
  {
    id: 'CIT-REP-8819',
    userId: 'USR-CTZ-550',
    userName: 'Ravi Kumar',
    incidentType: 'FLASH_FLOOD',
    locationName: 'Bhimavaram Ward 6 Low-Lying Settlement',
    coordinates: { lat: 16.541, lng: 81.522 },
    description: 'Canal water overtopping by 1.2m, flooding residential verandahs.',
    severity: 'MEDIUM',
    status: 'ASSIGNED',
    timestamp: '2026-10-08T16:30:00Z',
  },
];

export const UserPortalPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState<IncidentSubmission[]>(INITIAL_SUBMISSIONS);

  // Form State
  const [incidentType, setIncidentType] = useState<'LANDSLIDE' | 'FLASH_FLOOD' | 'STRUCTURAL_COLLAPSE' | 'ROAD_BLOCKAGE' | 'EROSION'>('LANDSLIDE');
  const [locationName, setLocationName] = useState('Chooralmala Bridge Perimeter');
  const [lat, setLat] = useState('11.5367');
  const [lng, setLng] = useState('76.1782');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [description, setDescription] = useState('Slope collapse behind community hall. 4 residential structures endangered by advancing debris.');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const handleAcquireGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
        },
        () => {
          // fallback
          setLat('11.5367');
          setLng('76.1782');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: IncidentSubmission = {
      id: `CIT-REP-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      incidentType,
      locationName,
      coordinates: {
        lat: parseFloat(lat) || 11.5367,
        lng: parseFloat(lng) || 76.1782,
      },
      description,
      severity,
      photoUrl,
      status: 'SUBMITTED',
      timestamp: new Date().toISOString(),
    };

    setSubmissions([newSub, ...submissions]);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
              CITIZEN & VOLUNTEER PORTAL
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">
              LOGGED IN: {currentUser.name} ({currentUser.role})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Community Disaster Observation & Reporting Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit real-time disaster observations with GPS coordinates and photographic proof to help emergency managers prioritize response.
          </p>
        </div>

        {/* Quick Emergency Call Button */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:1078"
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 animate-pulse"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>NDRF Hotline: 1078</span>
          </a>
        </div>
      </div>

      {submittedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <strong>Incident Successfully Transmitted to District Command Center!</strong>
            <p className="text-[11px] text-emerald-800">
              Your observation has been queued for immediate triage by the DisasterGuard priority ranking engine.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Reporting Form & History + Hotlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Public Incident Reporting Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span>Submit Citizen Disaster Report</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Instant Triage</span>
            </div>

            {/* Type & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Observed Hazard Vector *</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                >
                  <option value="LANDSLIDE">⛰️ Landslide / Debris Flow</option>
                  <option value="FLASH_FLOOD">🌊 Flash Flood / Waterlog</option>
                  <option value="STRUCTURAL_COLLAPSE">🏢 Building Structural Collapse</option>
                  <option value="ROAD_BLOCKAGE">🚧 Arterial Road Severed / Blocked</option>
                  <option value="EROSION">🌾 Riverbank Toe Erosion</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Immediate Danger Level *</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-bold font-mono"
                >
                  <option value="CRITICAL">CRITICAL — Human Life in Immediate Danger</option>
                  <option value="HIGH">HIGH — Structural Collapse or Blocked Route</option>
                  <option value="MEDIUM">MEDIUM — Moderate Flooding / Property Damage</option>
                  <option value="LOW">LOW — Precautionary Observation</option>
                </select>
              </div>
            </div>

            {/* Location & GPS Fix */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Location / Landmark Description *</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Near Government High School, Meppadi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAcquireGps}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold text-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>Use Device GPS</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Incident Description & Context *</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current water level, trapped individuals, road passability, or sounds of slope cracking..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            {/* Photo Attachment URL */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Photographic Proof URL / Attachment</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/30 flex items-center gap-2 cursor-pointer text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Citizen Report</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Submission History & Emergency Hotlines (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Submissions History */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>My Submitted Reports ({submissions.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Live Status Tracker</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{sub.incidentType.replace(/_/g, ' ')}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-black ${
                        sub.status === 'VERIFIED' || sub.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'ASSIGNED'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">{sub.locationName}</div>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{sub.description}</p>
                  <div className="text-[9px] font-mono text-slate-400 pt-1 flex items-center justify-between">
                    <span>{sub.id}</span>
                    <span>{new Date(sub.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Lifeline Contact Cards */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span>Emergency Verified Lifeline Contacts</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <a
                href="tel:1078"
                className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-950 font-bold flex flex-col hover:bg-red-100 transition-colors"
              >
                <span className="text-[10px] text-red-700">NDRF CONTROL</span>
                <span className="text-base text-red-600 font-black">1078</span>
              </a>

              <a
                href="tel:112"
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold flex flex-col hover:bg-slate-100 transition-colors"
              >
                <span className="text-[10px] text-slate-500">NATIONAL EMERGENCY</span>
                <span className="text-base text-slate-800 font-black">112</span>
              </a>

              <a
                href="tel:108"
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 font-bold flex flex-col hover:bg-emerald-100 transition-colors"
              >
                <span className="text-[10px] text-emerald-700">AMBULANCE / EMS</span>
                <span className="text-base text-emerald-600 font-black">108</span>
              </a>

              <a
                href="tel:1070"
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-950 font-bold flex flex-col hover:bg-amber-100 transition-colors"
              >
                <span className="text-[10px] text-amber-700">STATE DISASTER RELIEF</span>
                <span className="text-base text-amber-600 font-black">1070</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPortalPage;
