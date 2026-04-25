/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Axel palette — finalized in UX-03 (axel character bible).
        // Mint-aqua scale for the body, coral accents for gills/heart.
        // Names locked at Phase 0 to avoid screen churn; values locked here.
        axel: {
          50: '#F0FBF8',
          100: '#DAF3EC',
          200: '#BFE9DD',
          300: '#A8E0D5', // body mint (primary character fill)
          400: '#7CCEC0',
          500: '#5BBFAE', // body shade (tail back, body shadow stripe)
          600: '#3FA194', // UI primary (high-contrast button alt)
          700: '#2A7E72',
          800: '#1A5E55',
          900: '#0F4A40',
        },
        // Design-token aliases. Names kept stable since Phase 0 — values
        // updated to the final Axel palette in UX-03 (see
        // design/axel-character-bible.md §3 for the full audit).
        // Note: `axel-pink` and `axel-rose` are visually CORAL hues; the
        // names persist for backward-compat with screens that already
        // import them.
        'axel-pink': '#FFB5A0', // gill coral — gills, heart medallion, cheek blush
        'axel-cream': '#FFF7EE', // background — page bg, belly fill, ribbon fill
        'axel-rose': '#F08070', // coral deep — selected tiles, primary CTA fill
        ink: '#3D2B3D', // text & strokes (unchanged)
        sparkle: '#FFD966', // celebration (unchanged)
      },
      fontFamily: {
        // System stack for now; web fonts deferred to a future ticket.
        display: ['ui-rounded', 'system-ui', 'sans-serif'],
        body: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
