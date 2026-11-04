/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "rgb(var(--nh-canvas) / <alpha-value>)",
          soft: "rgb(var(--nh-canvas-soft) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--nh-surface) / <alpha-value>)",
          raised: "rgb(var(--nh-surface-raised) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--nh-ink) / <alpha-value>)",
          muted: "rgb(var(--nh-ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--nh-ink-subtle) / <alpha-value>)",
          invert: "rgb(var(--nh-ink-invert) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--nh-line) / <alpha-value>)",
          strong: "rgb(var(--nh-line-strong) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--nh-brand) / <alpha-value>)",
          hover: "rgb(var(--nh-brand-hover) / <alpha-value>)",
          soft: "rgb(var(--nh-brand-soft) / <alpha-value>)",
          fg: "rgb(var(--nh-brand-fg) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--nh-accent) / <alpha-value>)",
          soft: "rgb(var(--nh-accent-soft) / <alpha-value>)",
        },
        success: "rgb(var(--nh-success) / <alpha-value>)",
        warning: "rgb(var(--nh-warning) / <alpha-value>)",
        danger: "rgb(var(--nh-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        nh: "0.75rem",
        "nh-lg": "1rem",
        "nh-xl": "1.25rem",
      },
      boxShadow: {
        nh: "0 1px 2px rgb(0 0 0 / 0.24), 0 8px 24px rgb(0 0 0 / 0.28)",
        "nh-soft": "0 10px 28px rgb(34 43 59 / 0.055), 0 1px 3px rgb(34 43 59 / 0.045)",
        "nh-glow": "0 0 0 1px rgb(var(--nh-brand) / 0.25), 0 12px 40px rgb(var(--nh-brand) / 0.15)",
      },
      maxWidth: {
        content: "72rem",
      },
      backgroundImage: {
        "nh-grid":
          "linear-gradient(to right, rgb(var(--nh-line) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--nh-line) / 0.35) 1px, transparent 1px)",
        "nh-radial":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--nh-brand) / 0.22), transparent)",
      },
      backgroundSize: {
        "nh-grid": "48px 48px",
      },
    },
  },
  plugins: [],
};
