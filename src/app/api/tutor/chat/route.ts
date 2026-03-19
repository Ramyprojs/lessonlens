// ============================================================
// POST /api/tutor/chat — Direct chat with Nova
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeScreenWithGemini } from '@/services/ai/geminiService';
import { buildSystemPrompt } from '@/services/ai/promptBuilder';
import type { TutoringMode, DifficultyLevel, SessionMemoryState } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body: {
      message: string;
      frame?: string;
      mode: TutoringMode;
      difficulty: DifficultyLevel;
      memory: SessionMemoryState;
    } = await request.json();

    const { message, frame, mode, difficulty, memory } = body;

    const systemPrompt = buildSystemPrompt(mode, difficulty, memory.currentSubject);

    let userPrompt = message;
    if (memory.topicsCovered.length > 0) {
      userPrompt += `\n\nContext: We've been discussing ${memory.topicsCovered.slice(-3).join(', ')}.`;
    }

    let response: string;

    if (frame) {
      response = await analyzeScreenWithGemini(apiKey, systemPrompt, userPrompt, frame);
    } else {
      // Text-only chat (no screen frame) — use native fetch
      const reqBody = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqBody),
        }
      );

      const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      response = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || 'I couldn\'t generate a response.';
    }

    return NextResponse.json({ content: response, timestamp: Date.now() });
  } catch (error: unknown) {
    console.error('[API] Chat error details:', error instanceof Error ? error.stack : error);
    const message = error instanceof Error ? error.message : 'Chat failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
