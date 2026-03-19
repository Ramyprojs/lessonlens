import { create } from 'zustand';
import type {
  TutorMessage,
  TutoringMode,
  DifficultyLevel,
  SessionStatus,
  VoiceSettings,
  SessionMemoryState,
  SubjectType,
} from '@/types';
import { generateId } from '@/lib/utils';

interface SessionStore {
  // Session state
  status: SessionStatus;
  setStatus: (status: SessionStatus) => void;

  // Screen sharing
  isSharing: boolean;
  setIsSharing: (sharing: boolean) => void;

  // Recording
  isRecording: boolean;
  recordingStartTime: number | null;
  recordingDuration: number;
  setIsRecording: (recording: boolean) => void;
  setRecordingStartTime: (time: number | null) => void;
  setRecordingDuration: (duration: number) => void;

  // Tutoring configuration
  mode: TutoringMode;
  setMode: (mode: TutoringMode) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;

  // Messages
  messages: TutorMessage[];
  addMessage: (msg: Omit<TutorMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, content: string, isStreaming?: boolean) => void;
  clearMessages: () => void;

  // Current screen observation
  currentObservation: string;
  setCurrentObservation: (obs: string) => void;

  // Voice settings
  voiceSettings: VoiceSettings;
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceRate: (rate: number) => void;
  setVoiceMuted: (muted: boolean) => void;

  // Session memory
  memory: SessionMemoryState;
  addTopic: (topic: string) => void;
  addObservation: (obs: string) => void;
  setCurrentSubject: (subject: SubjectType) => void;
  resetMemory: () => void;

  // Tutor panel
  isTutorPanelExpanded: boolean;
  setTutorPanelExpanded: (expanded: boolean) => void;

  // Session timer
  sessionStartTime: number | null;
  setSessionStartTime: (time: number | null) => void;

  // Full reset
  resetSession: () => void;
}

const initialMemory: SessionMemoryState = {
  topicsCovered: [],
  recentObservations: [],
  recentQuestions: [],
  currentSubject: 'general',
  explanationHistory: [],
  sessionStartTime: 0,
  frameCount: 0,
};

const initialVoiceSettings: VoiceSettings = {
  enabled: true,
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
  voiceIndex: 0,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  // Session state
  status: 'idle',
  setStatus: (status) => set({ status }),

  // Screen sharing
  isSharing: false,
  setIsSharing: (isSharing) => set({ isSharing }),

  // Recording
  isRecording: false,
  recordingStartTime: null,
  recordingDuration: 0,
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecordingStartTime: (recordingStartTime) => set({ recordingStartTime }),
  setRecordingDuration: (recordingDuration) => set({ recordingDuration }),

  // Tutoring configuration
  mode: 'explain',
  setMode: (mode) => set({ mode }),
  difficulty: 'intermediate',
  setDifficulty: (difficulty) => set({ difficulty }),

  // Messages
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: generateId(), timestamp: Date.now() },
      ],
    })),
  updateMessage: (id, content, isStreaming = false) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content, isStreaming } : m
      ),
    })),
  clearMessages: () => set({ messages: [] }),

  // Current observation
  currentObservation: '',
  setCurrentObservation: (currentObservation) => set({ currentObservation }),

  // Voice settings
  voiceSettings: initialVoiceSettings,
  setVoiceEnabled: (enabled) =>
    set((state) => ({
      voiceSettings: { ...state.voiceSettings, enabled },
    })),
  setVoiceRate: (rate) =>
    set((state) => ({
      voiceSettings: { ...state.voiceSettings, rate },
    })),
  setVoiceMuted: (muted) =>
    set((state) => ({
      voiceSettings: { ...state.voiceSettings, enabled: !muted },
    })),

  // Memory
  memory: { ...initialMemory },
  addTopic: (topic) =>
    set((state) => ({
      memory: {
        ...state.memory,
        topicsCovered: [...new Set([...state.memory.topicsCovered, topic])],
      },
    })),
  addObservation: (obs) =>
    set((state) => ({
      memory: {
        ...state.memory,
        recentObservations: [...state.memory.recentObservations.slice(-9), obs],
        frameCount: state.memory.frameCount + 1,
      },
    })),
  setCurrentSubject: (subject) =>
    set((state) => ({
      memory: { ...state.memory, currentSubject: subject },
    })),
  resetMemory: () => set({ memory: { ...initialMemory, sessionStartTime: Date.now() } }),

  // Tutor panel
  isTutorPanelExpanded: true,
  setTutorPanelExpanded: (isTutorPanelExpanded) => set({ isTutorPanelExpanded }),

  // Session timer
  sessionStartTime: null,
  setSessionStartTime: (sessionStartTime) => set({ sessionStartTime }),

  // Full reset
  resetSession: () =>
    set({
      status: 'idle',
      isSharing: false,
      isRecording: false,
      recordingStartTime: null,
      recordingDuration: 0,
      messages: [],
      currentObservation: '',
      memory: { ...initialMemory },
      sessionStartTime: null,
    }),
}));
