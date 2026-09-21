import React, { useState } from 'react';
import { MonitoringStation } from '../../types/map';
import { MONITORED_STATIONS } from '../../utils/constants';
import { RiskBadge } from '../common/RiskBadge';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Edit3, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const StationManager: React.FC = () => {
  const [stations, setStations] = useState<MonitoringStation[]>(MONITORED_STATIONS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New station form state
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [state, setState] = useState('Kerala');
  const [lat, setLat] = useState('11.5362');
  const [lng, setLng] = useState('76.1308');
  const [rainfall, setRainfall] = useState('80');
  const [slope, setSlope] = useState('32');
  const [soilSat, setSoilSat] = useState('70');

  const handleAddStation = (e: React.FormEvent) => {
    e.preventDefault();
    const newStation: MonitoringStation = {
      id: `STN-NEW-${Date.now().toString().slice(-4)}`,
      name: name.trim() || 'New Monitoring Station',
      region: region.trim() || 'Regional Hill Sector',
      state,
      coordinates: { lat: parseFloat(lat) || 11.53, lng: parseFloat(lng) || 76.13 },
      riskScore: 65,
      riskLevel: 'HIGH',
      prediction: 'Elevated Landslide Probability',
      confidence: 90,
      parameters: {
        rainfall_mm: parseFloat(rainfall) || 80,
        slope_angle: parseFloat(slope) || 32,
        soil_saturation: parseFloat(soilSat) || 70,
        vegetation_cover: 45,
        earthquake_activity: 0.1,
        proximity_to_water: 150,
        soil_type: 'Sand',
      },
      lastReading: 'Just now',
      status: 'ONLINE',
    };

    setStations([newStation, ...stations]);
    setAddModalOpen(false);
    setName('');
    setRegion('');
  };

  const handleDeleteStation = (id: string) => {
    setStations(stations.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Active Telemetry Stations Registry
          </h4>
          <p className="text-xs text-slate-500">
            Manage deployed IoT slope sensors, pluviometers, and piezometers
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Station
        </button>
      </div>

      {/* Station List */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {stations.map((stn) => (
          <div
            key={stn.id}
            className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-900">{stn.name}</h5>
                  <span className="text-[10px] font-mono text-slate-400">({stn.id})</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {stn.region}, {stn.state} • Lat: {stn.coordinates.lat.toFixed(4)}, Lng: {stn.coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <RiskBadge level={stn.riskLevel} score={stn.riskScore} size="sm" />
              <button
                onClick={() => setDeleteConfirmId(stn.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Station"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Station Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Monitoring Station"
        subtitle="Provision a new geotechnical telemetry sensor node"
      >
        <form onSubmit={handleAddStation} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
              Station Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wayanad Sector 7 Ridge Station"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                District / Region
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Wayanad District"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Kerala">Kerala</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold"
            >
              Save Station
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Station Removal"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-900 rounded-xl border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p>
              Are you sure you want to decommission telemetry station{' '}
              <strong className="font-mono">{deleteConfirmId}</strong>?
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmId && handleDeleteStation(deleteConfirmId)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
            >
              Confirm Decommission
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
