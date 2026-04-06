'use client';

import { useState } from 'react';

interface OutputCardProps {
  post: string;
}

export default function OutputCard({ post }: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const charCount = post.length;
  const isOverLimit = charCount > 280;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isOverLimit ? 'text-mint' : 'text-muted'}`}>
            {charCount}/280
          </span>
          {isOverLimit && (
            <span className="text-xs bg-forest/30 text-mint px-2 py-1 rounded-full border border-border">
              Over limit
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-panel/50 hover:bg-panel rounded-lg text-sm font-medium transition-all"
        >
          {copied ? (
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
      <p className="whitespace-pre-wrap text-frost leading-relaxed">{post}</p>
    </div>
  );
}
