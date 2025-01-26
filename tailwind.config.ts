import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFFFF",
        foreground: "#1E293B",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F8FAFC",
          foreground: "#1E293B",
        },
        accent: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        dialog: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        sidebar: {
          DEFAULT: "#F8FAFC",
          foreground: "#1E293B",
          border: "#E2E8F0",
          accent: "#EFF6FF",
          "accent-foreground": "#2563EB",
          ring: "#BFDBFE",
        }
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        sans: ["Open Sans", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;