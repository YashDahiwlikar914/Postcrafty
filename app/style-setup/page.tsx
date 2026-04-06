'use client';

import { useState } from 'react';

export default function StyleSetupPage() {
  const [samplePosts, setSamplePosts] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const posts = samplePosts
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const totalChars = posts.join(' ').length;
  const canAnalyze = posts.length >= 5 && totalChars >= 280;

  const handleAnalyze = async () => {
    if (!samplePosts.trim()) return;
    
    setAnalyzing(true);
    setSaved(false);
    try {
      const response = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samplePosts })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze style');
      }
      
      const data = await response.json();
      if (!data.profile || typeof data.profile !== 'string') {
        throw new Error('Style analysis returned an invalid response. Please try again.');
      }
      setSaved(true);
    } catch (error) {
      console.error('Error analyzing style:', error);
      alert(error instanceof Error ? error.message : 'Error analyzing style. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-2 lg:p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-panel/70 border border-border/40 flex items-center justify-center">
              <svg className="w-7 h-7 text-frost" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-medium gradient-text">Style Setup</h1>
              <p className="text-muted">Train the AI to write in your unique voice</p>
            </div>
          </div>
          
          <p className="text-muted text-lg leading-relaxed">
            Paste 5-10 of your past X posts to create a style profile. 
            The AI will analyze your writing patterns and use them to generate content that sounds like you.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card p-8">
            <label className="block mb-4 font-medium text-muted text-lg">Sample Posts</label>
            <textarea
              value={samplePosts}
              onChange={(e) => setSamplePosts(e.target.value)}
              placeholder="Paste your sample posts here, one per line..."
              className="w-full h-64 px-5 py-4 glass-input text-frost placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-signal/50 focus:border-signal/50 transition-all resize-none"
            />
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted/70">
                {posts.length} posts · {totalChars} chars
              </span>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !canAnalyze}
                className="px-8 py-4 glass-button rounded-xl font-semibold text-void shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing... (this may take 30-60 seconds)
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Analyze Style
                  </>
                )}
              </button>
            </div>
            {!canAnalyze && (
              <p className="mt-3 text-xs text-muted">
                Add at least 5 posts (around 280+ total characters) for accurate style analysis.
              </p>
            )}
          </div>
          
          {saved && (
            <div className="glass-card p-6 border-l-4 border-l-emerald">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-forest/40 border border-border flex items-center justify-center">
                  <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-mint">Style profile saved!</p>
                  <p className="text-sm text-muted">Your writing style is now being used for all generated posts.</p>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
