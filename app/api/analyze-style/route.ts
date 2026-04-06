import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { setStyleProfile } from '@/lib/kv';
import { getSessionUserId } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { samplePosts } = body;

    const posts = String(samplePosts || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const totalChars = posts.join(' ').length;

    if (posts.length < 5 || totalChars < 280) {
      return NextResponse.json(
        {
          error:
            'Please provide 5-10 substantial sample posts so style analysis can be accurate.',
        },
        { status: 400 }
      );
    }

    const prompt = {
      system: 'You are an expert writing-style analyst. Return only a style profile. Never repeat the user prompt, instructions, or sample posts.',
      user: `Create a concise, actionable style profile from these samples:

<samples>
${posts.join('\n')}
</samples>

Required sections:
1) Sentence length and rhythm
2) Vocabulary and phrasing
3) Punctuation habits
4) Hook/opening patterns
5) Tone signature
6) Recurring quirks
7) What to avoid

Write in second person. Output only the profile text.`
    };

    const rawProfile = await callAI([
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user }
    ]);

    const cleanedProfile = rawProfile
      .replace(/<samples>[\s\S]*?<\/samples>/gi, '')
      .replace(/Create a concise, actionable style profile[\s\S]*?Output only the profile text\./i, '')
      .replace(/Analyze these sample posts[\s\S]*?Be specific and actionable\./i, '')
      .trim();

    const profile = cleanedProfile.length > 40 ? cleanedProfile : rawProfile.trim();

    try {
      await setStyleProfile(userId, profile);
    } catch (kvError) {
      console.warn('Vercel KV not available in development, profile not persisted:', kvError);
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Style Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Style analysis failed' },
      { status: 500 }
    );
  }
}
