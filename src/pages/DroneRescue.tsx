import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { droneRescueService } from '../services/droneRescueService';
import {
  DroneAnalysisResult,
  DroneTelemetry,
  TrackedPersonDetection,
  PresetDroneScenario,
  RescueAlertDispatchPayload,
} from '../types/droneRescue';
import { DroneMissionStats } from '../components/drone/DroneMissionStats';
import { DroneVideoViewer } from '../components/drone/DroneVideoViewer';
import { DroneTimeline } from '../components/drone/DroneTimeline';
import { RescueDetectionsPanel } from '../components/drone/RescueDetectionsPanel';
import { RescueIncidentMap } from '../components/drone/RescueIncidentMap';
import { ActiveIncidentsTable } from '../components/drone/ActiveIncidentsTable';
import { LiveDroneFeedModal } from '../components/drone/LiveDroneFeedModal';
import { RescueDispatchModal } from '../components/drone/RescueDispatchModal';

// Built-in initial demo detections (aligned with /demo/drone-flash-flood-demo.mp4 timeline)
const INITIAL_DEMO_DETECTIONS: TrackedPersonDetection[] = [
  {
    detection_id: 'det_demo_p12',
    person_id: 'PERSON #12',
    tracking_id: 12,
    confidence: 0.94,
    timestamp_sec: 14.0,
    timestamp_str: '00:14',
    frame_number: 336,
    bbox: {
      x: 0.42,
      y: 0.48,
      width: 0.09,
      height: 0.06,
      x_px: 403,
      y_px: 259,
      width_px: 86,
      height_px: 32,
    },
    distress_score: 0.91,
    priority: 'CRITICAL',
    status: 'PENDING_VERIFICATION',
    indicators: [
      'Flood water / inundation zone exposure',
      'Lying posture on ground/surface',
      'Stationary for unusual duration',
      'Isolated from rescue corridors / groups',
    ],
    hazard_context: 'FLASH FLOOD',
    latitude: 16.5466,
    longitude: 81.5198,
    gps_available: true,
    location_label: 'Bhimavaram Canal East Embankment (16.5466° N, 81.5198° E)',
    posture: 'Lying / Horizontal Posture',
  },
  {
    detection_id: 'det_demo_p07',
    person_id: 'PERSON #07',
    tracking_id: 7,
    confidence: 0.89,
    timestamp_sec: 28.0,
    timestamp_str: '00:28',
    frame_number: 672,
    bbox: {
      x: 0.68,
      y: 0.36,
      width: 0.05,
      height: 0.11,
      x_px: 652,
      y_px: 194,
      width_px: 48,
      height_px: 59,
    },
    distress_score: 0.61,
    priority: 'MEDIUM',
    status: 'AI_DETECTED',
    indicators: [
      'Repeated signaling / arm movement pattern',
      'Active FLASH FLOOD disaster area',
      'Isolated individual in scan sector',
    ],
    hazard_context: 'FLASH FLOOD',
    latitude: 16.5426,
    longitude: 81.5231,
    gps_available: true,
    location_label: 'Bhimavaram Sector 4 Inundated Perimeter (16.5426° N, 81.5231° E)',
    posture: 'Normal Standing/Sitting',
  },
  {
    detection_id: 'det_demo_p04',
    person_id: 'PERSON #04',
    tracking_id: 4,
    confidence: 0.96,
    timestamp_sec: 42.0,
    timestamp_str: '00:42',
    frame_number: 1008,
    bbox: {
      x: 0.22,
      y: 0.62,
      width: 0.04,
      height: 0.10,
      x_px: 211,
      y_px: 334,
      width_px: 38,
      height_px: 54,
    },
    distress_score: 0.28,
    priority: 'LOW',
    status: 'AI_DETECTED',
    indicators: ['Normal movement pattern along road edge'],
    hazard_context: 'FLASH FLOOD',
    latitude: 16.5483,
    longitude: 81.5240,
    gps_available: true,
    location_label: 'Bhimavaram High Ground Road Sector (16.5483° N, 81.5240° E)',
    posture: 'Normal Walking',
  },
];

