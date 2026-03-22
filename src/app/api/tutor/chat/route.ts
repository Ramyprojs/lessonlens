// ============================================================
// POST /api/tutor/chat — Direct chat with Nova
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { runCloudflareChat } from '@/lib/cloudflareAi';
import type { TutoringMode, DifficultyLevel, SessionMemoryState } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: {
      message: string;
      frame?: string;
      mode: TutoringMode;
      difficulty: DifficultyLevel;
      memory: SessionMemoryState;
    } = await request.json();

    const { message, frame, mode, difficulty, memory } = body;

    const systemPrompt = [
      'You are Nova, a concise and friendly AI mobile tutor.',
      `Mode: ${mode}.`,
      `Difficulty: ${difficulty}.`,
      memory.currentSubject ? `Current subject: ${memory.currentSubject}.` : 'Current subject: general learning.',
      'Keep replies practical and structured in short sections.',
    ].join(' ');

    let userPrompt = message;
    if (memory.topicsCovered.length > 0) {
      userPrompt += `\n\nContext: We've been discussing ${memory.topicsCovered.slice(-3).join(', ')}.`;
    }
    if (frame) {
      userPrompt += '\n\nThe user shared a live frame, but this model path is configured for text tutoring. Use context clues from the user prompt.';
    }

    const response = await runCloudflareChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return NextResponse.json({ content: response, timestamp: Date.now() });
  } catch (error: unknown) {
    console.error('[API] Chat error details:', error instanceof Error ? error.stack : error);
    const message = error instanceof Error ? error.message : 'Chat failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
