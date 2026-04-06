import { NextRequest, NextResponse } from 'next/server';
import { deleteDraft, getDraft, isKvConfigured, saveDraft } from '@/lib/kv';
import { getSessionUserId } from '@/lib/server-auth';

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: Params) {
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

  const existing = await getDraft(userId, params.id);
  if (!existing) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const body = await request.json();
  const updated = {
    ...existing,
    content: body.content ?? existing.content,
    tone: body.tone ?? existing.tone,
    pinned: body.pinned ?? existing.pinned,
    timestamp: body.timestamp ?? existing.timestamp,
  };

  const ok = await saveDraft(userId, updated);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }

  return NextResponse.json({ draft: updated });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
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

  const ok = await deleteDraft(userId, params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
