import { DemoFeatureDetail } from '../types/demoTour';

export const DEMO_FEATURES: DemoFeatureDetail[] = [
  {
    id: 'dashboard-overview',
    stepNumber: 1,
    name: 'Main Operational Dashboard & Triage Overview',
    shortTitle: '1. Dashboard Overview',
    route: '/',
    badge: 'OPERATIONAL COMMAND',
    iconName: 'LayoutDashboard',
    isHighlightFeature: true,
    purpose:
      'Unifies multi-hazard risk indicators, prioritized inspection counts, active emergency alerts, and four core KPI summary cards into an executive triage center for disaster managers.',
    howItWorks:
      'Aggregates telemetry feeds, counts pending damage assessments awaiting review, identifies high-priority inspection sites, tallies verified assessments, and tracks open incidents with one-click access to the guided damage wizard.',
    technologyUsed: [
      'React 18 & TypeScript',
      'Tailwind CSS Responsive Grid',
      'FastAPI Backend REST Service',
      'Open-Meteo & IMD Telemetry Feeds',
      'Real-time State Context Engine',
    ],
    inputData: [
      'Active geographic coordinates & ward boundaries',
      'Active incident alerts and distress tallies',
      'Pending and verified assessment records from database',
      '24-hr cumulative rainfall telemetry from automated gauges',
    ],
    outputData: [
      '4 Core Summary Cards (Pending Review, High-Priority, Verified, Open Incidents)',
      'Primary action: Start Damage Assessment Guided Wizard',
      'Top-priority inspection locations mini-queue',
      'Embedded spatial GIS hazard preview',
    ],
    practicalUseCase:
      'During severe monsoon cloudbursts in Wayanad or Bhimavaram, an emergency coordinator opens the platform to immediately see how many sites require urgent physical triage without getting overwhelmed.',
    projectContribution:
      'Acts as the mission-critical executive interface for PS-53, orienting responders to high-risk zones before dispatching resources.',
    limitations: [
      'Requires active network connection or local IoT gateway for real-time telemetry updates.',
      'Non-monitored wards rely on regional meteorological models rather than local ground sensors.',
    ],
    keyHighlights: [
      'Clean 4-card executive overview without layout clutter',
      'One-click launch into the 7-step Guided Damage Assessment Wizard',
      'Direct link to full Inspection Priority Queue',
    ],
  },
  {
    id: 'imagery-upload',
    stepNumber: 2,
    name: 'Bitemporal Pre & Post-Disaster Imagery Upload',
    shortTitle: '2. Imagery Upload',
    route: '/damage-assessment',
    badge: 'DATA INGESTION & GSD',
    iconName: 'Layers',
    isHighlightFeature: false,
    purpose:
      'Ingests baseline pre-disaster satellite optical captures alongside post-disaster aerial/drone imagery with Ground Sampling Distance (GSD) validation and bitemporal alignment.',
    howItWorks:
      'Provides interactive drag-and-drop file uploaders or pre-configured disaster incident presets (Wayanad, Chamoli, Joshimath, Munnar), validating resolution, timestamps, and geolocation tags before processing.',
    technologyUsed: [
      'Bitemporal Image Registration Engine',
      'Client-Side EXIF & Dimension Validator',
      'Ground Sampling Distance (GSD) Normalizer',
      'Multi-Format Ingestion (GeoTIFF, JPG, PNG)',
    ],
    inputData: [
      'Pre-disaster optical baseline image (Sentinel-2, Cartosat-2E, Google Earth)',
      'Post-disaster target drone / aerial image (DJI Matrice 300, WorldView-3)',
      'GPS latitude/longitude and spatial footprint',
      'Ground pixel resolution (0.15m – 10.0m GSD)',
    ],
    outputData: [
      'Validated bitemporal image pair with metadata report',
      'Ground Sampling Distance (GSD) verification flag',
      'Normalized visual comparison workspace',
      'Pre-alignment structural anchor points',
    ],
    practicalUseCase:
      'Drone survey operators upload low-altitude aerial orthomosaics captured 2 hours after a hill collapse and verify that resolution is sharp enough (<0.5m GSD) for structural analysis.',
    projectContribution:
      'Forms the empirical optical baseline required for automated computer vision damage classification under PS-53.',
    limitations: [
      'Optical imagery requires adequate daylight and low cloud cover; radar/SAR imagery recommended for dense monsoon cloud decks.',
      'Extreme oblique UAV camera angles require georeferencing calibration.',
    ],
    keyHighlights: [
      'Presets for major historical Indian disaster scenarios',
      'Instant resolution & spatial GSD validation',
      'Curtain split-slider for comparative visual inspection',
    ],
  },
  {
    id: 'damage-analysis',
    stepNumber: 3,
    name: 'AI Damage Inference & EMS-98 Structural Classification',
    shortTitle: '3. Damage Analysis',
    route: '/damage-assessment',
    badge: 'EMS-98 CLASSIFICATION',
    iconName: 'Building2',
    isHighlightFeature: true,
    purpose:
      'Classifies structural and terrain destruction according to the European Macroseismic Scale (EMS-98 Grade 1 to 5), estimating physical damage percentage and marking visual evidence.',
    howItWorks:
      'Runs optical edge/texture difference pipelines, U-Net structural boundary segmentation, and morphological change detection to calculate physical damage scores (0–100) and flag visual evidence coordinates.',
    technologyUsed: [
      'EMS-98 International Structural Damage Classifier',
      'SIH26001 U-Net Boundary Segmentation Model',
      'Multi-Feature Computer Vision Change Detection',
      'Uncertainty & Image Quality Degradation Penalty Engine',
    ],
    inputData: [
      'Bitemporal imagery difference metrics',
      'Disaster classification type (Landslide, Flash Flood, Mudflow)',
      'Structural footprint density',
    ],
    outputData: [
      'EMS-98 Grade (Grade 1 Negligible to Grade 5 Total Collapse)',
      'Numerical Physical Damage Score (0–100%)',
      'Detected Damage Category: DESTROYED, MAJOR, MODERATE, MINOR, UNAFFECTED',
      'Visual Damage Evidence list with confidence percentages and coordinates',
    ],
    practicalUseCase:
      'Automatically classifies the Chooralmala School building as Grade 4 (Very Heavy Structural Damage, 88%) while identifying completely severed culverts with 94% confidence.',
    projectContribution:
      'Replaces subjective optical impressions with standardized engineering damage grades, ensuring consistent evaluation across all affected wards.',
    limitations: [
      'Optical computer vision cannot detect internal foundation micro-fractures without ground geotechnical sensors.',
      'Submerged roadbeds require hydro-acoustic or physical depth probes.',
    ],
    keyHighlights: [
      'Standardized EMS-98 Grade 1–5 structural classification',
      'Interactive visual evidence markers highlighting collapse zones',
      'Explicit uncertainty reporting based on image resolution and cloud cover',
    ],
  },
  {
    id: 'inspection-prioritization',
    stepNumber: 4,
    name: 'Explainable Inspection Prioritization Engine (PS-53)',
    shortTitle: '4. Inspection Prioritization',
    route: '/damage-assessment',
    badge: 'CORE PS-53 ENGINE',
    iconName: 'ListFilter',
    isHighlightFeature: true,
    purpose:
      'THE DIRECT SOLUTION TO PS-53: Automatically ranks every damaged site into a transparent, explainable triage queue (P1 Urgent to P4 Routine) to optimize limited field inspection teams.',
    howItWorks:
      'Evaluates the multi-criteria formula: Priority = 0.35 * Damage + 0.25 * Population + 0.20 * Infrastructure + 0.15 * Hazard - 0.05 * Uncertainty. Generates plain-language rationale explaining exactly why each location was ranked.',
    technologyUsed: [
      'Multi-Criteria Decision Analysis (MCDA)',
      'Explainable AI (XAI) Rationale Generator',
      'Real-Time Triage Scheduling & Multi-Column Sorting',
      'Human-in-the-Loop Override & Verification Protocol',
    ],
    inputData: [
      'AI Physical Damage Score (D) [0–100]',
      'Civilian Population Exposure Index (P) [0–100]',
      'Critical Infrastructure Weight (I) [0–100] (Hospitals, Bridges, Power)',
      'Escalating Environmental Hazard Level (H) [0–100]',
      'Data Uncertainty Penalty (U) [0–100]',
    ],
    outputData: [
      'Composite Priority Score (0–100)',
      'Triage Tier: P1 URGENT (<2h), P2 HIGH (<6h), P3 MEDIUM (<24h), P4 LOW (Routine)',
      'Plain-language explainable ranking rationale breakdown',
      'Assigned inspector and human verification status',
    ],
    practicalUseCase:
      'When 5 locations suffer damage, the engine ranks Chooralmala as #1 (Priority 89, P1) because an arterial bridge is cut and rainfall is escalating, while an agricultural slide in Munnar is ranked P4 (Priority 38), preventing inspection bottlenecks.',
    projectContribution:
      'Directly fulfills Problem Statement PS-53 by eliminating arbitrary scheduling and ensuring inspection teams save lives first.',
    limitations: [
      'Relies on baseline demographic census data until real-time evacuee headcounts are updated.',
      'Should be re-evaluated if secondary rainfall cloudbursts hit lower-priority wards.',
    ],
    keyHighlights: [
      '100% transparent mathematical weighting formula visible to reviewers',
      'Plain-language rationale explaining every ranking decision',
      'Human-in-the-loop verification modal with officer badge sign-off',
    ],
  },
  {
    id: 'map-visualization',
    stepNumber: 5,
    name: 'Spatial Multi-Hazard GIS Map & Damage Layers',
    shortTitle: '5. Map Visualization',
    route: '/risk-map',
    badge: 'GEOSPATIAL INTELLIGENCE',
    iconName: 'MapPin',
    isHighlightFeature: false,
    purpose:
      'Translates damage priority queues and hazard telemetry into interactive geospatial visual layers with color-coded severity pins, incident buffers, and infrastructure markers.',
    howItWorks:
      'Renders Leaflet interactive tile layers with GeoJSON hazard perimeters, dynamic color-coded priority markers (P1 red to P4 blue), automated weather station rings, and relief shelter locations.',
    technologyUsed: [
      'Leaflet & React-Leaflet GIS Engine',
      'OpenStreetMap Cartographic Tile Servers',
      'Custom SVG Map Markers & Severity Pulse Shaders',
      'Haversine Distance & Proximity Computation Engine',
    ],
    inputData: [
      'Geographical coordinates (latitude / longitude) of all assessed sites',
      'Priority score and verification status of each location',
      'Critical infrastructure coordinates (hospitals, bridges, dams)',
      'Active incident coordinates and estimated hazard radii',
    ],
    outputData: [
      'Interactive zoomable hazard and priority map with layer toggles',
      'Clickable inspection popups with priority tier, damage %, and action links',
      'Visual danger buffer zones around active incidents',
      'Filterable GIS layers for rainfall gauges, shelters, and roads',
    ],
    practicalUseCase:
      'First responders visually verify that Chooralmala P1 is directly downstream of an active slope failure buffer, allowing units to stage on northern high ground rather than vulnerable approach roads.',
    projectContribution:
      'Provides spatial grounding for priority rankings, helping logistical coordinators plan safe vehicle ingress routes.',
    limitations: [
      'Offline field deployment requires pre-cached map tile packages.',
      'Public cartographic layer accuracy depends on OpenStreetMap coverage in remote rural belts.',
    ],
    keyHighlights: [
      'Color-coded markers matching PS-53 priority tiers (P1 to P4)',
      'Interactive popups linking directly to assessment records',
      'Togglable layers for weather stations, shelters, and critical assets',
    ],
  },
  {
    id: 'drone-rescue',
    stepNumber: 6,
    name: 'AI Drone Aerial Video & Rescue Scanner',
    shortTitle: '6. Drone & Rescue',
    route: '/drone-rescue',
    badge: 'AERIAL COMPUTER VISION',
    iconName: 'Crosshair',
    isHighlightFeature: false,
    purpose:
      'Scans live or simulated UAV aerial video feeds with YOLOv8 computer vision to detect stranded individuals, assess posture distress, and triage rescue dispatches.',
    howItWorks:
      'Extracts video frames through an optimized YOLOv8 nano object detection pipeline, applies distress heuristics (immobility, inundation proximity, lying posture), and creates dispatch action cards.',
    technologyUsed: [
      'YOLOv8 Nano Computer Vision (yolov8n.pt)',
      'HTML5 Video Canvas Annotation Overlay',
      'Kinematic Distress Scoring Algorithm',
      'Automated Rescue Dispatch Ticket Generator',
    ],
    inputData: [
      'UAV aerial video feed (high-definition optical or thermal)',
      'Bounding box coordinates of detected individuals',
      'UAV flight telemetry (altitude, battery, GPS coordinates)',
    ],
    outputData: [
      'Detected persons with real-time confidence scores',
      'Distress Severity Index (0.00 – 1.00)',
      'Rescue Priority Tier: CRITICAL, HIGH, or MONITORING',
      '1-click NDRF/SDRF Dispatch action ticket',
    ],
    practicalUseCase:
      'A drone sweeping floodwaters detects a survivor stranded on an isolated rooftop; the system flags Distress 92% and auto-generates a high-priority rescue dispatch card.',
    projectContribution:
      'Feeds live victim locations directly into the damage prioritization queue, ensuring life-safety missions take precedence over structural inspections.',
    limitations: [
      'Dense forest foliage or severe storms require thermal/FLIR camera payloads.',
      'Synthetic demo footage is clearly labeled for simulated testing.',
    ],
    keyHighlights: [
      'Real-time computer vision bounding boxes and distress badges',
      'Distress factor breakdown (posture, immobility, surroundings)',
      'Strict safety disclaimers: field dispatches require human sign-off',
    ],
  },
  {
    id: 'weather-rainfall',
    stepNumber: 7,
    name: 'Hydro-Meteorology & Rainfall Monitoring',
    shortTitle: '7. Weather & Rainfall',
    route: '/rainfall',
    badge: 'HYDROLOGICAL TELEMETRY',
    iconName: 'CloudRain',
    isHighlightFeature: false,
    purpose:
      'Monitors cumulative precipitation intervals, intensity spikes, and soil saturation thresholds that trigger secondary slope failures and structural washouts.',
    howItWorks:
      'Visualizes 24h, 48h, and 72h historical and live precipitation trends using interactive Recharts analytics, comparing real-time gauges against IMD warning thresholds (Watch, Warning, Critical).',
    technologyUsed: [
      'Recharts SVG Interactive Time-Series Charts',
      'Automated Weather Station (AWS) Ingestion Engine',
      'IMD Warning Level Threshold Classification',
      'Hydrological Landslide Risk Correlation Matrix',
    ],
    inputData: [
      'AWS rain gauge telemetry (mm/hr and 24-hr cumulative)',
      'Soil moisture saturation percentages (%)',
      'Historical seasonal rainfall baselines',
    ],
    outputData: [
      'Precipitation intensity trend curves and threshold lines',
      'Threshold exceedance alerts (Normal, Watch, Warning, Critical)',
      'Rainfall vs. Landslide Risk correlation matrix',
      'Real-time cumulative precipitation status cards',
    ],
    practicalUseCase:
      'Rainfall in Munnar surpasses 148mm in 24 hours, breaching the 120mm red-line threshold; automatic notifications alert downstream inspection teams of imminent secondary slides.',
    projectContribution:
      'Provides the environmental hazard coefficient (H) utilized in the PS-53 priority ranking formula.',
    limitations: [
      'Remote mountainous areas rely on satellite precipitation estimates where ground gauges are absent.',
    ],
    keyHighlights: [
      'Clear indicators distinguishing live telemetry vs regional estimation',
      'Interactive time-series charts with IMD threshold guidelines',
      'Direct correlation to geotechnical slope instability triggers',
    ],
  },
  {
    id: 'evacuation-shelters',
    stepNumber: 8,
    name: 'Evacuation Route Planning & Safehouse GIS',
    shortTitle: '8. Evacuation & Shelters',
    route: '/evacuation',
    badge: 'TACTICAL EVACUATION',
    iconName: 'Navigation',
    isHighlightFeature: false,
    purpose:
      'Calculates hazard-aware evacuation corridors directing vulnerable populations away from debris paths toward verified high-ground relief shelters.',
    howItWorks:
      'Computes multi-modal paths (Foot, Vehicle, 4x4 Emergency) while dynamically routing around road segments marked as blocked, washed out, or within active landslide hazard zones.',
    technologyUsed: [
      'Leaflet Polyline Routing Visualization',
      'Hazard Obstacle Avoidance Routing Logic',
      'Verified Emergency Safehouse GIS Registry',
      'Multi-Tier Shelter Proximity Filter (25km, 50km, 100km)',
    ],
    inputData: [
      'Origin location (vulnerable settlement or isolated structure)',
      'Target verified shelter node and capacity',
      'Active blocked road vectors and flood boundaries',
      'Transport mode: Foot vs Vehicle vs 4x4 Rescue',
    ],
    outputData: [
      'Safest navigable evacuation route polyline',
      'Estimated transit duration and distance (km)',
      'Target shelter capacity and current occupancy headcount',
      'Hazard clearance margin (meters from nearest slide path)',
    ],
    practicalUseCase:
      'Village elders receive an evacuation map directing 240 villagers along the western ridgeline rather than the main road, which is blocked by mudflows.',
    projectContribution:
      'Translates damage priority rankings into life-safety corridors, evacuating citizens before structural collapses worsen.',
    limitations: [
      'Requires timely field reporting of freshly blocked secondary village roads.',
    ],
    keyHighlights: [
      'Visual distinction between Safe, Alternative, and Blocked routes',
      'Interactive shelter cards with capacity metrics',
      'One-click origin and destination selection',
    ],
  },
  {
    id: 'reports-audit',
    stepNumber: 9,
    name: 'Official Reports & Immutable Audit Trail',
    shortTitle: '9. Reports & Audit Trail',
    route: '/reports',
    badge: 'GOVERNANCE & REPORTING',
    iconName: 'FileText',
    isHighlightFeature: false,
    purpose:
      'Generates official NDMA-formatted damage prioritization PDF and CSV reports with human verification logs, officer signatures, and full tamper-evident audit trails.',
    howItWorks:
      'Compiles all verified damage assessments, priority rankings, assigned inspection teams, and officer justifications into standardized printable reports suitable for District Collectors and NDMA officials.',
    technologyUsed: [
      'Print-Optimized NDMA/SDMA Report Engine',
      'CSV / JSON Data Export Utilities',
      'Immutable Audit Trail Logging System',
      'Digital Timestamp & Officer Signature Verification',
    ],
    inputData: [
      'Verified damage assessment records and priority scores',
      'Inspector badge numbers, officer roles, and action timestamps',
      'Manual priority override justifications',
    ],
    outputData: [
      'Print-ready NDMA Disaster Damage Prioritization Report',
      'Searchable audit trail log of every verification and dispatch action',
      'Exportable CSV data package for GIS and civil engineering analysis',
    ],
    practicalUseCase:
      'The Incident Commander generates an official summary for the State Disaster Management Authority within 15 minutes of assessment completion, complete with inspector badge numbers.',
    projectContribution:
      'Provides the formal documentation and administrative accountability required for government disaster relief funding and legal compliance.',
    limitations: [
      'PDF printing relies on browser print formatting standards.',
    ],
    keyHighlights: [
      'Standardized NDMA / SDMA report template ready for immediate printing',
      'Complete chronological audit trail with zero tampering risk',
      'One-click export for external GIS software and spreadsheet analysis',
    ],
  },
  {
    id: 'admin-capabilities',
    stepNumber: 10,
    name: 'Administrative Center & Role-Based Access Control',
    shortTitle: '10. Admin Capabilities',
    route: '/admin',
    badge: 'SYSTEM GOVERNANCE',
    iconName: 'ShieldAlert',
    isHighlightFeature: true,
    purpose:
      'Provides a dedicated administrative control center with 9 management tabs, strict Role-Based Access Control (RBAC), AI model registry, and system telemetry.',
    howItWorks:
      'Restricts access strictly to authorized ADMIN roles (with dedicated access-denied safeguards for non-admins). Provides controls for User Management, Priority Weights Configuration, Model Registry, Telemetry, and System Settings.',
    technologyUsed: [
      'Role-Based Access Control (RBAC) Guard',
      'ML Model Registry (landslide_model.pkl, U-Net, YOLOv8)',
      'System Telemetry & Health Monitoring',
      'Priority Formula Weight Customization Panel',
    ],
    inputData: [
      'Current authenticated user role and identity',
      'System health metrics (CPU, RAM, API latencies)',
      'Active machine learning model artifact versions',
      'Configurable formula weight coefficients (Damage, Population, Infra, Hazard, Uncertainty)',
    ],
    outputData: [
      '9 Dedicated Admin Panels: Overview, Users, Priorities, Models, Sensor Telemetry, Audit Logs, Backups, API Keys, System Settings',
      'Live model health status and inference latency tracking',
      'Access-restricted guard preventing unauthorized role escalation',
    ],
    practicalUseCase:
      'System Administrators adjust priority weighting to place higher emphasis on Critical Infrastructure (from 0.20 to 0.30) during an industrial chemical zone flood emergency.',
    projectContribution:
      'Ensures platform integrity, operational security, and governance standards necessary for enterprise government deployment.',
    limitations: [
      'Administrative changes require authorized ADMIN persona credentials.',
    ],
    keyHighlights: [
      'Strict RBAC enforcement with polite access-denied fallback for non-admins',
      '9 dedicated administrative management tabs',
      'Transparent AI model registry tracking all active ML weights and versions',
    ],
  },
];
