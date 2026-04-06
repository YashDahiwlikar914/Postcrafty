export const STYLE_PLACEHOLDER = `You are an X creator who writes concise, direct posts.
- Short sentences, punchy phrasing
- Minimal filler words
- Authoritative without being preachy
- Uses occasional humor to make points memorable`;

export function buildGeneratePrompt(options: {
  topic: string;
  tone: string;
  mode: 'single' | 'thread';
  styleProfile?: string;
}) {
  const style = options.styleProfile || STYLE_PLACEHOLDER;
  
  if (options.mode === 'thread') {
    return {
      system: `You are a ghostwriter for an X creator.
You write in the following style profile and preserve its voice:
${style}

Never use generic AI phrasing, filler words, or corporate tone.
Never start posts with "I" unless it fits naturally mid-sentence.
Write for maximum signal-to-noise ratio.`,
      user: `Audience/domain: infer from style profile and the provided topic.
Tone modifier: ${options.tone}
Mode: Thread (3-7 tweets)
Topic or angle: ${options.topic}

Generate a thread of 3-7 tweets.
- Tweet 1 must be a strong hook that grabs attention
- Each tweet should be under 280 characters
- The final tweet should have a clear call-to-action
- Separate each tweet with exactly three dashes (---)
- Output only the tweets, no labels or commentary

Example format:
Hook tweet here
---
Supporting point 1
---
Supporting point 2
---
Supporting point 3
---
Call to action tweet`
    };
  }
  
  return {
    system: `You are a ghostwriter for an X creator.
You write in the following style profile and preserve its voice:
${style}

Never use generic AI phrasing, filler words, or corporate tone.
Never start posts with "I" unless it fits naturally mid-sentence.
Write for maximum signal-to-noise ratio.`,
    user: `Audience/domain: infer from style profile and the provided topic.
Tone modifier: ${options.tone}
Mode: Single post
Topic or angle: ${options.topic}

Generate a single post.
Output only the post text. No commentary, no labels.`
  };
}

export function buildSuggestTopicsPrompt(styleProfile?: string) {
  const styleContext = styleProfile
    ? `Use this creator profile to infer their niche and audience:\n${styleProfile}`
    : 'Infer a likely niche from general creator behavior and propose broad but specific topics.';

  return {
    system: 'You are a trend analyst for X creators. Find compelling topics tailored to the creator profile.',
    user: `${styleContext}

Return 5-8 specific post-worthy topic ideas that fit this creator.
Format as a numbered list, one topic per line.
Keep topics concise (5-10 words each).`
  };
}

export function buildHooksAndHashtagsPrompt(postContent: string) {
  return {
    system: 'You are a social media strategist specializing in X/Twitter optimization.',
    user: `Given this post:
---
${postContent}
---

Return EXACTLY in this format:

1. [First alternative hook]
2. [Second alternative hook]
3. [Third alternative hook]
HASHTAGS: #hashtag1 #hashtag2 #hashtag3

Requirements:
- Keep hooks under 30 words each
- Provide 3-5 relevant hashtags
- Hashtags should match the post's domain and audience
- Start each hook with "1.", "2.", or "3."
- Start hashtags section with "HASHTAGS:" followed by space-separated hashtags
- No other text or commentary`
  };
}
