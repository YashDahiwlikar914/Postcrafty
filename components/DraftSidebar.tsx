'use client';

import { useState, useEffect } from 'react';

interface Draft {
  id: string;
  content: string;
  tone: string;
  timestamp: number;
  pinned: boolean;
}

export default function DraftSidebar() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const loadDrafts = async () => {
      const cached = localStorage.getItem('postcraft_drafts');
      if (cached) {
        setDrafts(JSON.parse(cached));
      }

      const response = await fetch('/api/drafts');
      if (!response.ok) return;
      const data = await response.json();
      setDrafts(data.drafts || []);
      localStorage.setItem('postcraft_drafts', JSON.stringify(data.drafts || []));
    };

    loadDrafts();
  }, []);

  const pinned = drafts.filter(d => d.pinned);
  const recent = drafts.filter(d => !d.pinned).slice(0, 10);

  const togglePin = async (id: string) => {
    const updated = drafts.map(d => 
      d.id === id ? { ...d, pinned: !d.pinned } : d
    );
    setDrafts(updated);
    localStorage.setItem('postcraft_drafts', JSON.stringify(updated));

    const draft = updated.find((d) => d.id === id);
    if (!draft) return;
    await fetch(`/api/drafts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: draft.pinned }),
    });
  };

  const deleteDraft = async (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('postcraft_drafts', JSON.stringify(updated));
    await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-panel/70 border border-border/40 flex items-center justify-center">
          <svg className="w-5 h-5 text-frost" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-medium heading-text">Drafts</h2>
          <p className="text-sm text-muted">{drafts.length} saved</p>
        </div>
      </div>
      
      {pinned.length > 0 && (
        <div>
          <h3 className="text-sm font-medium heading-text mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-mint" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Pinned
          </h3>
          <div className="space-y-3">
            {pinned.map(draft => (
              <DraftCard 
                key={draft.id} 
                draft={draft} 
                onPin={() => togglePin(draft.id)}
                onDelete={() => deleteDraft(draft.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium heading-text mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent
        </h3>
        {recent.length > 0 ? (
          <div className="space-y-3">
            {recent.map(draft => (
              <DraftCard 
                key={draft.id} 
                draft={draft} 
                onPin={() => togglePin(draft.id)}
                onDelete={() => deleteDraft(draft.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-panel/50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm text-muted">No drafts yet</p>
            <p className="text-xs text-muted/70">Generate your first post</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DraftCard({ draft, onPin, onDelete }: { 
  draft: Draft; 
  onPin: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="glass-card p-4 hover:border-border/50 cursor-pointer transition-all group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <p className="text-sm text-muted line-clamp-2 mb-3">{draft.content}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted/70">
          {new Date(draft.timestamp).toLocaleDateString()} · {draft.tone}
        </span>
        {showActions && (
          <div className="flex space-x-2">
            <button 
              onClick={onPin} 
              className="text-mint hover:text-frost text-sm transition-colors"
            >
              {draft.pinned ? '★' : '☆'}
            </button>
            <button 
              onClick={onDelete} 
              className="text-mint/70 hover:text-mint text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
