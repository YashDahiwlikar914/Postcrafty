'use client';

import { useState } from 'react';

interface HookSuggestionsProps {
  postContent: string;
}

export default function HookSuggestions({ postContent }: HookSuggestionsProps) {
  const [hooks, setHooks] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: postContent, tone: 'Professional', getSuggestions: true })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load suggestions');
      }
      
      const data = await response.json();
      console.log('[HookSuggestions] API response:', data);
      
      if (data.hooks) {
        console.log('[HookSuggestions] Hooks received:', data.hooks);
        setHooks(data.hooks);
      }
      if (data.hashtags) {
        console.log('[HookSuggestions] Hashtags received:', data.hashtags);
        setHashtags(data.hashtags);
      }
      
      // Fallback: if no hashtags, generate broadly useful hashtags
      if (!data.hashtags || data.hashtags.length === 0) {
        console.log('[HookSuggestions] No hashtags from AI, using fallback');
        const defaultHashtags = ['#xcreator', '#buildinpublic', '#creatoreconomy', '#contentstrategy', '#growth'];
        setHashtags(defaultHashtags);
      }
      
      if (!data.hooks && !data.error) {
        console.error('[HookSuggestions] No hooks in response');
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!expanded && hooks.length === 0) {
      loadSuggestions();
    }
    setExpanded(!expanded);
    if (!expanded) setError(null);
  };

  return (
    <div className="glass-card p-6">
      <button 
        onClick={handleToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-panel/70 border border-border/40 flex items-center justify-center">
            <svg className="w-5 h-5 text-frost" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="font-semibold">Hook & Hashtag Suggestions</span>
            <p className="text-sm text-muted">AI-powered optimization</p>
          </div>
        </div>
        <span className="text-muted transition-transform duration-200">{expanded ? '▼' : '▶'}</span>
      </button>
      
      {expanded && (
        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-signal mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-muted">Loading suggestions... (30-60 seconds)</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-forest/30 border border-border flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-mint mb-3">{error}</p>
              <button 
                onClick={loadSuggestions}
                className="px-4 py-2 bg-panel/50 hover:bg-panel rounded-lg text-sm text-muted hover:text-frost transition-all"
              >
                Try again
              </button>
            </div>
          ) : hooks.length === 0 && hashtags.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted">No suggestions loaded</p>
              <button 
                onClick={loadSuggestions}
                className="mt-2 px-4 py-2 bg-panel/50 hover:bg-panel rounded-lg text-sm text-muted hover:text-frost transition-all"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {hooks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium heading-text mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Alternative Hooks
                  </h4>
                  <div className="space-y-2">
                    {hooks.map((hook, index) => (
                      <button
                        key={index}
                        onClick={() => navigator.clipboard.writeText(hook)}
                        className="w-full text-left px-4 py-3 bg-panel/50 hover:bg-panel rounded-xl text-sm transition-all group"
                      >
                        <span className="text-muted group-hover:text-frost">{hook}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {hashtags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium heading-text mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => navigator.clipboard.writeText(tag)}
                        className="px-4 py-2 bg-surface/40 text-signal rounded-xl hover:bg-surface/60 text-sm font-medium transition-all border border-border/30"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {hooks.length === 0 && hashtags.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted">No suggestions loaded</p>
                  <button 
                    onClick={loadSuggestions}
                    className="mt-2 px-4 py-2 bg-panel/50 hover:bg-panel rounded-lg text-sm text-muted hover:text-frost transition-all"
                  >
                    Try again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
