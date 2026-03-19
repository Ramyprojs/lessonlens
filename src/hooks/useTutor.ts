'use client';
// ============================================================
// useTutor — Main tutoring orchestration hook
// Connects screen capture → AI analysis → tutor response → speech
// ============================================================

import { useCallback, useRef, useEffect, useState } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { useSpeech } from './useSpeech';
import { generateId } from '@/lib/utils';

const ANALYSIS_INTERVAL = 6000; // Analyze every 6 seconds
const MIN_FRAME_INTERVAL = 4000; // Minimum interval between frames

export function useTutor() {
  const {
    isSharing,
    mode,
    difficulty,
    memory,
    voiceSettings,
    addMessage,
    updateMessage,
    setStatus,
    setCurrentObservation,
    addObservation,
    addTopic,
    setCurrentSubject,
  } = useSessionStore();

  const { speak, stop: stopSpeech, setRate, setEnabled: setSpeechEnabled } = useSpeech();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureFrameFnRef = useRef<(() => string | null) | null>(null);
  const lastAnalysisRef = useRef<number>(0);

  // Register the frame capture function from the screen share hook
  const setCaptureFunction = useCallback((fn: () => string | null) => {
    captureFrameFnRef.current = fn;
  }, []);

  // Analyze a single frame
  const analyzeFrame = useCallback(async () => {
    const captureFrame = captureFrameFnRef.current;
    if (!captureFrame || isAnalyzing) return;

    const now = Date.now();
    if (now - lastAnalysisRef.current < MIN_FRAME_INTERVAL) return;
    lastAnalysisRef.current = now;

    const frame = captureFrame();
    if (!frame) return;

    setIsAnalyzing(true);
    setStatus('analyzing');

    const msgId = generateId();

    try {
      addMessage({
        role: 'nova',
        content: '...',
        isStreaming: true,
        mode,
      });

      const response = await fetch('/api/tutor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frame,
          context: memory,
          mode,
          difficulty,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Analysis failed: ${response.status}`);
      }

      const content = data.content || 'I couldn\'t analyze the screen right now.';

      // Update the streaming message with real content
      // Use the store's messages to find the last streaming message
      const store = useSessionStore.getState();
      const streamingMsg = store.messages.find((m) => m.isStreaming);
      if (streamingMsg) {
        updateMessage(streamingMsg.id, content, false);
      }

      // Update observations and memory
      setCurrentObservation(content.substring(0, 150));
      addObservation(content.substring(0, 100));

      // Simple topic extraction
      const topics = content.match(/\b(?:function|class|variable|loop|array|component|API|database|algorithm|equation|theorem|concept)\b/gi);
      if (topics) {
        topics.slice(0, 2).forEach((t: string) => addTopic(t.toLowerCase()));
      }

      setStatus('tutoring');

      // Speak if voice is enabled
      if (voiceSettings.enabled) {
        speak(content);
      }
    } catch (error) {
      console.error('[Tutor] Analysis error:', error);
      const store = useSessionStore.getState();
      const streamingMsg = store.messages.find((m) => m.isStreaming);
      if (streamingMsg) {
        updateMessage(streamingMsg.id, error instanceof Error ? `Error: ${error.message}` : 'I had trouble analyzing the screen. I\'ll try again shortly.', false);
      }
      setStatus('error');
      setTimeout(() => {
        if (useSessionStore.getState().isSharing) {
          setStatus('tutoring');
        }
      }, 3000);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    isAnalyzing, mode, difficulty, memory, voiceSettings.enabled,
    addMessage, updateMessage, setStatus, setCurrentObservation,
    addObservation, addTopic, speak,
  ]);

  const sendMessage = useCallback(async (message: string) => {
    addMessage({ role: 'user', content: message });

    const msgId = generateId();
    addMessage({ role: 'nova', content: '...', isStreaming: true, mode });

    try {
      const captureFrame = captureFrameFnRef.current;
      const frame = captureFrame?.() || undefined;

      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          frame,
          mode,
          difficulty,
          memory,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Chat failed');
      }

      const content = data.content || 'I could not generate a response. Please try again.';

      const store = useSessionStore.getState();
      const streamingMsg = store.messages.find((m) => m.isStreaming);
      if (streamingMsg) {
        updateMessage(streamingMsg.id, content, false);
      }

      if (voiceSettings.enabled) {
        speak(content);
      }
    } catch (error) {
      console.error('[Tutor] Chat error:', error);
      const store = useSessionStore.getState();
      const streamingMsg = store.messages.find((m) => m.isStreaming);
      if (streamingMsg) {
        updateMessage(streamingMsg.id, error instanceof Error ? `Error: ${error.message}` : 'Sorry, I couldn\'t process that. Please try again.', false);
      }
    }
  }, [mode, difficulty, memory, voiceSettings.enabled, addMessage, updateMessage, speak]);

  // Generate session summary
  const generateSummary = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/tutor/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory }),
      });

      if (!response.ok) throw new Error('Summary failed');
      const data = await response.json();
      return data.summary;
    } catch {
      return 'Unable to generate session summary. Please try again.';
    }
  }, [memory]);

  // Start/stop analysis loop based on sharing state
  const startAnalysis = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(analyzeFrame, ANALYSIS_INTERVAL);
    // Run first analysis after a short delay
    setTimeout(analyzeFrame, 2000);
  }, [analyzeFrame]);

  const stopAnalysis = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopSpeech();
  }, [stopSpeech]);

  // Sync voice settings
  useEffect(() => {
    setRate(voiceSettings.rate);
    setSpeechEnabled(voiceSettings.enabled);
  }, [voiceSettings.rate, voiceSettings.enabled, setRate, setSpeechEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isAnalyzing,
    analyzeFrame,
    sendMessage,
    generateSummary,
    startAnalysis,
    stopAnalysis,
    setCaptureFunction,
  };
}
