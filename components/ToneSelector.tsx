'use client';

interface ToneSelectorProps {
  tone: string;
  onToneChange: (tone: string) => void;
}

const tones = [
  { name: 'Professional', icon: '🎯' },
  { name: 'Casual', icon: '💬' },
  { name: 'Edgy', icon: '⚡' }
];

export default function ToneSelector({ tone, onToneChange }: ToneSelectorProps) {
  return (
    <div>
      <label className="block mb-3 font-medium text-muted">Tone</label>
      <div className="flex space-x-3">
        {tones.map((t) => (
          <button
            key={t.name}
            onClick={() => onToneChange(t.name)}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
              tone === t.name 
                ? 'bg-panel/80 border border-border/40 text-frost shadow-lg' 
                : 'bg-panel/50 text-muted hover:bg-panel hover:text-frost'
            }`}
          >
            <span className="mr-2">{t.icon}</span>
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
