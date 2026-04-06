import { NextRequest, NextResponse } from 'next/server';
import { isKvConfigured, listDrafts, saveDraft } from '@/lib/kv';
import { getSessionUserId } from '@/lib/server-auth';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isKvConfigured()) {
    return NextResponse.json(
      { error: 'History storage is not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN.' },
      { status: 503 }
    );
  }

  const drafts = await listDrafts(userId);
  return NextResponse.json({ drafts });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isKvConfigured()) {
    return NextResponse.json(
      { error: 'History storage is not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN.' },
      { status: 503 }
    );
  }

  const body = await request.json();
  const draft = {
    id: crypto.randomUUID(),
    userId,
    content: body.content || '',
    tone: body.tone || 'Professional',
    timestamp: Date.now(),
    pinned: Boolean(body.pinned),
  };

  const ok = await saveDraft(userId, draft);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }

  return NextResponse.json({ draft });
}
