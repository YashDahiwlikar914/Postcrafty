/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: 'rgb(var(--color-void-rgb) / <alpha-value>)',
        forest: 'rgb(var(--color-forest-rgb) / <alpha-value>)',
        emerald: 'rgb(var(--color-emerald-rgb) / <alpha-value>)',
        mint: 'rgb(var(--color-mint-rgb) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        border: 'rgb(var(--color-border-rgb) / <alpha-value>)',
        muted: 'rgb(var(--color-muted-rgb) / <alpha-value>)',
        text: 'rgb(var(--color-text-rgb) / <alpha-value>)',
        signal: 'rgb(var(--color-emerald-rgb) / <alpha-value>)',
        'signal-dim': 'rgb(var(--color-forest-rgb) / <alpha-value>)',
        panel: 'rgb(var(--color-forest-rgb) / <alpha-value>)',
        frost: 'rgb(var(--color-text-rgb) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