export const DroneRescuePage: React.FC = () => {
  const { activeLocation, selectedHazardType } = useApp();

  // Mode & Video State
  const [mode, setMode] = useState<'DEMO' | 'LIVE' | 'USER FOOTAGE'>('DEMO');
  const [mediaUrl, setMediaUrl] = useState<string | null>('/demo/drone-rescue-real-footage.mp4');
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'live_stream'>('video');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(48);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analysis & Incidents State
  const [presets, setPresets] = useState<PresetDroneScenario[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<DroneAnalysisResult | null>(null);
  const [detections, setDetections] = useState<TrackedPersonDetection[]>(INITIAL_DEMO_DETECTIONS);
  const [selectedDetection, setSelectedDetection] = useState<TrackedPersonDetection | null>(INITIAL_DEMO_DETECTIONS[0]);
  const [telemetry, setTelemetry] = useState<DroneTelemetry | null>({
    drone_id: 'DRONE-01',
    connected: true,
    altitude_m: 48.0,
    latitude: 16.5448,
    longitude: 81.5212,
    heading_deg: 142.5,
    speed_kmh: 18.4,
    battery_pct: 87,
    signal_pct: 94,
    mission_name: 'FLASH FLOOD RECONNAISSANCE SCAN',
    active_hazard: 'FLASH FLOOD',
  });

  // Modals
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchTargetDetection, setDispatchTargetDetection] = useState<TrackedPersonDetection | null>(null);

  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Load presets & sync backend on mount
  useEffect(() => {
    droneRescueService
      .getPresets()
      .then((res) => {
        setPresets(res);
      })
      .catch(() => {});

    droneRescueService
      .getTelemetry()
      .then((tel) => {
        if (tel && tel.connected) setTelemetry(tel);
      })
      .catch(() => {});
  }, []);

  // Time ticker for synchronized demo playback
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            return 0; // Loop seamlessly
          }
          return Math.round((prev + 0.5) * 10) / 10;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Handle Preset Selection
  const handleSelectPreset = async (preset: PresetDroneScenario) => {
    setIsAnalyzing(true);
    setMode('DEMO');
    setMediaUrl(preset.video_url || '/demo/drone-flash-flood-demo.mp4');
    setMediaType('video');
    setCurrentTime(0);
    setIsPlaying(true);

    try {
      const analysis = await droneRescueService.analyzePreset(preset.id);
      setActiveAnalysis(analysis);
      setDetections(analysis.detections || INITIAL_DEMO_DETECTIONS);
      setDuration(analysis.duration_sec || 48);
      if (analysis.telemetry) {
        setTelemetry(analysis.telemetry);
      }
      if (analysis.detections && analysis.detections.length > 0) {
        setSelectedDetection(analysis.detections[0]);
      }
    } catch (err) {
      console.error('Preset analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle User File Upload (Replaces Demo with User Footage)
  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setMode('USER FOOTAGE');
    const localUrl = URL.createObjectURL(file);
    setMediaUrl(localUrl);
    const isImg = file.type.startsWith('image/');
    setMediaType(isImg ? 'image' : 'video');
    setCurrentTime(0);
    setIsPlaying(true);
    // Clear demo detections while analyzing real footage
    setDetections([]);
    setSelectedDetection(null);

    try {
      const res = await droneRescueService.uploadFootage(
        file,
        selectedHazardType !== 'ALL' ? selectedHazardType : 'FLASH FLOOD',
        activeLocation?.name || 'Bhimavaram',
        'DRONE-01',
        activeLocation?.lat,
        activeLocation?.lng
      );
      setActiveAnalysis(res.analysis);
      setDetections(res.analysis.detections || []);
      setDuration(res.analysis.duration_sec || (isImg ? 0 : 30));
      if (res.analysis.telemetry) {
        setTelemetry(res.analysis.telemetry);
      }
      if (res.analysis.detections && res.analysis.detections.length > 0) {
        setSelectedDetection(res.analysis.detections[0]);
      }
    } catch (err: any) {
      alert(err?.message || 'File upload analysis failed');
      // Revert to demo if upload fails
      setMode('DEMO');
      setMediaUrl('/demo/drone-flash-flood-demo.mp4');
      setMediaType('video');
      setDetections(INITIAL_DEMO_DETECTIONS);
      setSelectedDetection(INITIAL_DEMO_DETECTIONS[0]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Live Stream Connection
  const handleConnectLiveFeed = async (params: any) => {
    const updatedTel = await droneRescueService.connectFeed(params);
    setTelemetry(updatedTel);
    setMode('LIVE');
    setMediaType('live_stream');
    setMediaUrl(params.streamUrl);
  };

  const handleDisconnectLiveFeed = async () => {
    const updatedTel = await droneRescueService.disconnectFeed();
    setTelemetry(updatedTel);
    setMode('DEMO');
    setMediaType('video');
    setMediaUrl('/demo/drone-flash-flood-demo.mp4');
    setDetections(INITIAL_DEMO_DETECTIONS);
  };

  // Verification & Dispatch Actions
  const handleVerifyDetection = async (detectionId: string) => {
    try {
      await droneRescueService.verifyIncident(detectionId);
    } catch {
      // Optimistic fallback for demo mode
    }
    setDetections((prev) =>
      prev.map((d) => (d.detection_id === detectionId ? { ...d, status: 'VERIFIED' } : d))
    );
  };

  const handleMarkFalsePositive = async (detectionId: string) => {
    try {
      await droneRescueService.markFalsePositive(detectionId);
    } catch {
      // Optimistic fallback for demo mode
    }
    setDetections((prev) =>
      prev.map((d) => (d.detection_id === detectionId ? { ...d, status: 'FALSE_POSITIVE' } : d))
    );
  };

  const handleOpenDispatchModal = (detection: TrackedPersonDetection) => {
    setDispatchTargetDetection(detection);
    setIsDispatchModalOpen(true);
  };

  const handleCloseDispatchModal = () => {
    setIsDispatchModalOpen(false);
    setDispatchTargetDetection(null);
  };

  const handleDispatchRescue = async (payload: RescueAlertDispatchPayload) => {
    await droneRescueService.dispatchRescue(payload);
    // Update local detection status to DISPATCHED
    setDetections((prev) =>
      prev.map((d) => (d.detection_id === payload.incident_id ? { ...d, status: 'DISPATCHED' } : d))
    );
  };

  const handleFocusMap = (detection: TrackedPersonDetection) => {
    setSelectedDetection(detection);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const summaryStats = activeAnalysis?.summary || {
    total_people_detected: detections.length,
    possible_distress_count: detections.filter((d) => d.distress_score >= 0.5).length,
    high_priority_count: detections.filter((d) => d.priority === 'CRITICAL' || d.priority === 'HIGH').length,
    rescue_alerts_count: detections.filter((d) => d.priority === 'CRITICAL' || d.priority === 'HIGH').length,
    verified_count: detections.filter((d) => d.status === 'VERIFIED').length,
    dispatched_count: detections.filter((d) => d.status === 'DISPATCHED').length,
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl md:text-2xl">🚁</span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Drone Rescue Scanner
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Analyze drone footage to identify people requiring emergency assistance during disasters and help rescue teams prioritize response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 shadow-xs ${
              isAnalyzing
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAnalyzing ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span>{isAnalyzing ? '● ANALYZING DRONE FOOTAGE' : '● AI SCANNER READY'}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Mission Statistics Row */}
      <DroneMissionStats summary={summaryStats} isAnalyzing={isAnalyzing} />

      {/* 3. Main Split View: Left 65% Video Viewer + Right 35% Detections Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 65% (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <DroneVideoViewer
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            mode={mode}
            detections={detections}
            selectedDetectionId={selectedDetection?.detection_id || null}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            telemetry={telemetry}
            presets={presets}
            activeHazard={selectedHazardType !== 'ALL' ? selectedHazardType : 'FLASH FLOOD'}
            locationName={activeLocation?.name || 'Bhimavaram'}
            isAnalyzing={isAnalyzing}
            onSelectDetection={(det) => setSelectedDetection(det)}
            onFileUpload={handleFileUpload}
            onSelectPreset={handleSelectPreset}
            onOpenLiveModal={() => setIsLiveModalOpen(true)}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onTimeUpdate={(t) => setCurrentTime(t)}
            onDurationChange={(d) => setDuration(d)}
            onPlayStateChange={(p) => setIsPlaying(p)}
          />

          {mediaType === 'video' && mediaUrl && (
            <DroneTimeline
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              detections={detections}
              onSeek={handleSeek}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
            />
          )}
        </div>

        {/* Right 35% (4 cols) */}
        <div className="lg:col-span-4 h-full">
          <RescueDetectionsPanel
            detections={detections}
            selectedDetectionId={selectedDetection?.detection_id || null}
            currentTime={currentTime}
            onSelectDetection={(det) => setSelectedDetection(det)}
            onVerify={handleVerifyDetection}
            onMarkFalsePositive={handleMarkFalsePositive}
            onOpenDispatchModal={handleOpenDispatchModal}
            onFocusMap={handleFocusMap}
            onSeekTimestamp={handleSeek}
          />
        </div>
      </div>

      {/* 4. Full-Width Rescue Incident Map */}
      <div ref={mapSectionRef}>
        <RescueIncidentMap
          detections={detections}
          telemetry={telemetry}
          selectedDetection={selectedDetection}
          onSelectDetection={(det) => setSelectedDetection(det)}
          onOpenDispatchModal={handleOpenDispatchModal}
          onVerify={handleVerifyDetection}
        />
      </div>

      {/* 5. Full-Width Active Incidents Ledger */}
      <div>
        <ActiveIncidentsTable
          detections={detections}
          onVerify={handleVerifyDetection}
          onMarkFalsePositive={handleMarkFalsePositive}
          onOpenDispatchModal={handleOpenDispatchModal}
          onSelectDetection={(det) => setSelectedDetection(det)}
        />
      </div>

      {/* 6. Subtle Safety Disclaimer Footer */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-500 font-medium">
        <span className="font-bold text-slate-700">Safety Protocol Notice:</span> AI detections are decision-support signals and require human verification before emergency dispatch.
      </div>

      {/* Modals */}
      <LiveDroneFeedModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        telemetry={telemetry}
        onConnect={handleConnectLiveFeed}
        onDisconnect={handleDisconnectLiveFeed}
      />

      <RescueDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={handleCloseDispatchModal}
        detection={dispatchTargetDetection}
        onDispatch={handleDispatchRescue}
      />
    </div>
  );
};

export default DroneRescuePage;
