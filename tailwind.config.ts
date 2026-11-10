import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        ndot: ['"NDot 55"', 'monospace', 'sans-serif'],
        young: ['"Young Serif"', 'serif'],
        ntype: ['"NType 82"', 'sans-serif'],
        ntypeHead: ['"NType 82 Headline"', 'sans-serif'],
        geist: ['"Geist"', 'sans-serif'],
        mono: ['"Geist Mono"', '"NType 82 Mono"', 'monospace'],
      },
      colors: {
        void: {
          DEFAULT: '#050507',
          950: '#09090c',
          900: '#111116',
          850: '#17171e',
          800: '#20202a',
          700: '#2f2f3d',
          600: '#48485a',
          muted: '#808092',
          light: '#f4f4f7',
        },
        nothing: {
          red: '#d71921',
          'red-bright': '#ff2a35',
          'red-glow': 'rgba(215, 25, 33, 0.35)',
        },
        caelestia: {
          cyan: '#00f2fe',
          violet: '#a855f7',
          magenta: '#f43f5e',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
      },
      borderRadius: {
        'squircle-sm': '14px',
        'squircle': '22px',
        'squircle-lg': '28px',
        'squircle-xl': '36px',
      },
      boxShadow: {
        'glow-red': '0 0 25px rgba(215, 25, 33, 0.25)',
        'glow-cyan': '0 0 25px rgba(0, 242, 254, 0.25)',
        'glow-violet': '0 0 25px rgba(168, 85, 247, 0.25)',
        'squircle-card': '0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

