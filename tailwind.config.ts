import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
        },
        contact: {
          DEFAULT: '#15803D',
          hover: '#166534',
        },
        accent: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
        },
        surface: '#FFFFFF',
        border: '#E2E8F0',
        danger: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
        },
        success: '#16A34A',
        neutral: {
          text: '#0F172A',
          muted: '#64748B',
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
        heading: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
        body: ['var(--font-work-sans)', 'Work Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(26,26,26,0.06)',
        md: '0 4px 12px rgba(26,26,26,0.08)',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
