'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-card w-full max-w-md p-8 text-center">
        <h1 className="text-3xl font-medium gradient-text mb-3">Postcraft</h1>
        <p className="text-muted mb-8">Generate X posts in your authentic voice.</p>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full px-6 py-3 rounded-xl bg-signal text-void font-semibold hover:opacity-90 transition-opacity"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
