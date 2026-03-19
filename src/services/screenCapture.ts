// ============================================================
// Screen Capture Service
// ============================================================

export class ScreenCaptureService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private onStreamEnd: (() => void) | null = null;

  async startCapture(onEnd?: () => void): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 5, max: 10 },
        },
        audio: false,
      });

      this.onStreamEnd = onEnd || null;

      // Listen for when user stops sharing via browser UI
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.cleanup();
        this.onStreamEnd?.();
      });

      // Set up canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');

      return this.stream;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('PERMISSION_DENIED');
      }
      throw error;
    }
  }

  stopCapture(): void {
    this.cleanup();
  }

  captureFrame(quality: number = 0.7): string | null {
    if (!this.stream || !this.canvas || !this.ctx) return null;

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack || videoTrack.readyState !== 'live') return null;

    const settings = videoTrack.getSettings();
    const width = settings.width || 1280;
    const height = settings.height || 720;

    this.canvas.width = width;
    this.canvas.height = height;

    // If we have a video element attached, draw from it
    if (this.videoElement) {
      this.ctx.drawImage(this.videoElement, 0, 0, width, height);
      const dataUrl = this.canvas.toDataURL('image/jpeg', quality);
      // Return just the base64 part
      return dataUrl.split(',')[1];
    }

    return null;
  }

  attachVideoElement(video: HTMLVideoElement): void {
    this.videoElement = video;
    if (this.stream) {
      video.srcObject = this.stream;
    }
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  isActive(): boolean {
    return !!(this.stream && this.stream.getVideoTracks()[0]?.readyState === 'live');
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.videoElement = null;
    this.canvas = null;
    this.ctx = null;
  }
}

// Singleton instance
export const screenCapture = new ScreenCaptureService();
