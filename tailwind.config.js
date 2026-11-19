/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Arial', 'Helvetica', 'sans-serif'],
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        marble: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          subtle: '#F0F7FF',
          border: '#E2E8F0',
          ink: '#0F172A',
          muted: '#475569',
          terracotta: '#0284C7',
          terracottaLight: '#E0F2FE',
          cobalt: '#2563EB',
          cobaltLight: '#EFF6FF',
          brass: '#0369A1',
          brassLight: '#E0F2FE',
          skySoft: '#38BDF8',
        },
      },
    },
  },
};
