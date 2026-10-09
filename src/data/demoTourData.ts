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
      'Unifies distributed multi-hazard telemetry, environmental risk indicators, active warnings, and critical impact stats into a single high-availability interface for emergency coordinators.',
    howItWorks:
      'Aggregates real-time sensor streams (or Open-Meteo fallback feeds), evaluates geotechnical parameters against trained baseline risk thresholds, and visualizes live situational status across high-risk sectors.',
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
      'Seamless multi-hazard composite index switching',
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
      'Renders Leaflet interactive tile layers with GeoJSON hazard polygons, dynamic color-coded severity rings, telemetry station markers, and infrastructure nodes mapped with precise GPS coordinates.',
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
      'Clickable station & critical facility popups',
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
      'Layer toggle controls for granular intelligence',
      'Automatic center-panning upon location selection',
      'Interactive inspector cards for bridges, dams, and shelters',
    ],
  },
  {
    id: 'multi-hazard',
    stepNumber: 3,
    name: 'Multi-Hazard Detection & Cascading DSS',
    shortTitle: 'Multi-Hazard Monitoring',
    route: '/',
    badge: 'COMPOUND THREATS',
    iconName: 'Layers',
    purpose:
      'Detects compound, cascading hazards where one initial event (e.g. cloudburst) triggers secondary failures (debris flows, road cut-offs, flash floods).',
    howItWorks:
      'Computes normalized individual vulnerability indices across 6 distinct disaster types, applies compounding weighting matrix, and tracks cascading dependency chains.',
    technologyUsed: [
      'FastAPI Multi-Hazard Evaluation Engine',
      'Compounding Hazard Matrix Algorithms',
      'Dynamic Decision Support Architecture',
      'NDMA Disaster Protocol Mapping',
    ],
    inputData: [
      'Selected disaster category or composite mode',
      'Precipitation intensity & slope angle',
      'River basin water level & reservoir capacity',
      'Seismic ground acceleration coefficients',
    ],
    outputData: [
      'Hazard-specific vulnerability breakdown',
      'Cascading chain flow analysis (Primary -> Secondary triggers)',
      'Severity multiplier for combined impacts',
      'Specific NDMA standard operating protocols',
    ],
    practicalUseCase:
      'During monsoon cyclones, the engine alerts that coastal wind is not only a storm threat but will trigger flash flooding in river estuaries 4 hours later.',
    projectContribution:
      'Prevents single-hazard tunnel vision, ensuring damage prioritization accounts for cascading secondary disruptions.',
    limitations: [
      'Cascading models rely on empirical hazard correlation matrices.',
      'Extreme unprecedented weather anomalies may exceed trained parameters.',
    ],
    keyHighlights: [
      'Clear differentiation between Flood, Landslide, Cyclone, and Seismic impacts',
      'Visual Cascading Flow diagram showing cause-and-effect pipelines',
      'Hazard-specific evacuation priority recommendations',
    ],
  },
  {
    id: 'drone-rescue',
    stepNumber: 4,
    name: 'AI Drone Rescue Scanner & Vision',
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
    stepNumber: 5,
    name: 'AI Land Scan & U-Net 2D Segmentation',
    shortTitle: 'AI Land Scan & U-Net',
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
    stepNumber: 6,
    name: 'AI Risk Prediction (Random Forest 9-Param)',
    shortTitle: 'AI Risk Prediction',
    route: '/prediction',
    badge: 'MACHINE LEARNING MODEL',
    iconName: 'BrainCircuit',
    purpose:
      'Predicts localized landslide slope failure probability using a trained 9-parameter Random Forest Classifier and explains feature contributions.',
    howItWorks:
      'Accepts geotechnical parameters (Rainfall, Slope, Soil Saturation, Vegetation, Seismic, Water Distance, Soil Types), normalizes inputs, queries landslide_model.pkl, and generates risk probability with SHAP-inspired explainability.',
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
    id: 'impact-analysis',
    stepNumber: 8,
    name: 'Impact Analysis & Damage Prioritization System',
    shortTitle: 'Damage Prioritization',
    route: '/impact-analysis',
    badge: 'CORE PRIORITIZATION ENGINE',
    iconName: 'Building2',
    isHighlightFeature: true,
    purpose:
      'THE CENTRAL MISSION OF DISASTERGUARD AI: Synthesizes multi-hazard severity, demographic density, and infrastructure exposure into an ordered, actionable damage prioritization ranking for emergency dispatchers.',
    howItWorks:
      'Intersects hazard footprints with demographic census data (elderly, children), transport arteries, hospitals, and schools. Ranks affected sectors by calculated vulnerability to direct emergency inspection resources where lives and lifelines are most threatened.',
    technologyUsed: [
      'Geospatial Demographic Overlay Engine',
      'Multi-Hazard Exposure Profiler',
      'Critical Infrastructure GIS Database',
      'Triage Prioritization Algorithms',
      'Leaflet Multi-Node Asset Mapping',
    ],
    inputData: [
      'Hazard geometry & affected footprint area (km²)',
      'Vulnerable demographic counts (elderly, children, infirm)',
      'Exposed road kilometers & transport choke points',
      'Critical health facilities & educational centers in zone',
      'Verified emergency shelters ready for intake',
    ],
    outputData: [
      'Hazard-Specific Exposure Profiles (Flood, Landslide, Cyclone, Seismic, Fire)',
      'Ranked Damage Severity Level (CRITICAL / HIGH / MODERATE)',
      'Prioritized Inspection Action List with human verification status',
      'Vulnerability score & recommended standard operating protocol',
      'Available safe geo-shelters & intake capacities',
    ],
    practicalUseCase:
      'When three simultaneous landslides occur across a district, the system ranks Chooralmala as Priority #1 (850 elderly/children isolated + only bridge compromised), directing the first NDRF battalion there rather than lower-density sites.',
    projectContribution:
      'This is the heart of the platform — turning chaotic multi-disaster data into a prioritized tactical plan for rescue and damage repair.',
    limitations: [
      'Demographic numbers represent census approximations until on-the-ground ward surveys confirm exact counts.',
      'Infrastructure status requires continuous updates as field units report damage.',
    ],
    keyHighlights: [
      'Dedicated hazard tabs with distinct exposure calculations (not generic static numbers)',
      'Clear breakdown of elderly and child vulnerability',
      'Interactive infrastructure card list with condition notes and distances',
    ],
  },
  {
    id: 'evacuation',
    stepNumber: 9,
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
      'Active hazard zones & reported road blockades',
      'Travel mode selection (Foot, Car, Heavy Emergency Vehicle)',
    ],
    outputData: [
      'Safe route turn-by-turn trajectory with safety score',
      'Estimated travel duration & distance (km)',
      'Road condition status & hazard proximity warnings',
      'Shelter capacity, medical bays, backup power, and contact info',
    ],
    practicalUseCase:
      'A community cut off by a valley river surge is routed through an elevated ridge road to the Somavaram Relief Complex, bypassing flooded culverts.',
    projectContribution:
      'Translates damage rankings into immediate protective action by guiding exposed citizens to verified safety.',
    limitations: [
      'Routes must be verified by local traffic police and disaster authorities during active emergencies.',
      'Road washouts occurring in real time require aerial or scout confirmation.',
    ],
    keyHighlights: [
      'Multi-tiered emergency shelter database across India',
      'Avoids simulated road obstacles and hazard rings',
      'Displays real shelter amenities (backup generator, clean water, medical bays)',
    ],
  },
  {
    id: 'alerts',
    stepNumber: 10,
    name: 'Common Alerting Protocol (CAP) Bulletins',
    shortTitle: 'Alerts & Advisories',
    route: '/alerts',
    badge: 'PUBLIC WARNING',
    iconName: 'BellRing',
    purpose:
      'Standardizes early warning messages into structured, priority-ranked bulletins aligned with international Common Alerting Protocol (CAP) and NDMA directives.',
    howItWorks:
      'Filters incoming sensor and model triggers into structured bulletins with clear severity tags, affected radii, recommended public actions, and official verification states.',
    technologyUsed: [
      'CAP XML/JSON Protocol Formatter',
      'Severity-Based Notification Filtering',
      'Multilingual Translation Engine Integration',
      'Broadcast Simulation Guard',
    ],
    inputData: [
      'Triggering sensor / AI model event',
      'Hazard classification & severity level (CRITICAL, HIGH, MODERATE)',
      'Affected administrative districts & GPS centroid',
    ],
    outputData: [
      'Color-coded operational bulletins with expiry timestamps',
      'Actionable safety instructions for citizens & responders',
      'Filterable feeds by severity and disaster category',
      'Simulated broadcast trigger buttons (safe mode in demo)',
    ],
    practicalUseCase:
      'A red alert bulletin is formatted in under 30 seconds for district broadcast, warning residents in Chooralmala to move to designated high ground immediately.',
    projectContribution:
      'Communicates prioritized risks to responders and the public in clear, unambiguous language.',
    limitations: [
      'In Hackathon Demo Mode, external SMS/cell-broadcast gateways are safely sandboxed to prevent accidental panic broadcasts.',
    ],
    keyHighlights: [
      'Clear severity tags: CRITICAL WARNING, HIGH ALERT, WATCH',
      'Instant search and filter by hazard category',
      'Safe demonstration mode prevents live external dispatches',
    ],
  },
  {
    id: 'sos',
    stepNumber: 11,
    name: 'Emergency SOS Distress Protocol',
    shortTitle: 'Emergency SOS',
    route: '/',
    badge: 'CITIZEN REPORTING & RESCUE',
    iconName: 'LifeBuoy',
    purpose:
      'Provides a fail-safe citizen distress transmission protocol for trapped individuals to broadcast precise GPS coordinates and emergency rescue needs.',
    howItWorks:
      'Captures live GPS coordinates via browser Geolocation API, collects stranded victim counts, hazard type, and medical triage notes, and packages the payload into an operations card.',
    technologyUsed: [
      'HTML5 Geolocation API (High Accuracy Mode)',
      'Interactive SOS Modal with 3-Step Guided Workflow',
      'Sandboxed Hackathon Interceptor (Safe Transmission)',
      'Encrypted Operations Payload Packaging',
    ],
    inputData: [
      'Distress hazard type (Trapped in Water, Mudslide, Medical, Structural)',
      'Victim count & vulnerable persons flag',
      'Current GPS coordinates (lat/lng) with accuracy radius',
      'Optional callback phone number & situational notes',
    ],
    outputData: [
      'Standardized SOS transmission token & reference tracking ID',
      'Simulated confirmation receipt (strictly sandboxed in demo mode)',
      'Actionable card injected into the command center incident queue',
    ],
    practicalUseCase:
      'A family stranded on a terrace in rising floodwaters taps Emergency SOS; their phone locks GPS coordinates and transacts a critical distress beacon.',
    projectContribution:
      'Enables citizen-initiated damage signals to enter the prioritization pipeline in real time.',
    limitations: [
      'Requires cellular or satellite internet connectivity on the client device.',
      'Strictly sandboxed in demo mode to never dial 112 or contact real authorities.',
    ],
    keyHighlights: [
      'Prominent high-contrast red emergency button with pulse animation',
      'Automatic GPS lock with manual map fallback',
      'Clear demonstration warning: Simulated in demo environment',
    ],
  },
  {
    id: 'historical',
    stepNumber: 12,
    name: 'Historical Analysis & Response Audit Logs',
    shortTitle: 'Historical & Audit',
    route: '/historical',
    badge: 'ACCOUNTABILITY & LEARNING',
    iconName: 'History',
    purpose:
      'Provides post-disaster accountability, historical pattern matching, and complete audit tracking of every automated alert and operator decision.',
    howItWorks:
      'Maintains an immutable digital event ledger recording detections, verifications, team dispatches, and resolution timestamps, alongside historical disaster archive data.',
    technologyUsed: [
      'FastAPI Central Audit Logging Architecture',
      'Chronological Event Stream Engine',
      'Statistical Response Time Analytics (MTTD / MTTR)',
      'SQLite / PostgreSQL Archival Storage',
    ],
    inputData: [
      'Historical disaster records across Indian states (2018–2026)',
      'System-generated detection timestamps',
      'Human operator action logs (Verify, Dispatch, Resolve, Close)',
    ],
    outputData: [
      'Interactive audit timeline with newest-first / oldest-first toggles',
      'Mean Time to Dispatch & verification metrics',
      'Historical seasonal risk comparison charts',
      'Post-incident operational review dossiers',
    ],
    practicalUseCase:
      'Following a storm event, the district collector audits the exact timeline from AI drone detection (14:02) to operator verification (14:04) and NDRF dispatch (14:08).',
    projectContribution:
      'Ensures continuous improvement of damage prioritization formulas by reviewing real historical response performance.',
    limitations: [
      'Historical baseline data reflects verified past events (Wayanad, Munnar, Kedarnath, Godavari).',
    ],
    keyHighlights: [
      'Real backend audit log stream from /api/v1/audit-logs',
      'Operator attribution for all lifecycle actions',
      'Historical trend comparison tools',
    ],
  },
];
