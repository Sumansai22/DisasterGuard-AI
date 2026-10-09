import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_FEATURES } from '../data/demoTourData';
import { DemoTourViewMode } from '../types/demoTour';

interface DemoTourContextType {
  isOpen: boolean;
  currentStepIndex: number; // 0 = Overview, 1..12 = Features, 13 = Final Summary
  totalSteps: number; // 14 total (0..13)
  isPlaying: boolean;
  secondsRemaining: number;
  autoPlayDuration: number;
  viewMode: DemoTourViewMode;
  openDemoTour: (stepIndex?: number) => void;
  closeDemoTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  togglePlayPause: () => void;
  restartTour: () => void;
  setViewMode: (mode: DemoTourViewMode) => void;
  currentFeature: typeof DEMO_FEATURES[0] | null;
}

const DemoTourContext = createContext<DemoTourContextType | undefined>(undefined);

const AUTO_PLAY_DURATION = 15; // 15 seconds per step in auto-play mode

export const DemoTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(AUTO_PLAY_DURATION);
  const [viewMode, setViewMode] = useState<DemoTourViewMode>('DOSSIER');

  const totalSteps = DEMO_FEATURES.length + 2; // Overview (0) + 12 Features (1..12) + Summary (13) = 14 steps

  const currentFeature =
    currentStepIndex >= 1 && currentStepIndex <= DEMO_FEATURES.length
      ? DEMO_FEATURES[currentStepIndex - 1]
      : null;

  const openDemoTour = useCallback((stepIndex: number = 0) => {
    setCurrentStepIndex(stepIndex);
    setIsOpen(true);
    setIsPlaying(false);
    setSecondsRemaining(AUTO_PLAY_DURATION);
  }, []);

  const closeDemoTour = useCallback(() => {
    setIsOpen(false);
    setIsPlaying(false);
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalSteps - 1));
      setCurrentStepIndex(clamped);
      setSecondsRemaining(AUTO_PLAY_DURATION);
    },
    [totalSteps]
  );

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) {
        setSecondsRemaining(AUTO_PLAY_DURATION);
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev > 0) {
        setSecondsRemaining(AUTO_PLAY_DURATION);
        return prev - 1;
      }
      return 0;
    });
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const restartTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setSecondsRemaining(AUTO_PLAY_DURATION);
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          nextStep();
          return AUTO_PLAY_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, nextStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDemoTour();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, prevStep, closeDemoTour, togglePlayPause]);

  return (
    <DemoTourContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        totalSteps,
        isPlaying,
        secondsRemaining,
        autoPlayDuration: AUTO_PLAY_DURATION,
        viewMode,
        openDemoTour,
        closeDemoTour,
        nextStep,
        prevStep,
        goToStep,
        togglePlayPause,
        restartTour,
        setViewMode,
        currentFeature,
      }}
    >
      {children}
    </DemoTourContext.Provider>
  );
};

export const useDemoTour = (): DemoTourContextType => {
  const context = useContext(DemoTourContext);
  if (!context) {
    throw new Error('useDemoTour must be used within a DemoTourProvider');
  }
  return context;
};

export default DemoTourContext;
