const AI_PROVIDER = process.env.AI_PROVIDER || 'nim';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callAI(messages: Message[], options?: { temperature?: number }) {
  if (AI_PROVIDER === 'claude') {
    return callClaude(messages, options);
  }
  return callNIM(messages, options);
}

async function callNIM(messages: Message[], options?: { temperature?: number }) {
  const apiKey = process.env.NIM_API_KEY;
  if (!apiKey) {
    throw new Error('NIM_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.3-70b-instruct',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NIM API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The AI is taking too long to respond.');
    }
    throw error;
  }
}

async function callClaude(messages: Message[], options?: { temperature?: number }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The AI is taking too long to respond.');
    }
    throw error;
  }
}