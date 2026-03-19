// ============================================================
// Gemini AI Service - Server-side API integration
// ============================================================

import type { SubjectType } from '@/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiRequest {
  contents: GeminiMessage[];
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  };
}

export async function analyzeScreenWithGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  frameBase64: string,
): Promise<string> {
  const request: GeminiRequest = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: frameBase64,
            },
          },
          { text: userPrompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  };

  console.log(`[Gemini API] Requesting analysis. Frame size: ${Math.round(frameBase64.length / 1024)} KB. User prompt: "${userPrompt.substring(0, 50)}..."`);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[Gemini API] HTTP Error ${response.status}:`, errorData);
      throw new Error(`Gemini API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      console.error(`[Gemini API] Empty response candidates. Raw data:`, JSON.stringify(data).substring(0, 200));
      throw new Error('No response generated from Gemini');
    }

    const content = data.candidates[0]?.content?.parts
      ?.map((p: GeminiPart) => p.text || '')
      .join('') || '';

    return content;
  } catch (err) {
    console.error(`[Gemini API] Fetch/Parse Error:`, err);
    throw err;
  }
}

export async function generateSessionSummary(
  apiKey: string,
  summaryPrompt: string,
): Promise<string> {
  const request: GeminiRequest = {
    contents: [
      {
        role: 'user',
        parts: [{ text: summaryPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts
    ?.map((p: GeminiPart) => p.text || '')
    .join('') || 'Unable to generate summary.';
}

export function detectSubject(text: string): SubjectType {
  const lower = text.toLowerCase();
  if (/\b(function|const|let|var|class|import|export|def |return |if \(|for \(|while \(|=>|console\.|print\(|void |int |string )\b/.test(lower)) {
    return 'code';
  }
  if (/\b(equation|formula|integral|derivative|theorem|proof|calculate|solve|algebra|calculus|matrix|vector)\b/.test(lower)) {
    return 'math';
  }
  if (/\b(slide|presentation|powerpoint|keynote)\b/.test(lower)) {
    return 'slides';
  }
  if (/\b(spreadsheet|excel|cell|row|column|worksheet|csv)\b/.test(lower)) {
    return 'spreadsheet';
  }
  if (/\b(diagram|flowchart|uml|architecture|schema)\b/.test(lower)) {
    return 'diagram';
  }
  return 'general';
}
