// ============================================================
// POST /api/tutor/analyze — Screen analysis endpoint
// Server-side only: protects the Gemini API key
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeScreenWithGemini } from '@/services/ai/geminiService';
import { buildSystemPrompt, buildAnalysisPrompt } from '@/services/ai/promptBuilder';
import type { AnalysisRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Set GEMINI_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const body: AnalysisRequest = await request.json();
    const { frame, context, mode, difficulty, userMessage } = body;

    if (!frame) {
      return NextResponse.json(
        { error: 'No screen frame provided' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(mode, difficulty, context.currentSubject);
    const analysisPrompt = buildAnalysisPrompt(context, mode, userMessage);

    const response = await analyzeScreenWithGemini(
      apiKey,
      systemPrompt,
      analysisPrompt,
      frame
    );

    return NextResponse.json({
      content: response,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error('[API] Tutor analyze error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
