import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        // ── AWS Dark Theme Base ───────────────────────
        'aws-squid-ink':    '#232F3E',   // main background (replaces eerie-black)
        'aws-dark-slate':   '#0F1B2A',   // sidebar, nav (replaces onyx)
        'aws-lighter-slate':'#1C2533',   // cards, inputs, secondary surfaces (replaces jet)
        // ── Accent ────────────────────────────────────
        'aws-orange':       '#FF9900',   // primary buttons, active states, focus, links
        // ── AWS 3D Accent Colors ──────────────────────
        'aws-magenta':      '#FF007A',
        'aws-yellow':       '#FFC800',
        'aws-lime':         '#14B8A6',
        'aws-cyan':         '#00BFFF',
        // ── Legacy aliases (backward compat) ──────────
        'eerie-black':      '#232F3E',
        'onyx':             '#0F1B2A',
        'jet':              '#1C2533',
        'orange-yellow':    '#FF9900',
      },
      backgroundImage: {
        'gradient-onyx':  'linear-gradient(to bottom right, #0F1B2A, #1C2533)',
        'gradient-jet':   'linear-gradient(to bottom right, #1C2533, #232F3E)',
        // ── AWS 3D Accent Gradients ───────────────────
        'gradient-aws-3d':     'linear-gradient(135deg, #FF007A, #FFC800, #14B8A6, #00BFFF)',
        'gradient-aws-warm':   'linear-gradient(135deg, #FF007A, #FFC800)',
        'gradient-aws-cool':   'linear-gradient(135deg, #14B8A6, #00BFFF)',
        'gradient-aws-hero':   'linear-gradient(180deg, #232F3E 0%, #1C2533 50%, #0F1B2A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config