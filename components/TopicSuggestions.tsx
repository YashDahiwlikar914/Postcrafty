'use client';

import { useState } from 'react';

interface TopicSuggestionsProps {
  onSelectTopic: (topic: string) => void;
}

export default function TopicSuggestions({ onSelectTopic }: TopicSuggestionsProps) {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.topics) setTopics(data.topics);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!expanded && topics.length === 0) {
      loadTopics();
    }
    setExpanded(!expanded);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4 4-4m0 0H5m8 0v8m0-8l8 8-4-4m-4 4" />
            </svg>
          </div>
          <div>
            <span className="font-semibold">Topic Suggestions</span>
            <p className="text-sm text-muted">AI-tailored to your writing profile</p>
          </div>
        </div>
        <span className="text-muted transition-transform duration-200">{expanded ? '▼' : '▶'}</span>
      </button>
      
      {expanded && (
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-signal" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="grid gap-3">
              {topics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => onSelectTopic(topic)}
                  className="text-left px-4 py-3 bg-panel/50 hover:bg-panel rounded-xl text-sm transition-all group border border-transparent hover:border-signal/30"
                >
                  <span className="text-muted group-hover:text-frost">{topic}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
