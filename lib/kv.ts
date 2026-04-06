import { kv } from '@vercel/kv';

export function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export interface DraftRecord {
  id: string;
  userId: string;
  content: string;
  tone: string;
  timestamp: number;
  pinned: boolean;
}

function styleKey(userId: string) {
  return `style:${userId}`;
}

function draftsPrefix(userId: string) {
  return `drafts:${userId}:`;
}

function draftKey(userId: string, draftId: string) {
  return `${draftsPrefix(userId)}${draftId}`;
}

export async function getStyleProfile(userId: string): Promise<string | null> {
  if (!isKvConfigured()) {
    return null;
  }

  try {
    const profile = await kv.get<string>(styleKey(userId));
    return profile;
  } catch (error) {
    console.error('Error getting style profile from KV:', error);
    return null;
  }
}

export async function setStyleProfile(userId: string, profile: string): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  try {
    await kv.set(styleKey(userId), profile);
    return true;
  } catch (error) {
    console.error('Error setting style profile in KV:', error);
    return false;
  }
}

export async function deleteStyleProfile(userId: string): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  try {
    await kv.del(styleKey(userId));
    return true;
  } catch (error) {
    console.error('Error deleting style profile from KV:', error);
    return false;
  }
}

export async function listDrafts(userId: string): Promise<DraftRecord[]> {
  if (!isKvConfigured()) {
    return [];
  }

  try {
    const keys = await kv.keys(`${draftsPrefix(userId)}*`);
    if (!keys.length) return [];
    const values = await kv.mget<DraftRecord[]>(...keys);
    return values.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error listing drafts from KV:', error);
    return [];
  }
}

export async function saveDraft(userId: string, draft: DraftRecord): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  try {
    await kv.set(draftKey(userId, draft.id), draft);
    return true;
  } catch (error) {
    console.error('Error saving draft to KV:', error);
    return false;
  }
}

export async function deleteDraft(userId: string, draftId: string): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  try {
    await kv.del(draftKey(userId, draftId));
    return true;
  } catch (error) {
    console.error('Error deleting draft from KV:', error);
    return false;
  }
}

export async function getDraft(userId: string, draftId: string): Promise<DraftRecord | null> {
  if (!isKvConfigured()) {
    return null;
  }

  try {
    return await kv.get<DraftRecord>(draftKey(userId, draftId));
  } catch (error) {
    console.error('Error getting draft from KV:', error);
    return null;
  }
}
