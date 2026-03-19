'use client';

// ============================================================
// /app — Main Tutoring Dashboard
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { useScreenShare } from '@/hooks/useScreenShare';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { useTutor } from '@/hooks/useTutor';
import { useSpeech } from '@/hooks/useSpeech';
import { screenCapture } from '@/services/screenCapture';
import { cn, formatDuration, formatTimestamp, generateId } from '@/lib/utils';
import type { TutoringMode, DifficultyLevel, SessionStatus } from '@/types';
import Link from 'next/link';
import {
  Eye,
  Monitor,
  MonitorOff,
  Video,
  VideoOff,
  Download,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  ArrowLeft,
  Timer,
  BookOpen,
  HelpCircle,
  Compass,
  FileText,
  MessageSquare,
  Lightbulb,
  Blocks,
  Bug,
  ListChecks,
  Zap,
  Brain,
  Settings,
  AlertCircle,
} from 'lucide-react';

export default function AppPage() {
  const { status, isSharing, mode, difficulty, isTutorPanelExpanded, setTutorPanelExpanded } =
    useSessionStore();

  return (
    <div className="h-screen flex flex-col bg-surface-950 overflow-hidden">
      {/* Top bar */}
      <AppHeader />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Screen preview */}
        <div className={cn('flex-1 flex flex-col', isTutorPanelExpanded ? '' : '')}>
          <ScreenPreviewPanel />
        </div>

        {/* Tutor panel */}
        {isTutorPanelExpanded && (
          <div className="w-[420px] xl:w-[480px] border-l border-surface-700/50 flex flex-col bg-surface-900/50">
            <TutorPanel />
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <ControlBar />
    </div>
  );
}

/* ── App Header ──────────────────────────────────────── */
function AppHeader() {
  const { status, isSharing, sessionStartTime } = useSessionStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!sessionStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  return (
    <header className="h-14 border-b border-surface-700/50 glass-strong flex items-center justify-between px-4 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-text-100 group-hover:text-brand-400 transition-colors hidden sm:block">
            LessonLens
          </span>
        </Link>
        <div className="w-px h-6 bg-surface-700/50 hidden sm:block" />
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center gap-3">
        {sessionStartTime && (
          <div className="flex items-center gap-1.5 text-xs text-text-400">
            <Timer className="w-3.5 h-3.5" />
            {formatDuration(elapsed)}
          </div>
        )}
        {isSharing && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Screen Active
          </div>
        )}
      </div>
    </header>
  );
}

/* ── Status Badge ───────────────────────────────────── */
function StatusBadge({ status }: { status: SessionStatus }) {
  const config: Record<SessionStatus, { label: string; color: string; icon: React.ReactNode }> = {
    idle: { label: 'Ready', color: 'text-text-400 bg-surface-800', icon: <Zap className="w-3 h-3" /> },
    connecting: { label: 'Connecting...', color: 'text-yellow-400 bg-yellow-500/10', icon: <Zap className="w-3 h-3 animate-pulse" /> },
    analyzing: { label: 'Analyzing', color: 'text-blue-400 bg-blue-500/10', icon: <Brain className="w-3 h-3 animate-pulse" /> },
    tutoring: { label: 'Tutoring Live', color: 'text-green-400 bg-green-500/10', icon: <Sparkles className="w-3 h-3" /> },
    recording: { label: 'Recording', color: 'text-red-400 bg-red-500/10', icon: <Video className="w-3 h-3" /> },
    paused: { label: 'Paused', color: 'text-yellow-400 bg-yellow-500/10', icon: <Timer className="w-3 h-3" /> },
    error: { label: 'Error', color: 'text-red-400 bg-red-500/10', icon: <AlertCircle className="w-3 h-3" /> },
  };

  const c = config[status];
  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', c.color)}>
      {c.icon}
      {c.label}
    </div>
  );
}

