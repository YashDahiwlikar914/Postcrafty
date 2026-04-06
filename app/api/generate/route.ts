import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { buildGeneratePrompt, buildHooksAndHashtagsPrompt } from '@/lib/prompts';
import { getStyleProfile } from '@/lib/kv';
import { getSessionUserId } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic, tone, mode, getSuggestions } = body;

    if (getSuggestions && topic) {
      const prompt = buildHooksAndHashtagsPrompt(topic);
      const result = await callAI([
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ]);

      const hooks: string[] = [];
      const hashtags: string[] = [];
      let currentSection = '';
      
      console.log('[Suggestions] Raw result:', result);
      
      const lines = result.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.match(/^1\./) || trimmedLine.match(/^2\./) || trimmedLine.match(/^3\./)) {
          currentSection = 'hooks';
          hooks.push(trimmedLine.replace(/^[123]\.\s*/, ''));
        } else if (trimmedLine.toUpperCase().includes('HASHTAG')) {
          currentSection = 'hashtags';
          // Extract hashtags from the line
          const tags = trimmedLine.match(/#\w+/g);
          if (tags) {
            tags.forEach((tag: string) => {
              if (!hashtags.includes(tag)) {
                hashtags.push(tag);
              }
            });
          }
        } else if (currentSection === 'hooks' && trimmedLine) {
          hooks.push(trimmedLine);
        } else if (currentSection === 'hashtags' && trimmedLine) {
          // Extract hashtags from the line
          const tags = trimmedLine.match(/#\w+/g);
          if (tags) {
            tags.forEach((tag: string) => {
              if (!hashtags.includes(tag)) {
                hashtags.push(tag);
              }
            });
          }
        }
        
        // Also scan entire result for hashtags as fallback
        const allTags = trimmedLine.match(/#\w+/g);
        if (allTags) {
          allTags.forEach((tag: string) => {
            if (!hashtags.includes(tag)) {
              hashtags.push(tag);
            }
          });
        }
      }
      
      console.log('[Suggestions] Parsed hooks:', hooks);
      console.log('[Suggestions] Parsed hashtags:', hashtags);

      return NextResponse.json({ hooks, hashtags });
    }

    // Get the stored style profile
    const styleProfile = await getStyleProfile(userId);

    const prompt = buildGeneratePrompt({ 
      topic, 
      tone, 
      mode: mode || 'single',
      styleProfile: styleProfile || undefined
    });
    
    const result = await callAI([
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user }
    ]);

    return NextResponse.json({ post: result });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
