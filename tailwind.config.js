/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* legacy names (used by Portfolio, Ranking, TradeModal, etc.) */
        'bg-primary':    'var(--bg)',
        'bg-card':       'var(--surface)',
        'bg-card2':      'var(--raised)',
        'border-color':  'var(--line)',
        'accent':        'var(--blue)',
        'accent-hover':  'var(--blue-hover)',
        'gain':          'var(--up)',
        'loss':          'var(--down)',
        'text-primary':  'var(--t1)',
        'text-secondary':'var(--t2)',
        'text-muted':    'var(--t3)',
        /* new short names */
        'bg':      'var(--bg)',
        'surface': 'var(--surface)',
        'raised':  'var(--raised)',
        'line':    'var(--line)',
        'blue':    'var(--blue)',
        'up':      'var(--up)',
        'down':    'var(--down)',
        't1':      'var(--t1)',
        't2':      'var(--t2)',
        't3':      'var(--t3)',
      },
      fontFamily: {
        sans: ['"Pretendard"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
