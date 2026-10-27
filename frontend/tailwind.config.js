/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Application Tokens (Controlled by CSS variables)
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          tint: 'var(--surface-tint)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        text: {
          DEFAULT: 'var(--text)',
          2: 'var(--text-2)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          subtle: 'var(--subtle)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          deep: 'var(--primary-deep)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
        },

        // Official KAPEE Brand Emerald Scale
        'emerald-deep': '#04403B',
        'emerald': {
          DEFAULT: '#0A5C55',
          soft: '#EAF4F2',
          light: '#3D968A',
          dark: '#04403B',
          50: '#EAF4F2',
          100: '#CFE6E2',
          200: '#A0CDC5',
          300: '#6FB2A7',
          400: '#3D968A',
          500: '#0F7A6F',
          600: '#0A5C55',
          700: '#074B45',
          800: '#04403B',
          900: '#032E2A',
          950: '#021F1C',
        },

        // Official KAPEE Brand Gold Scale
        'gold': {
          DEFAULT: '#C8962E',
          light: '#EBCB6B',
          dark: '#8F6414',
          50: '#FDF8E8',
          100: '#F8EBC0',
          200: '#F1DB93',
          300: '#EBCB6B',
          400: '#DDB04A',
          500: '#C8962E',
          600: '#A87820',
          700: '#8F6414',
          800: '#6B4A0E',
          900: '#4A3309',
        },

        // Brand Base Hues
        'ivory': '#FBF8F1',
        'cream': '#F4EEDF',
        'ink': '#0E1F1D',

        // Semantic Colors
        'success': {
          DEFAULT: '#1E8E5A',
          soft: 'var(--semantic-success-bg)',
          border: 'var(--semantic-success-border)',
          text: 'var(--semantic-success-text)',
        },
        'warning': {
          DEFAULT: '#D98E04',
          soft: 'var(--semantic-warning-bg)',
          border: 'var(--semantic-warning-border)',
          text: 'var(--semantic-warning-text)',
        },
        'error': {
          DEFAULT: '#C0392B',
          soft: 'var(--semantic-error-bg)',
          border: 'var(--semantic-error-border)',
          text: 'var(--semantic-error-text)',
        },
        'info': {
          DEFAULT: '#2563EB',
          soft: 'var(--semantic-info-bg)',
          border: 'var(--semantic-info-border)',
          text: 'var(--semantic-info-text)',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'var(--gradient-gold)',
        'gold-gradient-hover': 'var(--gradient-gold-hover)',
        'emerald-gradient': 'var(--gradient-emerald)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'glow-gold': 'var(--shadow-glow-gold)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'shine': 'shine 2.5s infinite linear',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'whatsapp-pulse': 'whatsappPulse 2s infinite ease-in-out',
        'reviews-scroll': 'reviewsScroll 45s linear infinite',
      },
      keyframes: {
        // The review list is rendered twice, so moving by half its width loops seamlessly
        // (the extra 0.75rem is half the gap between the two copies)
        reviewsScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-50% - 0.75rem))' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        whatsappPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.7)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 0 16px rgba(37, 211, 102, 0)', transform: 'scale(1.05)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)', transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
