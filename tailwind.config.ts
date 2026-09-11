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
          DEFAULT: '#1C8A56',
          hover: '#15683F',
        },
        contact: {
          DEFAULT: '#15803D',
          hover: '#166534',
        },
        accent: {
          DEFAULT: '#C97A2B',
          hover: '#B46B23',
        },
        surface: '#F7F6F3',
        border: '#E5E3DD',
        danger: {
          DEFAULT: '#C0392B',
          hover: '#A93226',
        },
        success: '#1C8A56',
        neutral: {
          text: '#1A1A1A',
          muted: '#6B6B6B',
        },
      },
      fontFamily: {
        display: ['var(--font-sora)', 'Sora', 'sans-serif'],
        heading: ['var(--font-sora)', 'Sora', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
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
