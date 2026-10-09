import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  FeedbackItem,
  FeedbackType,
  FeedbackOptions,
  FeedbackContextValue,
} from '../types/feedback';

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const DEFAULT_DURATIONS: Record<FeedbackType, number> = {
  success: 4500,
  info: 4000,
  warning: 6000,
  error: 8000,
  loading: 0, // persistent until manually updated or dismissed
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissFeedback = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setFeedbacks((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addFeedback = useCallback(
    (type: FeedbackType, message: string, options?: FeedbackOptions): string => {
      const id = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duration =
        options?.duration !== undefined
          ? options.duration
          : DEFAULT_DURATIONS[type];

      const newItem: FeedbackItem = {
        id,
        type,
        message,
        title: options?.title,
        details: options?.details,
        timestamp: Date.now(),
        duration,
        action: options?.action,
        dismissible: options?.dismissible ?? true,
      };

      setFeedbacks((prev) => {
        // Keep at most 5 toasts visible to avoid viewport clutter
        const updated = [...prev, newItem];
        return updated.slice(-5);
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissFeedback(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissFeedback]
  );

  const showSuccess = useCallback(
    (message: string, options?: FeedbackOptions) => addFeedback('success', message, options),
    [addFeedback]
  );

  const showError = useCallback(
    (message: string, options?: FeedbackOptions) => addFeedback('error', message, options),
    [addFeedback]
  );

  const showWarning = useCallback(
    (message: string, options?: FeedbackOptions) => addFeedback('warning', message, options),
    [addFeedback]
  );

  const showInfo = useCallback(
    (message: string, options?: FeedbackOptions) => addFeedback('info', message, options),
    [addFeedback]
  );

  const showLoading = useCallback(
    (message: string, options?: FeedbackOptions) => addFeedback('loading', message, options),
    [addFeedback]
  );

  const updateFeedback = useCallback(
    (id: string, updates: Partial<FeedbackItem>) => {
      setFeedbacks((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const merged: FeedbackItem = { ...item, ...updates };

          // Reset timer if duration changed or type transitioned from loading
          const existingTimer = timersRef.current.get(id);
          if (existingTimer) {
            clearTimeout(existingTimer);
            timersRef.current.delete(id);
          }

          const newDuration =
            updates.duration !== undefined
              ? updates.duration
              : merged.type
              ? DEFAULT_DURATIONS[merged.type]
              : 4000;

          if (newDuration > 0) {
            const timer = setTimeout(() => {
              dismissFeedback(id);
            }, newDuration);
            timersRef.current.set(id, timer);
          }

          return merged;
        })
      );
    },
    [dismissFeedback]
  );

  const clearAllFeedback = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
    setFeedbacks([]);
  }, []);

  return (
    <FeedbackContext.Provider
      value={{
        feedbacks,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        updateFeedback,
        dismissFeedback,
        clearAllFeedback,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextValue => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
