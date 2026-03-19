// ============================================================
// Speech Output Service
// ============================================================

export class SpeechOutputService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private queue: string[] = [];
  private isSpeaking: boolean = false;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private volume: number = 0.8;
  private enabled: boolean = true;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private onSpeakingChange: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoice();
    }
  }

  private loadVoice(): void {
    if (!this.synth) return;

    const setVoice = () => {
      const voices = this.synth!.getVoices();
      // Prefer natural-sounding English voices
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Premium'))
      );
      this.selectedVoice = preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
    };

    setVoice();
    this.synth.addEventListener('voiceschanged', setVoice);
  }

  speak(text: string): void {
    if (!this.enabled || !this.synth || !text.trim()) return;

    // Clean markdown formatting from text for speech
    const cleanText = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[-*+]\s/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();

    if (!cleanText) return;

    // Split long text into sentences for more natural delivery
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

    for (const sentence of sentences) {
      this.queue.push(sentence.trim());
    }

    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length === 0 || !this.synth) {
      this.isSpeaking = false;
      this.onSpeakingChange?.(false);
      return;
    }

    this.isSpeaking = true;
    this.onSpeakingChange?.(true);

    const text = this.queue.shift()!;
    const utterance = new SpeechSynthesisUtterance(text);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onend = () => {
      this.currentUtterance = null;
      this.processQueue();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      this.processQueue();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.queue = [];
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.onSpeakingChange?.(false);
  }

  setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  setPitch(pitch: number): void {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  onSpeakingStateChange(callback: (speaking: boolean) => void): void {
    this.onSpeakingChange = callback;
  }
}

// Lazy singleton — only created client-side
let instance: SpeechOutputService | null = null;
export function getSpeechService(): SpeechOutputService {
  if (!instance) {
    instance = new SpeechOutputService();
  }
  return instance;
}
