import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  Navigation,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import disasterManagementService from '../../services/disasterManagementService';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentReported?: (incidentId: string) => void;
  initialLocation?: { name: string; lat: number; lng: number };
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  onIncidentReported,
  initialLocation,
}) => {
  const [incidentType, setIncidentType] = useState<string>('LANDSLIDE');
  const [locationName, setLocationName] = useState<string>(initialLocation?.name || 'Bhimavaram Area');
  const [latitude, setLatitude] = useState<number>(initialLocation?.lat || 16.5448);
  const [longitude, setLongitude] = useState<number>(initialLocation?.lng || 81.5212);
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('HIGH');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(5)));
        setLongitude(Number(pos.coords.longitude.toFixed(5)));
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the situation or hazard condition.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await disasterManagementService.reportCitizenIncident({
        incidentType,
        latitude,
        longitude,
        locationName,
        description,
        priority,
        photoFilename: photoName || undefined,
      });

      setSubmittedId(res.incidentId);
      if (onIncidentReported) {
        onIncidentReported(res.incidentId);
      }
    } catch (err: any) {
      console.error('Failed to submit citizen incident:', err);
      setErrorMsg(err?.response?.data?.detail || 'Failed to submit incident report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedId(null);
    setDescription('');
    setPhotoPreview(null);
    setPhotoName('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
                Citizen Incident Report
              </h2>
              <p className="text-xs text-slate-400">
                Direct incident reporting to DisasterGuard Emergency Command
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 md:p-6 space-y-4">
          {submittedId ? (
            /* Success confirmation */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Incident Report Recorded</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Your incident report has been dispatched to the DisasterGuard Operations queue for verification.
                </p>
              </div>

              <div className="bg-slate-950 border border-cyan-800/50 rounded-xl p-4 max-w-sm mx-auto text-center">
                <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Incident Reference ID</span>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{submittedId}</div>
                <div className="mt-2 text-xs text-slate-400">Status: <span className="text-amber-400 font-semibold">CREATED / QUEUED</span></div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-400 max-w-md mx-auto text-left">
                <ShieldAlert className="w-4 h-4 text-cyan-400 inline mr-1" />
                Command center operators and emergency dispatchers review active reports continuously. In immediate life threat scenarios, contact 112 / 1070 directly.
              </div>

              <div className="pt-2">
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition shadow-lg shadow-cyan-900/30 text-sm"
                >
                  Done & Return to Map
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Incident Type & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Incident Type</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="LANDSLIDE">Landslide / Slope Failure</option>
                    <option value="FLOOD">Flood / Inundation</option>
                    <option value="FLASH_FLOOD">Flash Flood Spate</option>
                    <option value="ROAD_BLOCKAGE">Road / Highway Blockage</option>
                    <option value="STRUCTURAL_DAMAGE">Bridge / Building Damage</option>
                    <option value="POWER_OUTAGE">Power Infrastructure Outage</option>
                    <option value="CYCLONE">Cyclone / Storm Debris</option>
                    <option value="WILDFIRE">Wildfire / Forest Blaze</option>
                    <option value="OTHER">Other Hazard Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Perceived Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate Life Threat)</option>
                    <option value="HIGH">HIGH (Severe Danger / Trapped)</option>
                    <option value="MEDIUM">MEDIUM (Hazard Developing)</option>
                    <option value="LOW">LOW (Observation / Minor Obstacle)</option>
                  </select>
                </div>
              </div>

              {/* Location Name & GPS */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Location / Landmark</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Bhimavaram Canal Road, Near Bridge #4"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleUseGPS}
                disabled={gpsLoading}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs flex items-center justify-center gap-1.5 transition"
              >
                {gpsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>Auto-Detect Current GPS Coordinates</span>
              </button>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Incident Description & Conditions <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what is occurring, water depth, trapped individuals, blocked roads, or power lines down..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              {/* Photo Upload Preview */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Photo Evidence (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs transition">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoName && (
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">{photoName}</span>
                  )}
                </div>

                {photoPreview && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border border-slate-800 max-h-36">
                    <img
                      src={photoPreview}
                      alt="Uploaded preview"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoName('');
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/90"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-tight">
                <strong>Emergency Notice:</strong> Submissions are logged to DisasterGuard operations database with digital timestamp. For immediate life rescue, call Emergency Hotline 112 / 1070.
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-rose-900/30 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording Report...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Transmit Incident Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportIncidentModal;
