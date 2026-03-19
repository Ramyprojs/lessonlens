'use client';
// ============================================================
// useSpeech — React hook for speech output
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { getSpeechService } from '@/services/speechOutput';

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const serviceRef = useRef<ReturnType<typeof getSpeechService> | null>(null);

  useEffect(() => {
    serviceRef.current = getSpeechService();
    serviceRef.current.onSpeakingStateChange(setIsSpeaking);
    return () => {
      serviceRef.current?.stop();
    };
  }, []);

  const speak = useCallback((text: string) => {
    serviceRef.current?.speak(text);
  }, []);

  const stop = useCallback(() => {
    serviceRef.current?.stop();
    setIsSpeaking(false);
  }, []);

  const setRate = useCallback((rate: number) => {
    serviceRef.current?.setRate(rate);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    serviceRef.current?.setEnabled(enabled);
  }, []);

  const setVolume = useCallback((volume: number) => {
    serviceRef.current?.setVolume(volume);
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    setRate,
    setEnabled,
    setVolume,
  };
}
