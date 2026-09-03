/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // High-Visibility Institutional Theme Tokens
        forensic: {
          bg: "var(--forensic-bg)",
          surface: "var(--forensic-surface)",
          surfaceRaised: "var(--forensic-surface-raised)",
          border: "var(--forensic-border)",
          borderMuted: "var(--forensic-border-muted)",
          text: "var(--forensic-text)",
          textMuted: "var(--forensic-text-muted)",
          textDim: "var(--forensic-text-dim)",
          accent: "var(--forensic-accent)",
          teal: "var(--forensic-teal)",
          amber: "var(--forensic-amber)",
          rose: "var(--forensic-rose)",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
    },
  },
  plugins: [],
};