/* ── Screen Preview Panel ───────────────────────────── */
function ScreenPreviewPanel() {
  const { isSharing, status } = useSessionStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isSharing && videoRef.current) {
      const stream = screenCapture.getStream();
      if (stream) {
        videoRef.current.srcObject = stream;
        // The service might need to track it for frame capturing
        screenCapture.attachVideoElement(videoRef.current);
      }
    } else if (!isSharing && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [isSharing]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative">
      {isSharing ? (
        <div className="w-full h-full rounded-xl overflow-hidden bg-black shadow-2xl relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
          {/* Recording indicator */}
          {status === 'recording' && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-xs text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              REC
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-800 border border-surface-700/50 flex items-center justify-center">
            <Monitor className="w-10 h-10 text-text-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-100 mb-2">
              Share your screen to start
            </h2>
            <p className="text-sm text-text-400 leading-relaxed">
              Click &ldquo;Start Sharing&rdquo; below to share your screen.
              Nova will watch and teach you based on what&apos;s visible.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['Code Editor', 'Math Problems', 'Slides', 'Documents', 'Websites'].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700/50 text-xs text-text-400"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tutor Panel ─────────────────────────────────────── */
function TutorPanel() {
  const {
    messages,
    currentObservation,
    mode,
    voiceSettings,
    setTutorPanelExpanded,
  } = useSessionStore();
  const { sendMessage } = useTutor();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-text-100">Nova</span>
            <span className="text-xs text-text-400 ml-2">AI Tutor</span>
          </div>
        </div>
        <button
          onClick={() => setTutorPanelExpanded(false)}
          className="p-1.5 rounded-lg hover:bg-surface-800 text-text-400 hover:text-text-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nova's observation */}
      {currentObservation && (
        <div className="px-4 py-3 border-b border-surface-700/30 flex-shrink-0">
          <div className="flex items-start gap-2 text-xs">
            <Eye className="w-3.5 h-3.5 text-accent-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-text-400 font-medium">What Nova sees: </span>
              <span className="text-text-300">{currentObservation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <MessageSquare className="w-8 h-8 text-text-400" />
            <p className="text-sm text-text-400">
              Start screen sharing and Nova will begin tutoring you.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'animate-fade-in',
                msg.role === 'user' ? 'flex justify-end' : ''
              )}
            >
              {msg.role === 'nova' ? (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-surface-800/80 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-text-200 leading-relaxed max-w-[90%]">
                    {msg.isStreaming ? (
                      <div className="flex items-center gap-1 py-1">
                        <div className="typing-dot w-1.5 h-1.5 rounded-full bg-accent-400" />
                        <div className="typing-dot w-1.5 h-1.5 rounded-full bg-accent-400" />
                        <div className="typing-dot w-1.5 h-1.5 rounded-full bg-accent-400" />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                    {!msg.isStreaming && (
                      <div className="text-[10px] text-text-400 mt-1.5">
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ) : msg.role === 'user' ? (
                <div className="bg-brand-500/15 border border-brand-500/20 rounded-xl rounded-tr-sm px-3.5 py-2.5 text-sm text-text-200 max-w-[85%]">
                  {msg.content}
                  <div className="text-[10px] text-text-400 mt-1.5 text-right">
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-text-400 text-center py-1">
                  {msg.content}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* Input */}
      <div className="px-4 py-3 border-t border-surface-700/50 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nova anything..."
            rows={1}
            className="flex-1 resize-none bg-surface-800 border border-surface-700/50 rounded-xl px-4 py-2.5 text-sm text-text-200 placeholder:text-text-400 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              input.trim()
                ? 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95'
                : 'bg-surface-800 text-text-400'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Quick Actions ──────────────────────────────────── */
function QuickActions() {
  const { sendMessage } = useTutor();

  const actions = [
    { label: 'Explain this', icon: <Lightbulb className="w-3 h-3" />, msg: 'Please explain what you see on my screen right now.' },
    { label: 'Simplify', icon: <Blocks className="w-3 h-3" />, msg: 'Can you simplify the explanation? Make it easier to understand.' },
    { label: 'Find mistake', icon: <Bug className="w-3 h-3" />, msg: 'Can you check for any mistakes or issues in what\'s on screen?' },
    { label: 'Step by step', icon: <ListChecks className="w-3 h-3" />, msg: 'Break this down step by step for me.' },
    { label: 'Quiz me', icon: <HelpCircle className="w-3 h-3" />, msg: 'Quiz me on what\'s currently on screen.' },
    { label: 'Summarize', icon: <FileText className="w-3 h-3" />, msg: 'Summarize what\'s on screen.' },
  ];

  return (
    <div className="px-4 py-2 flex-shrink-0">
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => sendMessage(action.msg)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-800/60 border border-surface-700/40 text-[11px] text-text-300 hover:text-text-100 hover:border-brand-500/30 hover:bg-surface-800 transition-all"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Control Bar ─────────────────────────────────────── */
function ControlBar() {
  const {
    isSharing,
    isRecording,
    status,
    mode,
    difficulty,
    voiceSettings,
    recordingDuration,
    isTutorPanelExpanded,
    setMode,
    setDifficulty,
    setIsSharing,
    setIsRecording,
    setStatus,
    setSessionStartTime,
    setVoiceEnabled,
    setVoiceRate,
    setTutorPanelExpanded,
    resetMemory,
    addMessage,
  } = useSessionStore();

  const { startShare, stopShare, captureFrame, isSharing: shareActive, error: shareError } = useScreenShare();
  const { startRecording, stopRecording, downloadRecording, duration, isRecording: recActive } = useScreenRecording();
  const { startAnalysis, stopAnalysis, setCaptureFunction, generateSummary } = useTutor();
  const { stop: stopSpeech } = useSpeech();

  // Sync capture function
  useEffect(() => {
    setCaptureFunction(() => captureFrame());
  }, [setCaptureFunction, captureFrame]);

  // Sync recording duration to store
  useEffect(() => {
    if (recActive) {
      useSessionStore.getState().setRecordingDuration(duration);
    }
  }, [duration, recActive]);

  const handleStartShare = async () => {
    try {
      setStatus('connecting');
      const stream = await startShare();
      setIsSharing(true);
      setStatus('tutoring');
      setSessionStartTime(Date.now());
      resetMemory();
      addMessage({ role: 'system', content: 'Screen sharing started. Nova is now watching.' });

      // Start AI analysis loop
      setTimeout(() => {
        startAnalysis();
      }, 1500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleStopShare = async () => {
    stopShare();
    stopAnalysis();
    stopSpeech();
    setIsSharing(false);
    setStatus('idle');
    addMessage({ role: 'system', content: 'Screen sharing ended.' });

    // Offer summary
    const summary = await generateSummary();
    if (summary) {
      addMessage({ role: 'nova', content: `📋 **Session Summary**\n\n${summary}` });
    }
  };

  const handleStartRecording = () => {
    // Get the actual MediaStream from the screen capture service
    const mediaStream = screenCapture.getStream();
    if (mediaStream) {
      startRecording(mediaStream);
      setIsRecording(true);
      setStatus('recording');
    }
  };

  const handleStopRecording = () => {
    const blob = stopRecording();
    setIsRecording(false);
    if (isSharing) setStatus('tutoring');
    if (blob) {
      downloadRecording();
    }
  };

  const modes: { value: TutoringMode; label: string; icon: React.ReactNode }[] = [
    { value: 'explain', label: 'Explain', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { value: 'quiz', label: 'Quiz Me', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { value: 'guide', label: 'Guide Me', icon: <Compass className="w-3.5 h-3.5" /> },
    { value: 'summarize', label: 'Summarize', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const levels: { value: DifficultyLevel; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="flex-shrink-0 border-t border-surface-700/50 glass-strong">
      <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Screen controls */}
        <div className="flex items-center gap-2">
          {!isSharing ? (
            <button
              onClick={handleStartShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Monitor className="w-4 h-4" />
              Start Sharing
            </button>
          ) : (
            <button
              onClick={handleStopShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/25 transition-all"
            >
              <MonitorOff className="w-4 h-4" />
              Stop Sharing
            </button>
          )}

          {isSharing && (
            <>
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800 border border-surface-700/50 text-text-300 text-sm hover:text-text-100 hover:border-surface-600 transition-all"
                >
                  <Video className="w-4 h-4" />
                  Record
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm transition-all"
                >
                  <VideoOff className="w-4 h-4" />
                  {formatDuration(duration)}
                </button>
              )}
            </>
          )}

          {shareError && (
            <span className="text-xs text-red-400 ml-2">{shareError}</span>
          )}
        </div>

        {/* Center: Mode + Difficulty */}
        <div className="flex items-center gap-3">
          {/* Mode buttons */}
          <div className="flex items-center gap-1 bg-surface-800/60 rounded-xl p-1 border border-surface-700/30">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  mode === m.value
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-text-400 hover:text-text-200 hover:bg-surface-700/50'
                )}
              >
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1 bg-surface-800/60 rounded-xl p-1 border border-surface-700/30">
            {levels.map((l) => (
              <button
                key={l.value}
                onClick={() => setDifficulty(l.value)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  difficulty === l.value
                    ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30'
                    : 'text-text-400 hover:text-text-200 hover:bg-surface-700/50'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Voice + Panel toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceSettings.enabled)}
            className={cn(
              'p-2 rounded-xl border transition-all',
              voiceSettings.enabled
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-surface-800 border-surface-700/50 text-text-400'
            )}
            title={voiceSettings.enabled ? 'Mute Nova' : 'Unmute Nova'}
          >
            {voiceSettings.enabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {voiceSettings.enabled && (
            <select
              value={voiceSettings.rate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="bg-surface-800 border border-surface-700/50 rounded-lg px-2 py-1.5 text-xs text-text-300 focus:outline-none"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          )}

          {!isTutorPanelExpanded && (
            <button
              onClick={() => setTutorPanelExpanded(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm hover:bg-accent-500/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Nova
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
