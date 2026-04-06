import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { buildSuggestTopicsPrompt } from '@/lib/prompts';
import { getSessionUserId } from '@/lib/server-auth';
import { getStyleProfile } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const styleProfile = await getStyleProfile(userId);
    const prompt = buildSuggestTopicsPrompt(styleProfile || undefined);
    const result = await callAI([
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user }
    ]);

    const topics = result.split('\n')
      .filter((line: string) => line.trim() && /^\d+\./.test(line))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Suggest topics error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to suggest topics' },
      { status: 500 }
    );
  }
}
