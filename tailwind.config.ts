import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1C8A56",
        "primary-hover": "#15683F",
        accent: "#C97A2B",
        background: "#FFFFFF",
        surface: "#F7F6F3",
        border: "#E5E3DD",
        text: "#1A1A1A",
        "text-muted": "#6B6B6B",
        "on-primary": "#FFFFFF",
        danger: "#C0392B",
        success: "#1C8A56",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        heading: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        display: ["40px", { lineHeight: "1.2", fontWeight: "700" }],
        heading: ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      spacing: {
        18: "72px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(26,26,26,0.06)",
        md: "0 4px 12px rgba(26,26,26,0.08)",
      },
      transitionDuration: {
        base: "200ms",
      },
      transitionTimingFunction: {
        base: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
