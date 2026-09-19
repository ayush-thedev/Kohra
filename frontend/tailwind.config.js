/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "var(--brand-500)",
          600: "var(--brand-600)", // Kohler Foundations Brand Swatch
          700: "var(--brand-700)"
        },
        surface: {
          muted: "var(--surface-muted)",
          subtle: "var(--surface-subtle)",
          low: "var(--surface-low-contrast)",
          med: "var(--surface-medium-contrast)",
          high: "var(--surface-high-contrast)",
          brand: "var(--surface-brand)",
          bg: "var(--illustration-background)",
          black: "#0e1012",
          primary: "var(--surface-muted)",
          secondary: "var(--surface-subtle)",
          tertiary: "var(--primary-700)"
        },
        kohler: {
          gray100: "var(--gray-100)",
          gray200: "var(--gray-200)",
          gray300: "var(--gray-300)",
          gray400: "var(--gray-400)",
          gray500: "var(--gray-500)",
          primary100: "var(--primary-100)",
          primary700: "var(--primary-700)",
          primary800: "var(--primary-800)",
          primary900: "var(--primary-900)"
        },
        border: {
          low: "var(--primary-700)",
          medium: "var(--gray-500)",
          high: "var(--gray-300)",
          brand: "var(--brand-600)"
        },
        content: {
          primary: "#ffffff",
          secondary: "var(--gray-300)",
          tertiary: "var(--gray-500)",
          brand: "var(--brand-600)"
        },
        alert: {
          error: "var(--alert-error)",
          success: "var(--alert-success)",
          warning: "var(--alert-warning)"
        }
      },
      fontFamily: {
        primary: ["'Space Grotesk'", "Inter", "-apple-system", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "-apple-system", "sans-serif"],
        sans: ["'Inter'", "-apple-system", "sans-serif"],
        inter: ["'Inter'", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      fontWeight: {
        heading: "300",
        light: "300"
      },
      boxShadow: {
        brand: "0 0 20px -2px rgba(234, 56, 41, 0.35)",
        brandSm: "0 0 10px 0px rgba(234, 56, 41, 0.25)",
        card: "0 8px 30px rgba(0, 0, 0, 0.6)"
      }
    }
  },
  plugins: []
};
