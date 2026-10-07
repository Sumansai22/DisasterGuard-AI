/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          low: '#10b981',       // Emerald/Green
          moderate: '#eab308',  // Yellow
          elevated: '#f97316',  // Orange-Amber
          high: '#ea580c',      // Orange
          critical: '#ef4444',  // Red
        },
        gov: {
          navy: '#0f172a',
          blue: '#1e3a8a',
          darkBlue: '#172554',
          accent: '#2563eb',
          slate: '#334155',
          light: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans',
          'Noto Sans Telugu',
          'Noto Sans Devanagari',
          'Noto Sans Tamil',
          'Noto Sans Malayalam',
          'Noto Sans Kannada',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'gov': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'gov-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'gov-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
