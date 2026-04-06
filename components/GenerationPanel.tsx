'use client';

import { useState } from 'react';
import ToneSelector from './ToneSelector';
import HookSuggestions from './HookSuggestions';
import ThreadView from './ThreadView';
import OutputCard from './OutputCard';
import TopicSuggestions from './TopicSuggestions';

const HISTORY_STORAGE_KEY = 'postcraft_history';
const LEGACY_DRAFTS_STORAGE_KEY = 'postcraft_drafts';

export default function GenerationPanel() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [mode, setMode] = useState('single');
  const [inputMode, setInputMode] = useState('prompted');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const saveDraft = async (content: string) => {
    const response = await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tone, pinned: false }),
    });

    if (!response.ok) return;

    const data = await response.json();
    let drafts: Array<{ id: string; content: string; tone: string; timestamp: number; pinned: boolean }> = [];

    try {
      const cached = localStorage.getItem(HISTORY_STORAGE_KEY) || localStorage.getItem(LEGACY_DRAFTS_STORAGE_KEY) || '[]';
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        drafts = parsed;
      }
    } catch {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      localStorage.removeItem(LEGACY_DRAFTS_STORAGE_KEY);
    }

    drafts.unshift(data.draft);
    const serialized = JSON.stringify(drafts.slice(0, 100));
    localStorage.setItem(HISTORY_STORAGE_KEY, serialized);
    localStorage.setItem(LEGACY_DRAFTS_STORAGE_KEY, serialized);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, mode })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate post');
      }
      
      const data = await response.json();
      const generatedContent = data.post || data.error;
      setOutput(generatedContent);
      
      // Auto-save to localStorage
      if (generatedContent && !data.error) {
        await saveDraft(generatedContent);
      }
    } catch (error) {
      console.error('Error generating post:', error);
      setOutput(error instanceof Error ? error.message : 'Error generating post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTopic = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setInputMode('prompted');
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-medium heading-text mb-1">Generate Post</h2>
            <p className="text-sm text-muted">Create content in your unique voice</p>
          </div>
          <div className="flex space-x-2 bg-panel/50 p-1 rounded-xl">
            <button 
              onClick={() => setMode('single')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'single' 
                  ? 'bg-signal text-void shadow-lg shadow-signal/25' 
                  : 'text-muted hover:text-frost'
              }`}
            >
              Single
            </button>
            <button 
              onClick={() => setMode('thread')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'thread' 
                  ? 'bg-signal text-void shadow-lg shadow-signal/25' 
                  : 'text-muted hover:text-frost'
              }`}
            >
              Thread
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <label className="font-medium text-muted">Input Mode</label>
            <div className="flex space-x-2 bg-panel/50 p-1 rounded-lg">
              <button 
                onClick={() => setInputMode('prompted')}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                  inputMode === 'prompted' 
                    ? 'bg-signal text-void' 
                    : 'text-muted hover:text-frost'
                }`}
              >
                Prompted
              </button>
              <button 
                onClick={() => setInputMode('suggested')}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                  inputMode === 'suggested' 
                    ? 'bg-signal text-void' 
                    : 'text-muted hover:text-frost'
                }`}
              >
                Suggested Topics
              </button>
            </div>
          </div>
          
          {inputMode === 'prompted' ? (
            <div>
              <label className="block mb-3 font-medium text-muted">Topic or Angle</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your topic, niche angle, or opinion..."
                className="w-full px-5 py-4 glass-input text-frost placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-signal/50 focus:border-signal/50 transition-all"
              />
            </div>
          ) : (
            <TopicSuggestions onSelectTopic={handleSelectTopic} />
          )}
        </div>
        
        <div className="mb-6">
          <ToneSelector tone={tone} onToneChange={setTone} />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full px-8 py-4 glass-button rounded-xl font-semibold text-void shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating... (this may take 30-60 seconds)
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Post
            </>
          )}
        </button>
      </div>
      
      {output && (
        <>
          {mode === 'thread' ? <ThreadView thread={output} /> : <OutputCard post={output} />}
          <HookSuggestions postContent={output} />
        </>
      )}
      
      {!output && !isGenerating && (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-panel/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium heading-text mb-2">Ready to create content</h3>
          <p className="text-muted">Enter a topic or select suggested topics to get started</p>
        </div>
      )}
    </div>
  );
}
