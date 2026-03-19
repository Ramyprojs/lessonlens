'use client';
// ============================================================
// useScreenShare — React hook for screen sharing
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { screenCapture } from '@/services/screenCapture';

export function useScreenShare() {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startShare = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await screenCapture.startCapture(() => {
        setIsSharing(false);
        setStream(null);
      });
      setStream(mediaStream);
      setIsSharing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        screenCapture.attachVideoElement(videoRef.current);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start screen sharing';
      if (msg === 'PERMISSION_DENIED') {
        setError('Screen sharing permission was denied. Please allow access and try again.');
      } else {
        setError(msg);
      }
      setIsSharing(false);
    }
  }, []);

  const stopShare = useCallback(() => {
    screenCapture.stopCapture();
    setIsSharing(false);
    setStream(null);
  }, []);

  const captureFrame = useCallback((quality?: number): string | null => {
    return screenCapture.captureFrame(quality);
  }, []);

  const attachVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (el && stream) {
        el.srcObject = stream;
        screenCapture.attachVideoElement(el);
      }
    },
    [stream]
  );

  // Auto-attach stream when it becomes available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      screenCapture.attachVideoElement(videoRef.current);
    }
  }, [stream]);

  return {
    isSharing,
    stream,
    error,
    startShare,
    stopShare,
    captureFrame,
    attachVideo,
    videoRef,
  };
}
