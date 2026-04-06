'use client';

import { useState } from 'react';

interface ThreadViewProps {
  thread: string;
}

export default function ThreadView({ thread }: ThreadViewProps) {
  const tweets = thread.split(/---+/).map(t => t.trim()).filter(t => t);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleCopy = async (tweet: string, index: number) => {
    await navigator.clipboard.writeText(tweet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    // Note: In a real implementation, you'd update the parent state here
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-panel/70 border border-border/40 flex items-center justify-center text-frost font-bold">
          {tweets.length}
        </div>
        <div>
          <h3 className="text-xl font-medium heading-text">Thread</h3>
          <p className="text-sm text-muted">{tweets.length} tweets</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {tweets.map((tweet, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`glass-card p-6 relative transition-all cursor-move ${
              draggedIndex === index ? 'opacity-50 scale-95' : 'hover:border-signal/50'
            }`}
          >
            <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-panel/80 border border-border/40 flex items-center justify-center text-frost text-xs font-bold">
              {index + 1}
            </div>
            
            <div className="flex items-center justify-between mb-4 ml-4">
              <span className="text-sm font-medium text-muted">Tweet {index + 1}</span>
              <button
                onClick={() => handleCopy(tweet, index)}
                className="flex items-center gap-2 px-4 py-2 bg-panel/50 hover:bg-panel rounded-lg text-sm font-medium transition-all"
              >
                {copiedIndex === index ? (
                  <>
                    <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <p className="whitespace-pre-wrap text-frost leading-relaxed ml-4">{tweet}</p>
            
            <div className="flex items-center gap-2 mt-4 ml-4">
              <span className={`text-sm font-medium ${tweet.length > 280 ? 'text-mint' : 'text-muted/70'}`}>
                {tweet.length}/280
              </span>
              {tweet.length > 280 && (
                <span className="text-xs bg-forest/30 text-mint px-2 py-1 rounded-full border border-border">
                  Over limit
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
