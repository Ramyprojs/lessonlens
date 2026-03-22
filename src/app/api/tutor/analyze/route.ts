// ============================================================
// POST /api/tutor/analyze — Screen analysis endpoint
// Server-side only: protects the Gemini API key
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { runCloudflareChat } from '@/lib/cloudflareAi';
import type { AnalysisRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { context, mode, difficulty, userMessage } = body;

    const content = await runCloudflareChat([
      {
        role: 'system',
        content: `You are Nova, a mobile-first study tutor. Mode: ${mode}. Difficulty: ${difficulty}. Reply in short actionable bullets.`,
      },
      {
        role: 'user',
        content: [
          'A screen analysis request was received from the app.',
          'Use available context and tutor memory to infer likely help the learner needs.',
          `Current subject: ${context.currentSubject || 'general learning'}`,
          `Topics covered: ${context.topicsCovered.slice(-6).join(', ') || 'none yet'}`,
          userMessage ? `Learner message: ${userMessage}` : 'No direct learner message was provided.',
        ].join('\n'),
      },
    ]);

    return NextResponse.json({
      content,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error('[API] Tutor analyze error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
