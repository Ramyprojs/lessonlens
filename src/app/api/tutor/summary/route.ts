// ============================================================
// POST /api/tutor/summary — Session summary endpoint
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateSessionSummary } from '@/services/ai/geminiService';
import { buildSummaryPrompt } from '@/services/ai/promptBuilder';
import type { SessionMemoryState } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body: { memory: SessionMemoryState } = await request.json();
    const summaryPrompt = buildSummaryPrompt(body.memory);
    const summary = await generateSessionSummary(apiKey, summaryPrompt);

    return NextResponse.json({ summary, timestamp: Date.now() });
  } catch (error: unknown) {
    console.error('[API] Summary error:', error);
    const message = error instanceof Error ? error.message : 'Summary generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
