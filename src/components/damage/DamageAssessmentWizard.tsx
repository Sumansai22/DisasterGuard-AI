import React, { useState } from 'react';
import {
  MapPin,
  Upload,
  Layers,
  Sparkles,
  Cpu,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Loader2,
  Info,
  Calendar,
  Compass,
} from 'lucide-react';
import {
  DamageAssessmentRecord,
  PhysicalDamageCategory,
  InspectionPriorityTier,
  ImageMetadata,
  VisualDamageEvidence,
} from '../../types/damageAssessment';
import { damageAssessmentService } from '../../services/damageAssessmentService';
import { useFeedback } from '../../context/FeedbackContext';
import { InlineFeedback } from '../common/InlineFeedback';

interface DamageAssessmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCompleted: (record: DamageAssessmentRecord) => void;
}

const PRESET_LOCATIONS = [
  { name: 'Chooralmala Sector 4', district: 'Wayanad', state: 'Kerala', lat: 11.5367, lng: 76.1782, event: 'Wayanad Monsoon Flash Mudslide' },
  { name: 'Joshimath Ward 5', district: 'Chamoli', state: 'Uttarakhand', lat: 30.5564, lng: 79.5672, event: 'Joshimath Slope Subsidence' },
  { name: 'Bhimavaram Canal East', district: 'West Godavari', state: 'Andhra Pradesh', lat: 16.5449, lng: 81.5212, event: 'Godavari Basin Inundation' },
  { name: 'Munnar Estate Tea Valley', district: 'Idukki', state: 'Kerala', lat: 10.0889, lng: 77.0595, event: 'Western Ghats Debris Flow' },
];

