// ============================================================
// POST /api/tutor/summary — Session summary endpoint
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { runCloudflareChat } from '@/lib/cloudflareAi';
import type { SessionMemoryState } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: { memory: SessionMemoryState } = await request.json();
    const summary = await runCloudflareChat([
      {
        role: 'system',
        content: 'Generate a concise study session summary with three sections: What You Learned, Gaps, Next Actions.',
      },
      {
        role: 'user',
        content: JSON.stringify(body.memory),
      },
    ]);

    return NextResponse.json({ summary, timestamp: Date.now() });
  } catch (error: unknown) {
    console.error('[API] Summary error:', error);
    const message = error instanceof Error ? error.message : 'Summary generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
