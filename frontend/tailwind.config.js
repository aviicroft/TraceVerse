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
<<<<<<< Updated upstream
        // High-Visibility Institutional Theme Tokens
=======
        bg: {
          DEFAULT: "var(--bg)",
          subtle: "var(--bg-subtle)",
          canvas: "var(--bg-canvas)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          elevated: "var(--surface-elevated)",
          hover: "var(--surface-hover)",
          overlay: "var(--surface-overlay)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
          hover: "var(--border-hover)",
          bright: "var(--border-bright)",
        },
        text: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
          inverse: "var(--text-inverse)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
          border: "var(--accent-border)",
        },
        verified: {
          DEFAULT: "var(--verified)",
          hover: "var(--verified-hover)",
          subtle: "var(--verified-subtle)",
          border: "var(--verified-border)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle: "var(--warning-subtle)",
          border: "var(--warning-border)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          hover: "var(--danger-hover)",
          subtle: "var(--danger-subtle)",
          border: "var(--danger-border)",
        },
        info: {
          DEFAULT: "var(--info)",
          subtle: "var(--info-subtle)",
          border: "var(--info-border)",
        },
        input: {
          DEFAULT: "var(--input)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        // Forensic Tokens (backward compatibility)
>>>>>>> Stashed changes
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
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
<<<<<<< Updated upstream
        '2xs': '0.65rem',
=======
        'display': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'page-title': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'section-title': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'card-title': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.25rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
        'technical': ['0.8125rem', { lineHeight: '1.125rem' }],
        '2xs': '0.6875rem',
      },
      borderRadius: {
        'btn': '8px',
        'card': '12px',
        'container': '16px',
      },
      boxShadow: {
        'panel': '0 1px 3px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border)',
        'panel-raised': '0 4px 12px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--border)',
        'panel-elevated': '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border)',
        'vercel': '0 0 0 1px var(--border), 0 2px 4px rgba(0,0,0,0.04)',
        'vercel-lg': '0 0 0 1px var(--border), 0 8px 16px rgba(0,0,0,0.08)',
>>>>>>> Stashed changes
      },
    },
  },
  plugins: [],
};