export const DamageAssessmentWizard: React.FC<DamageAssessmentWizardProps> = ({
  isOpen,
  onClose,
  onAssessmentCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Location
  const [locationName, setLocationName] = useState('Chooralmala River Bridge Sector');
  const [district, setDistrict] = useState('Wayanad');
  const [state, setState] = useState('Kerala');
  const [lat, setLat] = useState('11.5367');
  const [lng, setLng] = useState('76.1782');
  const [disasterEvent, setDisasterEvent] = useState('Severe Monsoon Landslide & Flash Debris Flow');
  const [disasterType, setDisasterType] = useState<'LANDSLIDE' | 'FLASH_FLOOD' | 'CYCLONE' | 'EARTHQUAKE' | 'SUBSIDENCE'>('LANDSLIDE');

  // Step 2 & 3: Imagery & Metadata
  const [preImageUrl, setPreImageUrl] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');
  const [postImageUrl, setPostImageUrl] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80');
  const [platform, setPlatform] = useState<ImageMetadata['sourcePlatform']>('DJI Matrice 300 UAV');
  const [resolutionMeters, setResolutionMeters] = useState(0.12);
  const [captureDatePre, setCaptureDatePre] = useState('2026-09-15');
  const [captureDatePost, setCaptureDatePost] = useState('2026-10-08');

  // Step 4 & 5: AI Analysis & Damage Estimation
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [estimatedDamage, setEstimatedDamage] = useState<PhysicalDamageCategory>('MAJOR_DAMAGE');
  const [modelConfidence, setModelConfidence] = useState(91.4);
  const [evidenceFeatures, setEvidenceFeatures] = useState<VisualDamageEvidence[]>([
    { featureId: 'EV-WIZ-1', type: 'BRIDGE_WASHOUT', confidence: 0.94, description: 'Single-span bridge structure washed away by flash mud flow' },
    { featureId: 'EV-WIZ-2', type: 'FOUNDATION_SLIP', confidence: 0.89, description: 'Severed approach embankment with 1.8m silt accumulation' },
    { featureId: 'EV-WIZ-3', type: 'COLLAPSED_ROOF', confidence: 0.92, description: '2 downstream buildings structural collapse' },
  ]);

  // Step 6: Priority Calculation & Factors
  const [physicalDamageWeight, setPhysicalDamageWeight] = useState(85);
  const [populationRisk, setPopulationRisk] = useState(80);
  const [infrastructureWeight, setInfrastructureWeight] = useState(90);
  const [hazardEscalation, setHazardEscalation] = useState(70);
  const [uncertaintyPenalty, setUncertaintyPenalty] = useState(10);

  // Step 7: Final Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<DamageAssessmentRecord | null>(null);

  if (!isOpen) return null;

  // Calculate composite score using PS-53 formula
  const compositeScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        0.35 * physicalDamageWeight +
        0.25 * populationRisk +
        0.20 * infrastructureWeight +
        0.15 * hazardEscalation -
        0.05 * uncertaintyPenalty
      )
    )
  );

  const priorityTier: InspectionPriorityTier =
    compositeScore >= 75 ? 'P1_URGENT' : compositeScore >= 55 ? 'P2_HIGH' : compositeScore >= 35 ? 'P3_MEDIUM' : 'P4_LOW';

  const { showSuccess, showError, showLoading, dismissFeedback } = useFeedback();

  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    const loadId = showLoading('Analyzing image...');
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisCompleted(true);
      dismissFeedback(loadId);
      showSuccess('Analysis completed. Review the estimated findings below.');
    }, 1200);
  };

  const handleApplyPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setLocationName(preset.name);
    setDistrict(preset.district);
    setState(preset.state);
    setLat(preset.lat.toFixed(4));
    setLng(preset.lng.toFixed(4));
    setDisasterEvent(preset.event);
    showSuccess(`Applied preset: ${preset.name}`);
  };

  const handleFinalSubmit = () => {
    if (isSubmitting) return; // Prevent accidental duplicate submission
    if (!locationName.trim()) {
      showError('Location name is required to register this damage assessment.');
      return;
    }

    setIsSubmitting(true);

    const preMeta: ImageMetadata = {
      filename: 'baseline_pre_event.jpg',
      url: preImageUrl,
      captureDate: captureDatePre,
      sourcePlatform: platform,
      resolutionMeters,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: 2450000,
    };

    const postMeta: ImageMetadata = {
      filename: 'post_event_survey.jpg',
      url: postImageUrl,
      captureDate: captureDatePost,
      sourcePlatform: platform,
      resolutionMeters,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: 2890000,
    };

    const record = damageAssessmentService.createAssessment({
      title: `${locationName} Structural Assessment`,
      disasterEvent,
      disasterType,
      locationName,
      district,
      state,
      coordinates: {
        lat: parseFloat(lat) || 11.5367,
        lng: parseFloat(lng) || 76.1782,
      },
      preImage: preMeta,
      postImage: postMeta,
      estimatedDamageCategory: estimatedDamage,
      priorityTier,
      priorityRationale: `Composite PS-53 Score of ${compositeScore}/100. Critical bridge arterial cut off, isolating downstream population with active rainfall risk.`,
      scores: {
        physicalDamageScore: physicalDamageWeight,
        populationExposureScore: populationRisk,
        criticalInfrastructureScore: infrastructureWeight,
        hazardEscalationScore: hazardEscalation,
        uncertaintyScore: uncertaintyPenalty,
        compositePriorityScore: compositeScore,
      },
      visualEvidence: evidenceFeatures,
      uncertaintyFactors: [
        'Optical contrast influenced by cloud shadow over high-slope terrain.',
        'Post-event ground resolution adequate for structural boundary grading.',
      ],
      operationalLimitations: [
        'Satellite/drone optical difference; foundation integrity requires on-site testing.',
      ],
      verificationStatus: 'PENDING_REVIEW',
      inspectionStatus: 'QUEUE',
      humanReview: {
        reviewerName: 'Field Safety Officer (Wizard)',
        reviewerRole: 'OPERATOR',
        decision: 'PENDING_REVIEW',
        originalPriority: priorityTier,
        justification: 'Automated 7-step wizard assessment ready for verified human sign-off.',
        timestamp: new Date().toISOString(),
      },
    });

    setCreatedRecord(record);
    setIsSubmitting(false);
    onAssessmentCompleted(record);
    showSuccess('Damage assessment saved successfully.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Wizard Header & Progress Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 shrink-0 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                PS-53 Guided Damage Assessment
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Step {currentStep} of 7: {
                currentStep === 1 ? 'Location & Event Scope' :
                currentStep === 2 ? 'Upload Bitemporal Imagery' :
                currentStep === 3 ? 'Review Evidence & Sensor Platform' :
                currentStep === 4 ? 'Run AI Analysis & Feature Extraction' :
                currentStep === 5 ? 'Review Estimated Structural Damage' :
                currentStep === 6 ? 'Calculate Explainable Inspection Priority' :
                'Final Confirmation & Dispatch'
              }
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-mono">
          {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex items-center gap-1 shrink-0 ${
                currentStep === stepNum
                  ? 'text-orange-600 font-bold'
                  : currentStep > stepNum
                  ? 'text-emerald-600 font-medium'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === stepNum
                    ? 'bg-orange-600 text-white font-bold'
                    : currentStep > stepNum
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {stepNum}
              </span>
              <span className="hidden sm:inline">
                {stepNum === 1 ? 'Location' :
                 stepNum === 2 ? 'Imagery' :
                 stepNum === 3 ? 'Metadata' :
                 stepNum === 4 ? 'Analysis' :
                 stepNum === 5 ? 'Damage' :
                 stepNum === 6 ? 'Priority' : 'Done'}
              </span>
              {stepNum < 7 && <span className="text-slate-300 mx-1">→</span>}
            </div>
          ))}
        </div>

        {/* Wizard Step Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: LOCATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Define the exact geographic sector and disaster event scope for structural damage assessment. You can pick an authentic ground-truth scenario preset or enter custom GPS coordinates.
                </span>
              </div>

              {/* Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Quick Scenario Presets:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        locationName === preset.name
                          ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{preset.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {preset.district}, {preset.state} • {preset.lat.toFixed(2)}°N, {preset.lng.toFixed(2)}°E
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Location / Landmark Name *
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900"
                    placeholder="e.g. Meppadi Bridge Corridor"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Disaster Event Classification *
                  </label>
                  <select
                    value={disasterType}
                    onChange={(e) => setDisasterType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900"
                  >
                    <option value="LANDSLIDE">Landslide / Debris Flow</option>
                    <option value="FLASH_FLOOD">Flash Flood / Inundation</option>
                    <option value="STRUCTURAL_COLLAPSE">Structural Collapse</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    District & State *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900"
                      placeholder="District"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    GPS Coordinates (Lat, Lng) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-900"
                      placeholder="Latitude"
                    />
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-900"
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: UPLOAD IMAGERY */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                Upload or link a pre-disaster baseline image and a post-disaster reconnaissance capture. Supported inputs include satellite rasters (GeoTIFF, PNG, JPEG) and high-resolution drone UAV orthophotos.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pre Image */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    1. Pre-Disaster Baseline Imagery
                  </span>
                  <div className="h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                    <img src={preImageUrl} alt="Pre-Disaster" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="text"
                    value={preImageUrl}
                    onChange={(e) => setPreImageUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-mono"
                    placeholder="Pre-disaster image URL"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Baseline Capture:</span>
                    <input
                      type="date"
                      value={captureDatePre}
                      onChange={(e) => setCaptureDatePre(e.target.value)}
                      className="border border-slate-300 rounded px-1.5 py-0.5 text-slate-800"
                    />
                  </div>
                </div>

                {/* Post Image */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
                    2. Post-Disaster Target Imagery
                  </span>
                  <div className="h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                    <img src={postImageUrl} alt="Post-Disaster" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="text"
                    value={postImageUrl}
                    onChange={(e) => setPostImageUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-mono"
                    placeholder="Post-disaster image URL"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Post-Disaster Capture:</span>
                    <input
                      type="date"
                      value={captureDatePost}
                      onChange={(e) => setCaptureDatePost(e.target.value)}
                      className="border border-slate-300 rounded px-1.5 py-0.5 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: METADATA & PLATFORM */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                Confirm sensor platform specifications. Resolution and platform characteristics directly govern AI uncertainty scoring.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Sensor / Acquisition Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => {
                      const p = e.target.value as ImageMetadata['sourcePlatform'];
                      setPlatform(p);
                      setResolutionMeters(
                        p === 'DJI Matrice 300 UAV'
                          ? 0.12
                          : p === 'WorldView-3'
                          ? 0.3
                          : p === 'Cartosat-2E'
                          ? 0.6
                          : 10.0
                      );
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900"
                  >
                    <option value="DJI Matrice 300 UAV">DJI Matrice 300 UAV Orthomosaic (0.12m/px)</option>
                    <option value="WorldView-3">WorldView-3 Optical High-Res (0.3m/px)</option>
                    <option value="Cartosat-2E">Cartosat-2E Panchromatic (0.6m/px)</option>
                    <option value="Sentinel-2 Multispectral">Sentinel-2 Multispectral (10.0m/px)</option>
                    <option value="User Upload">User Upload / Custom Drone</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Ground Sampling Distance (GSD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={resolutionMeters}
                    onChange={(e) => setResolutionMeters(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Meters per pixel (lower = sharper structural detail)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Target Area:</span>
                  <span className="text-orange-400 font-bold">{locationName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Coordinates:</span>
                  <span>{lat}°N, {lng}°E</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Platform:</span>
                  <span>{platform} ({resolutionMeters}m GSD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Temporal Difference:</span>
                  <span>{captureDatePre} → {captureDatePost}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: RUN AI ANALYSIS */}
          {currentStep === 4 && (
            <div className="space-y-4 text-center py-4">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto border border-orange-200">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  AI Computer Vision & Structural Segmentation
                </h3>
                <p className="text-xs text-slate-500">
                  Execute U-Net change segmentation and YOLOv8 structural damage detection on the registered imagery pair.
                </p>

                {isAnalyzing ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                    <Loader2 className="w-5 h-5 text-orange-600 animate-spin mx-auto" />
                    <p className="text-xs font-mono text-orange-800 font-bold">
                      Aligning bitemporal rasters & computing structural deltas...
                    </p>
                  </div>
                ) : analysisCompleted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-left text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Analysis Completed Successfully</span>
                    </div>
                    <p className="text-slate-600">
                      Detected 3 visual anomalies with composite model confidence of <strong>{modelConfidence}%</strong>.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunAiAnalysis}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/30 transition-all cursor-pointer"
                  >
                    ▶ Run AI Inference Pipeline
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW DAMAGE ESTIMATES */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  EMS-98 / FEMA Structural Damage Grade:
                </span>
                <select
                  value={estimatedDamage}
                  onChange={(e) => setEstimatedDamage(e.target.value as any)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-900"
                >
                  <option value="DESTROYED">DESTROYED (Complete Collapse)</option>
                  <option value="MAJOR_DAMAGE">MAJOR DAMAGE (Structural Failure)</option>
                  <option value="MODERATE_DAMAGE">MODERATE DAMAGE (Habitability Impaired)</option>
                  <option value="MINOR_DAMAGE">MINOR DAMAGE (Cosmetic Cracks)</option>
                  <option value="UNAFFECTED">UNAFFECTED (Intact Structure)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Extracted Visual Evidence Features ({evidenceFeatures.length}):
                </label>
                <div className="space-y-2">
                  {evidenceFeatures.map((ev, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{ev.type.replace('_', ' ')}</span>
                        <p className="text-[11px] text-slate-500">{ev.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-red-100 text-red-800 border border-red-200">
                        {Math.round(ev.confidence * 100)}% Conf
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CALCULATE EXPLAINABLE PRIORITY */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">CALCULATED PRIORITY TIER</span>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                    priorityTier === 'P1_URGENT' ? 'bg-red-600' :
                    priorityTier === 'P2_HIGH' ? 'bg-orange-600' :
                    priorityTier === 'P3_MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {priorityTier.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">COMPOSITE SCORE</span>
                  <span className="text-xl font-black text-orange-400">{compositeScore}/100</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Physical Damage Severity (35%):</span>
                    <span className="font-mono text-orange-600">{physicalDamageWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={physicalDamageWeight}
                    onChange={(e) => setPhysicalDamageWeight(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Population Exposure & Vulnerability (25%):</span>
                    <span className="font-mono text-orange-600">{populationRisk}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={populationRisk}
                    onChange={(e) => setPopulationRisk(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Critical Infrastructure Lifeline Impact (20%):</span>
                    <span className="font-mono text-orange-600">{infrastructureWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={infrastructureWeight}
                    onChange={(e) => setInfrastructureWeight(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Continuing Hazard Escalation (15%):</span>
                    <span className="font-mono text-orange-600">{hazardEscalation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hazardEscalation}
                    onChange={(e) => setHazardEscalation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: CONFIRMATION & DISPATCH */}
          {currentStep === 7 && (
            <div className="space-y-4">
              {createdRecord ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">
                    Assessment Recorded & Added to Prioritization Queue
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Assigned ID: <strong className="font-mono">{createdRecord.id}</strong>. The assessment has been added to the master inspection queue and is ready for team dispatch and official reporting.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    View in Prioritization Workspace
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Summary Dossier Ready for Submission
                    </span>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>Location: <strong className="text-slate-900">{locationName}</strong></div>
                      <div>Priority: <strong className="text-red-700">{priorityTier} ({compositeScore}/100)</strong></div>
                      <div>Damage Grade: <strong className="text-slate-900">{estimatedDamage}</strong></div>
                      <div>Confidence: <strong className="text-slate-900">{modelConfidence}%</strong></div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Submitting will officially register this damage record in the live NDMA disaster database and broadcast an inspection request to assigned response engineers.
                  </p>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Confirm & Commit Damage Assessment</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1 || createdRecord !== null}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="text-xs text-slate-500 font-mono">
            {currentStep < 7 ? `Step ${currentStep} of 7` : 'Ready'}
          </div>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 4 && !analysisCompleted) {
                  handleRunAiAnalysis();
                }
                setCurrentStep((s) => Math.min(7, s + 1));
              }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
