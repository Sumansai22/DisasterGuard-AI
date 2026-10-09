import { DemoFeatureDetail } from '../types/demoTour';

export const DEMO_FEATURES: DemoFeatureDetail[] = [
  {
    id: 'dashboard',
    stepNumber: 1,
    name: 'Main Command Dashboard',
    shortTitle: 'Command Dashboard',
    route: '/',
    badge: 'OPERATIONAL COMMAND',
    iconName: 'LayoutDashboard',
    purpose:
      'Unifies multi-hazard telemetry, environmental risk indicators, active warnings, and critical impact stats into a single high-availability interface for emergency coordinators.',
    howItWorks:
      'Aggregates real-time sensor streams and regional Open-Meteo/IMD fallback feeds, evaluates geotechnical parameters against trained baseline risk thresholds, and visualizes live situational status across high-risk sectors.',
    technologyUsed: [
      'React 18 & TypeScript',
      'Tailwind CSS & Lucide Icons',
      'FastAPI Backend REST Service',
      'Open-Meteo & IMD Telemetry Feeds',
      'Real-time State Context Engine',
    ],
    inputData: [
      'Active geographical location & coordinates',
      '24-hr cumulative rainfall from automated gauges',
      'Soil saturation & slope telemetry',
      'Active incident alerts & bulletin feeds',
    ],
    outputData: [
      'Composite Hazard Score (0–100 scale)',
      'Real-time KPI metrics & active warning tallies',
      'High-risk sector count & operational readiness state',
      'Instant impact-exposure demographic summary',
    ],
    practicalUseCase:
      'During sudden torrential rainfall over Wayanad or Bhimavaram, an emergency manager instantly detects elevated hazard saturation without juggling disparate sensor spreadsheets.',
    projectContribution:
      'Acts as the primary entry point for damage prioritization, identifying which geographic administrative zones demand immediate operator focus.',
    limitations: [
      'Requires active network connection or local IoT gateway for real-time telemetry.',
      'Non-monitored locations rely on regional meteorological models rather than local ground sensors.',
    ],
    keyHighlights: [
      'Single-pane situational awareness',
      'Transparent data provenance indicators (LIVE vs SENSOR vs ESTIMATED)',
      'Direct link to Damage Prioritization (PS-53) workspace',
    ],
  },
  {
    id: 'risk-map',
    stepNumber: 2,
    name: 'Spatial Multi-Hazard GIS Risk Map',
    shortTitle: 'GIS Risk Map',
    route: '/risk-map',
    badge: 'GEOSPATIAL INTELLIGENCE',
    iconName: 'MapPin',
    purpose:
      'Translates numerical danger metrics into geospatial visual layers, highlighting high-risk perimeters, active incidents, and safe zones across India.',
    howItWorks:
      'Renders Leaflet interactive tile layers with GeoJSON hazard polygons, dynamic color-coded severity rings, telemetry station markers, infrastructure nodes, and PS-53 damage assessment pins.',
    technologyUsed: [
      'Leaflet & React-Leaflet GIS Engine',
      'OpenStreetMap Tile Servers',
      'Custom SVG Layer Pin Shaders',
      'Haversine Great-Circle Distance Computations',
    ],
    inputData: [
      'Geographical coordinates (latitude / longitude)',
      'Telemetry station positions & live risk scores',
      'Georeferenced critical infrastructure database',
      'Active incident coordinates & affected radius (meters)',
    ],
    outputData: [
      'Interactive zoomable hazard heat zones',
      'Clickable damage assessment & station popups',
      'Visual buffer zones around active incidents',
      'Filterable GIS layers (Rainfall, Sensors, Shelters, Corridors)',
    ],
    practicalUseCase:
      'First responders visually locate exactly where a slope collapse has intersected the state highway, allowing rerouting before rescue units enter vulnerable valleys.',
    projectContribution:
      'Provides spatial validation for damage prioritization, confirming whether high-risk zones overlap with vulnerable human settlements.',
    limitations: [
      'Offline operation requires pre-cached map tile packs.',
      'Resolution is subject to OpenStreetMap public cartographic granularity.',
    ],
    keyHighlights: [
      'Interactive pins for verified PS-53 damage assessments',
      'Layer toggle controls for granular intelligence',
      'Interactive inspector cards for bridges, dams, and shelters',
    ],
  },
  {
    id: 'damage-assessment-bitemporal',
    stepNumber: 3,
    name: 'Bitemporal Pre & Post-Disaster Imagery Assessment',
    shortTitle: 'Bitemporal Imagery',
    route: '/damage-assessment',
    badge: 'PS-53 CORE ENGINE',
    iconName: 'Layers',
    isHighlightFeature: true,
    purpose:
      'THE CENTRAL FOUNDATION OF PS-53: Compares pre-disaster baseline satellite imagery against post-disaster UAV/satellite captures to detect physical morphological alterations and infrastructure collapse.',
    howItWorks:
      'Ingests multi-source bitemporal imagery (Sentinel-2, Cartosat-2E, DJI Matrice 300 UAV), validates metadata/resolution, and provides an interactive curtain split-slider for comparative visual triage.',
    technologyUsed: [
      'Bitemporal Image Registration Engine',
      'Interactive Split-Curtain Canvas Slider',
      'Metadata Verification & Exif Parser',
      'Multi-Resolution Optical Normalization',
    ],
    inputData: [
      'Pre-disaster optical baseline image (Sentinel-2 / WorldView-3)',
      'Post-disaster target drone / aerial image (DJI Matrice 300)',
      'GPS coordinates & capture timestamps',
      'Ground pixel resolution (0.15m – 10.0m)',
    ],
    outputData: [
      'Interactive side-by-side bitemporal split view',
      'Side-by-side visual difference verification',
      'Resolution & sensor provenance metadata card',
      'Zoomable inspection viewport (1x to 2.5x)',
    ],
    practicalUseCase:
      'Authorities upload drone imagery taken 3 hours after the Chooralmala mudflow and slide the curtain to reveal 140 swept structures and a vanished steel bridge.',
    projectContribution:
      'Provides immediate empirical optical proof of damage without sending inspectors into treacherous active slide zones.',
    limitations: [
      'High-altitude cloud cover can obscure optical satellite passes (overcome by low-altitude drone surveys).',
      'Oblique UAV camera angles require careful perspective calibration.',
    ],
    keyHighlights: [
      'Split-slider with smooth real-time drag interaction',
      'Pre-loaded authentic Indian disaster test scenarios',
      'Drag-and-drop custom image pair uploader with size/type validation',
    ],
  },
  {
    id: 'damage-assessment-ai',
    stepNumber: 4,
    name: 'AI Damage Inference & Evidence Visualization',
    shortTitle: 'AI Damage Inference',
    route: '/damage-assessment',
    badge: 'EMS-98 & FEMA CLASSIFICATION',
    iconName: 'Building2',
    isHighlightFeature: true,
    purpose:
      'Executes automated damage categorization according to European Macroseismic Scale (EMS-98) Grade 1–5 standards, detecting collapsed roofs, sheared masonry, and severed transport corridors.',
    howItWorks:
      'Runs optical edge/texture difference pipelines and U-Net structural boundary analysis, calculates physical damage scores (0–100), tags specific visual evidence points, and flags uncertainty penalties.',
    technologyUsed: [
      'EMS-98 / FEMA Structural Damage Classifier',
      'U-Net Boundary Segmentation (SIH26001)',
      'Multi-Feature Computer Vision Change Detection',
      'Uncertainty & Limitation Scoring Engine',
    ],
    inputData: [
      'Bitemporal imagery difference metrics',
      'Hazard classification (Landslide, Flash Flood, Subsidence)',
      'Digital surface model elevation variation',
    ],
    outputData: [
      'Physical Damage Category: DESTROYED, MAJOR, MODERATE, MINOR, UNAFFECTED',
      'Numerical Physical Damage Score (0–100%)',
      'Visual Damage Evidence List with bounding coordinates and confidence',
      'Uncertainty penalty based on cloud shadow and resolution',
    ],
    practicalUseCase:
      'Automatically classifies the Tapovan Dam breach as DESTROYED (Score 98%) while identifying submerged tunnel intake portals with 94% confidence.',
    projectContribution:
      'Replaces subjective guesswork with standardized engineering damage grades, ensuring consistent evaluation across all affected wards.',
    limitations: [
      'Optical detection cannot assess internal foundation micro-fractures without ground sensors.',
      'Turbid floodwaters conceal subsurface scour depth.',
    ],
    keyHighlights: [
      'Pulsing AI damage bounding overlays directly on post-disaster imagery',
      'Explicit uncertainty factors listed for operator awareness',
      'Standardized international structural grading',
    ],
  },
  {
    id: 'damage-priority-queue',
    stepNumber: 5,
    name: 'Explainable Damage-Priority Queue & Ranking Engine',
    shortTitle: 'Priority Queue (PS-53)',
    route: '/damage-assessment',
    badge: 'CORE PRIORITIZATION ENGINE',
    iconName: 'ListFilter',
    isHighlightFeature: true,
    purpose:
      'SOLVES PS-53 DIRECTLY: Automatically ranks every damaged site into a transparent, sortable inspection queue (P1 URGENT to P4 LOW) so limited physical inspection teams are dispatched where need is greatest.',
    howItWorks:
      'Applies a transparent weighted formula: Priority = 0.35 * Damage + 0.25 * Population + 0.20 * Infrastructure + 0.15 * Hazard - 0.05 * Uncertainty. Synthesizes a plain-language explanation for every rank.',
    technologyUsed: [
      'Multi-Criteria Decision Analysis (MCDA)',
      'Explainable AI Prioritization Logic',
      'Dynamic Filter & Multi-Column Sort Engine',
      'Real-Time Triage Scheduling',
    ],
    inputData: [
      'Physical damage severity index',
      'Estimated civilian population density in quadrant',
      'Critical infrastructure exposure (hospitals, bridges, water supply)',
      'Active meteorological hazard escalation (rainfall rate)',
      'Data uncertainty penalty',
    ],
    outputData: [
      'Ranked Inspection Queue sorted by Priority Tier (P1 < 2h, P2 < 6h, P3 < 24h, P4 Routine)',
      'Weighted Composite Priority Score (0–100)',
      'Plain-language rationale explaining WHY the location was ranked P1 vs P2',
      'Filterable list by disaster vector, damage grade, and verification state',
    ],
    practicalUseCase:
      'When 5 locations report damage, the engine ranks Chooralmala as #1 because an arterial bridge is cut and rainfall is escalating, while an agricultural slide in Munnar is ranked P4.',
    projectContribution:
      'This is the exact solution to PS-53 — preventing physical inspection bottlenecks by directing responders to critical sites first.',
    limitations: [
      'Relies on demographic census estimates until field counts are updated.',
      'Rankings should be re-calculated if secondary cloudbursts occur.',
    ],
    keyHighlights: [
      'Transparent mathematical weighting formula documented in UI',
      'Sortable and filterable queue with real-time updates',
      'Search by assessment ID, district, or disaster event',
    ],
  },
  {
    id: 'human-verification-workflow',
    stepNumber: 6,
    name: 'Human-in-the-Loop Verification & Team Dispatch',
    shortTitle: 'Human Verification',
    route: '/damage-assessment',
    badge: 'GOVERNANCE & SAFEGUARDS',
    iconName: 'UserCheck',
    isHighlightFeature: true,
    purpose:
      'Ensures AI estimates are never treated as final physical inspections. Enables authorized officers to confirm assessments, adjust priority tiers with recorded reasons, and dispatch teams.',
    howItWorks:
      'Provides a secure verification modal recording officer name, badge ID, verification decision, and justification. Generates immutable audit log entries and allows 1-click dispatch of NDRF/SDRF/PWD units.',
    technologyUsed: [
      'Human-in-the-Loop Governance Protocol',
      'Immutable Audit Logging Engine',
      'Emergency Dispatch Allocation Logic',
      'Radio & ETA Coordination System',
    ],
    inputData: [
      'Inspector name, role, and badge code',
      'Verification decision: Confirm, Re-Scan, or Reject',
      'Priority tier manual override (if applicable)',
      'Recorded justification rationale',
    ],
    outputData: [
      'Updated verification badge (VERIFIED_CONFIRMED)',
      'Time-stamped audit entry with officer signature',
      'Dispatched team assignment with ETA and radio channel',
      'Locked priority state ready for field reporting',
    ],
    practicalUseCase:
      'NDRF Incident Commander reviews drone evidence, confirms Chooralmala as P1 URGENT, enters authorization notes, and dispatches NDRF Battalion 4 with 20-min ETA.',
    projectContribution:
      'Prevents dangerous AI hallucinations from triggering unverified field deployments and creates legal accountability for emergency management.',
    limitations: [
      'Requires authorized user signoff before dispatching heavy search machinery.',
    ],
    keyHighlights: [
      'Mandatory justification required for any priority tier override',
      'Preset specialized rescue teams (NDRF, SDRF, PWD Engineers, Civil Defense)',
      'Complete traceability in the immutable audit trail',
    ],
  },
  {
    id: 'rainfall',
    stepNumber: 7,
    name: 'Rainfall Monitoring & Hydro-Meteorology',
    shortTitle: 'Rainfall Monitoring',
    route: '/rainfall',
    badge: 'HYDROLOGICAL TELEMETRY',
    iconName: 'CloudRain',
    purpose:
      'Tracks cumulative precipitation intervals, intensity spikes, and soil saturation thresholds that serve as primary triggers for slope failure and flooding.',
    howItWorks:
      'Visualizes 24h, 48h, and 72h historical and live rainfall trends using responsive chart analytics, comparing real-time gauges against safety threshold limits.',
    technologyUsed: [
      'Recharts SVG Data Visualization',
      'Automated Weather Station (AWS) Ingestion',
      'IMD Warning Level Threshold Classifications',
      'Hydrological Trend Analytics',
    ],
    inputData: [
      'Telemetry station rainfall gauges (mm/hour & mm/24h)',
      'Historical monthly seasonal averages',
      'Soil moisture saturation telemetry (%)',
    ],
    outputData: [
      'Precipitation intensity trend curves',
      'Threshold exceedance warnings (Normal, Watch, Warning, Critical)',
      'Rainfall vs. Landslide Risk correlation matrix',
      '24h cumulative rainfall status cards',
    ],
    practicalUseCase:
      'Rainfall in Munnar surpasses 148mm in 24 hours, breaching the 120mm red-line threshold; automatic alert triggers for downstream settlements.',
    projectContribution:
      'Identifies the primary hydrologic catalyst driving damages across all monitored sectors.',
    limitations: [
      'Remote mountainous areas rely on satellite precipitation estimates where physical rain gauges are sparse.',
    ],
    keyHighlights: [
      'Interactive time-series charts with threshold guidelines',
      'Clear live vs simulated data source indicators',
      'Correlation matrix showing rainfall impact on slope instability',
    ],
  },
  {
    id: 'drone-rescue',
    stepNumber: 8,
    name: 'AI Drone Rescue Scanner & Computer Vision',
    shortTitle: 'Drone Rescue Scanner',
    route: '/drone-rescue',
    badge: 'AERIAL COMPUTER VISION',
    iconName: 'Crosshair',
    purpose:
      'Scans aerial optical and thermal UAV drone video streams to detect stranded individuals, assess posture distress, and prioritize rescue dispatch.',
    howItWorks:
      'Processes streaming video frames through an optimized YOLOv8 nano object detection model, applies kinematic distress scoring (lying posture, immobility, inundation), and logs actionable rescue incidents.',
    technologyUsed: [
      'YOLOv8 Nano Computer Vision (yolov8n.pt)',
      'OpenCV Frame Extraction Pipeline',
      'HTML5 Video Canvas Annotation Layer',
      'Automated Distress Scoring Heuristics',
    ],
    inputData: [
      'Simulated or real high-definition UAV drone footage',
      'Frame coordinates & optical bounding boxes',
      'Geographic mission telemetry (altitude, battery, GPS)',
    ],
    outputData: [
      'Detected persons with confidence percentages',
      'Distress Severity Index (0.00 – 1.00)',
      'Immediate Priority Classification (CRITICAL / HIGH / MONITORING)',
      'One-click NDRF/SDRF Dispatch action modals',
    ],
    practicalUseCase:
      'A drone sweeping floodwaters spots a survivor clinging to a tree limb in muddy waters; the system flags Distress 94% and auto-generates a rescue dispatch card.',
    projectContribution:
      'Directly feeds real-time victim locations into the damage prioritization queue, ensuring life-saving interventions precede structural inspections.',
    limitations: [
      'Simulated demo footage is clearly labeled as synthetic in trial modes.',
      'Dense forest canopies or heavy rain may degrade optical visibility without thermal sensors.',
    ],
    keyHighlights: [
      'Live bounding-box overlay with person tracking',
      'Distress factor breakdown (immobility, isolation, posture)',
      'Transparent disclaimer: Dispatches require human confirmation',
    ],
  },
  {
    id: 'land-scan',
    stepNumber: 9,
    name: 'AI Land Scan & U-Net 2D Terrain Segmentation',
    shortTitle: 'AI Land Scan (U-Net)',
    route: '/ai-land-scan',
    badge: 'DEEP LEARNING SEGMENTATION',
    iconName: 'ScanLine',
    purpose:
      'Performs pixel-level semantic segmentation on satellite and aerial imagery to isolate landslide scar boundaries, soil shear zones, and debris fields.',
    howItWorks:
      'Passes uploaded aerial imagery through a trained U-Net Convolutional Neural Network (SIH26001_Landslide_UNet.keras) to generate binary segmentation masks, calculating affected square meterage and severity.',
    technologyUsed: [
      'TensorFlow / Keras U-Net 2D Architecture',
      'NumPy & OpenCV Image Processing',
      'Google Gemini Vision 1.5 Multimodal Analysis',
      'Interactive Canvas Mask Blending',
    ],
    inputData: [
      'Satellite RGB or multispectral geotiff/png images',
      'Resolution scaling & pixel spatial resolution factor',
      'Optional Gemini API key for geological commentary',
    ],
    outputData: [
      'Binary & colored segmentation overlay mask',
      'Quantified landslide scar footprint (sq. meters)',
      'Hazard classification (None, Moderate, Critical)',
      'Multimodal geological reasoning on soil slope vulnerability',
    ],
    practicalUseCase:
      'After an earthquake, satellite passes are scanned through U-Net to detect hidden hillside slips blocking upper reservoir catchments before ground teams can hike in.',
    projectContribution:
      'Quantifies exact physical terrain damage, providing the empirical foundation for structural damage rankings.',
    limitations: [
      'Model was trained on high-contrast slope failure datasets.',
      'Cloud cover in raw optical satellite passes requires radar/SAR pre-filtering.',
    ],
    keyHighlights: [
      'Side-by-side comparison of original image vs U-Net predicted mask',
      'Gemini multimodal reasoning integration',
      'Instant calculation of estimated scar area',
    ],
  },
  {
    id: 'prediction',
    stepNumber: 10,
    name: 'AI Risk Prediction (Random Forest 9-Param)',
    shortTitle: 'AI Risk Prediction',
    route: '/prediction',
    badge: 'MACHINE LEARNING MODEL',
    iconName: 'BrainCircuit',
    purpose:
      'Predicts localized landslide slope failure probability using a trained 9-parameter Random Forest Classifier and explains feature contributions.',
    howItWorks:
      'Accepts geotechnical parameters (Rainfall, Slope, Soil Saturation, Vegetation, Seismic, Water Distance, Soil Types), queries landslide_model.pkl, and generates risk probability with explainable feature weights.',
    technologyUsed: [
      'Scikit-learn Random Forest (landslide_model.pkl)',
      'Python 3.11 Backend Inference Service',
      'Explainable AI (XAI) Weight Distribution',
      'Preset Meteorological Scenarios',
    ],
    inputData: [
      'Rainfall (mm) [0–300 mm]',
      'Slope Angle (degrees) [0–60°]',
      'Soil Saturation (%) [0–100%]',
      'Vegetation Cover (%) [0–100%]',
      'Earthquake Activity (g) [0.0–1.0 g]',
      'Proximity to Water Body (meters) [0–2000m]',
      'One-hot encoded Soil Type: Gravel, Sand, or Silt',
    ],
    outputData: [
      'Binary Prediction: Risk Detected vs Safe',
      'Risk Score (0–100) & Model Confidence (%)',
      'Risk Level category (LOW, MODERATE, ELEVATED, HIGH, CRITICAL)',
      'Primary Risk Factor attribution & directional impact',
    ],
    practicalUseCase:
      'Engineers enter anticipated monsoon rainfall of 180mm with 35° slope on silt soil; model predicts 91% Risk, prompting pre-emptive warning sirens.',
    projectContribution:
      'Enables predictive damage prioritization before the landslide even occurs, shifting response from reactive to proactive.',
    limitations: [
      'Prediction reflects point geotechnical parameters; does not model complex sub-surface water tables.',
      'Trained model weights reflect historical regional landslides.',
    ],
    keyHighlights: [
      'Exact 9-parameter alignment with trained backend model',
      'Instant scenario presets for rapid demonstration',
      'Full explainable AI breakdown with factor weight bars',
    ],
  },
  {
    id: 'evacuation',
    stepNumber: 11,
    name: 'Evacuation Route Planning & Safehouse GIS',
    shortTitle: 'Evacuation Routes',
    route: '/evacuation',
    badge: 'TACTICAL ROUTING',
    iconName: 'Navigation',
    purpose:
      'Computes safe, hazard-aware evacuation corridors directing stranded populations away from debris paths toward verified high-ground relief shelters.',
    howItWorks:
      'Calculates multi-modal routes (Walking, Vehicle, 4x4 Emergency) while dynamically avoiding road segments tagged as blocked, inundated, or at immediate landslide risk.',
    technologyUsed: [
      'Leaflet Polyline Routing Visualization',
      'Hazard Obstacle Avoidance Routing Logic',
      'Verified Emergency Safehouse GIS Registry',
      'Multi-Tier Shelter Proximity Engine (25km, 50km, 100km)',
    ],
    inputData: [
      'Origin point (stranded individual or community center)',
      'Target verified shelter node',
      'Active blocked road nodes & inundation vectors',
      'Transport mode: Foot vs Vehicle vs 4x4 Rescue',
    ],
    outputData: [
      'Safest Navigable Route Polyline (Green)',
      'Estimated Transit Duration & Walking Distance (km)',
      'Shelter capacity & current occupancy headcount',
      'Hazard clearance margin (meters from nearest slide path)',
    ],
    practicalUseCase:
      'Village elders receive an evacuation map directing 240 villagers along the western ridgeline rather than the main road, which is blocked by mudflows.',
    projectContribution:
      'Translates damage priority rankings into life-safety corridors, evacuating citizens before structural collapses worsen.',
    limitations: [
      'Requires updated field reporting on newly blocked secondary roads.',
    ],
    keyHighlights: [
      'Visual differentiation between Safe, Alternative, and Blocked paths',
      'Interactive shelter cards with capacity metrics',
      'One-click routing origin/destination setting',
    ],
  },
  {
    id: 'alerts-and-reports',
    stepNumber: 12,
    name: 'Alerts, Safe Emergency SOS & Official Reports',
    shortTitle: 'Alerts & Reports',
    route: '/alerts',
    badge: 'DISPATCH & DOCUMENTATION',
    iconName: 'BellRing',
    purpose:
      'Dispatches multi-channel public warning broadcasts, provides a safe citizen SOS distress beacon, and generates downloadable official NDMA damage prioritization PDF reports.',
    howItWorks:
      'Multi-lingual alert templates (Telugu, Hindi, Tamil, Malayalam, Kannada, English) push early warnings. Distress beacons feature an isolated sandbox mode that prevents unauthorized false dispatches.',
    technologyUsed: [
      'Multi-hazard Bulletin Ingestion',
      'Sandboxed Emergency Beacon Simulator',
      'Print-ready NDMA / SDMA Report Generator',
      'Multilingual Translation Engine',
    ],
    inputData: [
      'Active warning bulletins & severe weather feeds',
      'Citizen SOS coordinates & party headcount',
      'Verified damage assessment records',
    ],
    outputData: [
      'Multi-lingual warning advisories across 6 languages',
      'Immediate incident beacon with tracked response ETA',
      'Official printable NDMA Damage Prioritization Report',
      'Safety sandbox protection ensuring zero false dispatches',
    ],
    practicalUseCase:
      'An incident commander generates an official PDF report for the District Collector and triggers localized loudspeaker alerts in Malayalam and English.',
    projectContribution:
      'Closes the triage loop by ensuring verified priorities are formally documented, shared with senior leadership, and communicated to affected civilians.',
    limitations: [
      'Cellular broadcast depends on surviving local telecom infrastructure.',
      'Emergency SOS runs in sandboxed demonstration mode during trials.',
    ],
    keyHighlights: [
      'One-click official NDMA inspection report generation and printing',
      '100% safe sandbox protection for SOS simulations',
      'Complete multi-lingual alert broadcasting support',
    ],
  },
];
