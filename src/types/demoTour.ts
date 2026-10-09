export interface DemoFeatureDetail {
  id: string;
  stepNumber: number; // 1 to 12
  name: string;
  shortTitle: string;
  route: string;
  badge: string;
  iconName: string;
  purpose: string;
  howItWorks: string;
  technologyUsed: string[];
  inputData: string[];
  outputData: string[];
  practicalUseCase: string;
  projectContribution: string;
  limitations: string[];
  keyHighlights: string[];
  isHighlightFeature?: boolean; // True for Feature 8 (Damage Prioritization)
}

export type DemoTourViewMode = 'DOSSIER' | 'COMPACT_HUD';

export interface DemoTourState {
  isOpen: boolean;
  currentStepIndex: number; // 0 = Overview, 1-12 = Features, 13 = Final Summary
  isPlaying: boolean;
  secondsRemaining: number;
  viewMode: DemoTourViewMode;
}
