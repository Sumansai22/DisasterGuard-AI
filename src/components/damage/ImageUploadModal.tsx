import React, { useState } from 'react';
import {
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Calendar,
  MapPin,
  Cpu,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { ImageMetadata, DamageAssessmentRecord } from '../../types/damageAssessment';
import { damageAssessmentService } from '../../services/damageAssessmentService';
import { useFeedback } from '../../context/FeedbackContext';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCreated: (record: DamageAssessmentRecord) => void;
}

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onAssessmentCreated,
}) => {
  const [title, setTitle] = useState('');
  const [disasterEvent, setDisasterEvent] = useState('Monsoon Cloudburst / Inundation 2026');
  const [disasterType, setDisasterType] = useState<'LANDSLIDE' | 'FLASH_FLOOD' | 'CYCLONE' | 'EARTHQUAKE' | 'SUBSIDENCE'>('LANDSLIDE');
  const [locationName, setLocationName] = useState('Wayanad Meppadi Sector');
  const [district, setDistrict] = useState('Wayanad');
  const [state, setState] = useState('Kerala');
  const [lat, setLat] = useState('11.5367');
  const [lng, setLng] = useState('76.1782');

  // Pre Image
  const [preImage, setPreImage] = useState<ImageMetadata>({
    filename: 'baseline_optical_pre.jpg',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    captureDate: '2024-07-20T06:00:00Z',
    sourcePlatform: 'Sentinel-2 Multispectral',
    resolutionMeters: 10.0,
    dimensions: { width: 1920, height: 1080 },
    fileSizeBytes: 2450000,
  });

  // Post Image
  const [postImage, setPostImage] = useState<ImageMetadata>({
    filename: 'disaster_uav_post.jpg',
    url: 'https://images.unsplash.com/photo-1618767689160-da3fb810aad7?auto=format&fit=crop&w=1200&q=80',
    captureDate: new Date().toISOString(),
    sourcePlatform: 'DJI Matrice 300 UAV',
    resolutionMeters: 0.15,
    dimensions: { width: 3840, height: 2160 },
    fileSizeBytes: 6780000,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const { showSuccess, showError, showLoading, dismissFeedback } = useFeedback();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isPost: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    // Validate type
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|tif|tiff)$/i)) {
      setValidationError(`Unsupported file type: ${file.name}. Allowed: .jpg, .png, .webp, .tiff`);
      showError(`Unsupported file format. Please upload JPG, PNG, WebP, or TIFF.`);
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 15MB limit.`);
      showError(`File size exceeds 15MB limit.`);
      return;
    }

    // Create object URL
    const url = URL.createObjectURL(file);
    const meta: ImageMetadata = {
      filename: file.name,
      url,
      captureDate: isPost ? new Date().toISOString() : '2024-06-15T08:00:00Z',
      sourcePlatform: isPost ? 'DJI Matrice 300 UAV' : 'Sentinel-2 Multispectral',
      resolutionMeters: isPost ? 0.2 : 10.0,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: file.size,
    };

    if (isPost) {
      setPostImage(meta);
    } else {
      setPreImage(meta);
    }
    showSuccess('Image uploaded successfully.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return; // Prevent duplicate submission

    if (!title.trim()) {
      setValidationError('Please provide an assessment title.');
      showError('Please provide an assessment title.');
      return;
    }

    setIsAnalyzing(true);
    setValidationError(null);
    const loadId = showLoading('Analyzing image...');

    setTimeout(() => {
      try {
        const inference = damageAssessmentService.runAiDamageInference({
          preImage,
          postImage,
          disasterType,
          locationName,
        });

        const newRecord = damageAssessmentService.createAssessment({
          title: title.trim(),
          disasterEvent: disasterEvent.trim(),
          disasterType,
          locationName: locationName.trim(),
          district: district.trim(),
          state: state.trim(),
          coordinates: {
            lat: parseFloat(lat) || 11.5367,
            lng: parseFloat(lng) || 76.1782,
          },
          preImage,
          postImage,
          estimatedDamageCategory: inference.estimatedCategory,
          priorityTier: inference.priorityTier,
          scores: inference.scores,
          priorityRationale: inference.priorityRationale,
          visualEvidence: inference.visualEvidence,
          uncertaintyFactors: inference.uncertaintyFactors,
          operationalLimitations: inference.operationalLimitations,
          verificationStatus: 'PENDING_REVIEW',
          inspectionStatus: 'QUEUE',
        });

        setIsAnalyzing(false);
        dismissFeedback(loadId);
        showSuccess('Analysis completed. Review the estimated findings below.');
        showSuccess('Damage assessment saved successfully.');
        onAssessmentCreated(newRecord);
        onClose();
      } catch (err: any) {
        setIsAnalyzing(false);
        dismissFeedback(loadId);
        setValidationError(err.message || 'Analysis pipeline failed.');
        showError('Could not complete the assessment. Check the connection and try again.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-4 sm:p-6 text-slate-800 relative font-sans max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                Upload Disaster Imagery Pair (PS-53)
              </h2>
              <p className="text-xs text-slate-500">
                Bitemporal change detection & automated damage priority classification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 py-4 space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title & Disaster Event */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assessment Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Meppadi West Culvert Damage"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Disaster Event Name
              </label>
              <input
                type="text"
                value={disasterEvent}
                onChange={(e) => setDisasterEvent(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Hazard Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hazard Type
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="LANDSLIDE">Landslide / Debris Flow</option>
                <option value="FLASH_FLOOD">Flash Flood / Inundation</option>
                <option value="CYCLONE">Cyclone / Wind Storm</option>
                <option value="EARTHQUAKE">Earthquake</option>
                <option value="SUBSIDENCE">Slope Subsidence</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District & State
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="w-full text-xs px-2 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full text-xs px-2 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Bitemporal Image Upload Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Pre-Disaster Upload */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Pre-Disaster Baseline Image
                </span>
                <span className="text-[10px] text-slate-500">Max 15MB</span>
              </div>
              <div className="h-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 relative group">
                <img src={preImage.url} alt="Pre preview" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold">
                  <Upload className="w-5 h-5 mb-1" />
                  Replace Pre-Image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.tif,.tiff"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, false)}
                  />
                </label>
              </div>
              <div className="text-[11px] font-mono text-slate-600 truncate">
                {preImage.filename} ({preImage.sourcePlatform})
              </div>
            </div>

            {/* Post-Disaster Upload */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Post-Disaster Target Image
                </span>
                <span className="text-[10px] text-slate-500">Max 15MB</span>
              </div>
              <div className="h-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 relative group">
                <img src={postImage.url} alt="Post preview" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold">
                  <Upload className="w-5 h-5 mb-1" />
                  Replace Post-Image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.tif,.tiff"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, true)}
                  />
                </label>
              </div>
              <div className="text-[11px] font-mono text-slate-600 truncate">
                {postImage.filename} ({postImage.sourcePlatform})
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing AI Change Detection & Ranking...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Run AI Damage Analysis & Queue Priority</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
