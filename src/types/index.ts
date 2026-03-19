// ============================================================
// LessonLens Type Definitions
// ============================================================

export type TutoringMode = 'explain' | 'quiz' | 'guide' | 'summarize';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type SessionStatus = 'idle' | 'connecting' | 'analyzing' | 'tutoring' | 'recording' | 'paused' | 'error';
export type SubjectType = 'code' | 'math' | 'slides' | 'document' | 'website' | 'diagram' | 'spreadsheet' | 'video' | 'general';

export interface TutorMessage {
  id: string;
  role: 'user' | 'nova' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  mode?: TutoringMode;
}

export interface ScreenFrame {
  dataUrl: string;
  timestamp: number;
  width: number;
  height: number;
}

export interface SessionMemoryState {
  topicsCovered: string[];
  recentObservations: string[];
  recentQuestions: string[];
  currentSubject: SubjectType;
  explanationHistory: string[];
  sessionStartTime: number;
  frameCount: number;
}

export interface SessionSummaryData {
  keyConcepts: string[];
  confusingAreas: string[];
  suggestedNextSteps: string[];
  practiceRecommendations: string[];
  duration: number;
  framesAnalyzed: number;
  messagesExchanged: number;
}

export interface VoiceSettings {
  enabled: boolean;
  rate: number;       // 0.5 - 2.0
  pitch: number;      // 0 - 2
  volume: number;     // 0 - 1
  voiceIndex: number; // selected voice
}

export interface RecordingState {
  isRecording: boolean;
  startTime: number | null;
  duration: number;
  blob: Blob | null;
}

export interface TutorResponse {
  text: string;
  subject?: SubjectType;
  confidence?: number;
  suggestedActions?: string[];
  isPartial?: boolean;
}

export interface AnalysisRequest {
  frame: string; // base64
  context: SessionMemoryState;
  mode: TutoringMode;
  difficulty: DifficultyLevel;
  userMessage?: string;
}

export interface AnalysisResponse {
  content: string;
  subject: SubjectType;
  confidence: number;
  observation: string;
  suggestions: string[];
}
