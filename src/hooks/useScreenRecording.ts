'use client';
// ============================================================
// useScreenRecording — React hook for screen recording
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { screenRecording } from '@/services/screenRecording';

export function useScreenRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback((stream: MediaStream) => {
    screenRecording.startRecording(stream);
    setIsRecording(true);
    setDuration(0);
    setRecordingBlob(null);

    timerRef.current = setInterval(() => {
      setDuration(screenRecording.getDuration());
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    const blob = screenRecording.stopRecording();
    setIsRecording(false);
    setRecordingBlob(blob);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return blob;
  }, []);

  const downloadRecording = useCallback(
    (filename?: string) => {
      if (recordingBlob) {
        screenRecording.downloadRecording(recordingBlob, filename);
      }
    },
    [recordingBlob]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isRecording,
    duration,
    recordingBlob,
    startRecording,
    stopRecording,
    downloadRecording,
  };
}
