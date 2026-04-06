'use client';

import { useState, useEffect } from 'react';

const HISTORY_STORAGE_KEY = 'postcraft_history';
const LEGACY_DRAFTS_STORAGE_KEY = 'postcraft_drafts';

interface HistoryItem {
  id: string;
  content: string;
  tone: string;
  timestamp: number;
  pinned: boolean;
}

function readCachedHistory(): HistoryItem[] {
  const cached = localStorage.getItem(HISTORY_STORAGE_KEY) || localStorage.getItem(LEGACY_DRAFTS_STORAGE_KEY);
  if (!cached) {
    return [];
  }

  try {
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    localStorage.removeItem(LEGACY_DRAFTS_STORAGE_KEY);
    return [];
  }
}

function writeCachedHistory(items: HistoryItem[]) {
  const serialized = JSON.stringify(items);
  localStorage.setItem(HISTORY_STORAGE_KEY, serialized);
  localStorage.setItem(LEGACY_DRAFTS_STORAGE_KEY, serialized);
}

export default function DraftsPageClient() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const cachedHistory = readCachedHistory();
      if (cachedHistory.length > 0) {
        setHistory(cachedHistory);
      }

      try {
        const response = await fetch('/api/drafts');
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          setError(body.error || 'Unable to load history right now.');
          return;
        }

        const data = await response.json();
        const nextHistory = data.drafts || [];
        setHistory(nextHistory);
        writeCachedHistory(nextHistory);
      } catch {
        setError('Unable to load history right now.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const togglePin = async (id: string) => {
    setError('');
    const previous = history;
    const updated = history.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item));
    setHistory(updated);
    writeCachedHistory(updated);

    const target = updated.find((item) => item.id === id);
    if (!target) {
      return;
    }

    try {
      const response = await fetch(`/api/drafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: target.pinned }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update history item.');
      }
    } catch (err) {
      setHistory(previous);
      writeCachedHistory(previous);
      setError(err instanceof Error ? err.message : 'Failed to update history item.');
    }
  };

  const deleteDraft = async (id: string) => {
    setError('');
    const previous = history;
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    writeCachedHistory(updated);

    try {
      const response = await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to delete history item.');
      }
    } catch (err) {
      setHistory(previous);
      writeCachedHistory(previous);
      setError(err instanceof Error ? err.message : 'Failed to delete history item.');
    }
  };

  const pinned = history.filter((item) => item.pinned);
  const recent = history.filter((item) => !item.pinned);

  return (
    <div className="p-2 lg:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-panel/70 border border-border/40 flex items-center justify-center">
            <svg className="w-7 h-7 text-frost" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-medium gradient-text">History</h1>
            <p className="text-muted">Review your saved posts</p>
          </div>
        </div>

        {error && (
          <div className="glass-card p-4 mb-6 border border-border/70">
            <p className="text-sm text-mint">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {pinned.length > 0 && (
            <div>
              <h2 className="text-xl font-medium heading-text mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-mint" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Pinned
              </h2>
              <div className="grid gap-4">
                {pinned.map((draft) => (
                  <DraftCard key={draft.id} draft={draft} onPin={() => togglePin(draft.id)} onDelete={() => deleteDraft(draft.id)} />
                ))}
              </div>
            </div>
          )}

          <div>
              <h2 className="text-xl font-medium heading-text mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent
              </h2>
              <div className="grid gap-4">
              {recent.map((item) => (
                <DraftCard key={item.id} draft={item} onPin={() => togglePin(item.id)} onDelete={() => deleteDraft(item.id)} />
              ))}
              </div>
            </div>

          {loading && history.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-muted">Loading history...</p>
            </div>
          )}

          {!loading && history.length === 0 && (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-panel/50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium heading-text mb-2">No history yet</h3>
              <p className="text-muted">Generate your first post to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DraftCard({ draft, onPin, onDelete }: { draft: HistoryItem; onPin: () => void; onDelete: () => void }) {
  return (
    <div className="glass-card p-6 hover:border-border/50 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-muted line-clamp-3 mb-3">{draft.content}</p>
          <div className="flex items-center gap-3 text-sm text-muted/70">
            <span>{new Date(draft.timestamp).toLocaleDateString()}</span>
            <span>·</span>
            <span className="px-2 py-1 bg-panel/50 rounded-full text-xs">{draft.tone}</span>
          </div>
        </div>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onPin} className="p-2 rounded-lg hover:bg-panel text-mint transition-colors">
            {draft.pinned ? '★' : '☆'}
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-panel text-mint/70 transition-colors">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
