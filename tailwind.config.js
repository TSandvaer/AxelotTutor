/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Placeholder Axel palette — Kyle finalizes in UX-03 (axel character bible).
        axel: {
          50: '#fff5f8',
          100: '#ffe4ec',
          200: '#ffc9d9',
          300: '#ffa3bf',
          400: '#ff7aa6',
          500: '#f85a93',
          600: '#e63d7a',
          700: '#b82a5f',
          800: '#8a1f48',
          900: '#5c1530',
        },
        // Placeholder design tokens — Kyle replaces with Axel's palette in UX-03.
        // Names kept stable so screens that reference them don't churn between
        // Phase 0 (placeholder values) and UX-03 (final values).
        'axel-pink': '#FFC0CB',
        'axel-cream': '#FFF5F0',
        'axel-rose': '#F48FB1',
        ink: '#3D2B3D',
        sparkle: '#FFD966',
      },
      fontFamily: {
        // System stack for now; Kyle picks web fonts later
        display: ['ui-rounded', 'system-ui', 'sans-serif'],
        body: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
