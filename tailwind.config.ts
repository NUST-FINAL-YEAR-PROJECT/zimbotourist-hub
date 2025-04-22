import type { Config } from "tailwindcss";

export default {
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
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#0EA5E9",
        background: "#FFFFFF",
        foreground: "#1A1F2C",
        primary: {
          DEFAULT: "#0EA5E9",
          foreground: "#FFFFFF",
          dark: "#0284C7",
        },
        secondary: {
          DEFAULT: "#F0F9FF",
          foreground: "#1A1F2C",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#F97316",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2C",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2C",
        },
        sidebar: {
          DEFAULT: "#F8FAFC",
          foreground: "#1A1F2C",
          border: "#E2E8F0",
          accent: "#EFF6FF",
          "accent-foreground": "#0EA5E9",
          ring: "#BFDBFE",
        }
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        sans: ["Open Sans", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
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
        "slide-in": {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "zoom-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.7s ease-out",
        "zoom-in": "zoom-in 0.6s ease-out",
        "slide-in-slow": "slide-in 1s ease-out",
        "fade-in-slow": "fade-in 1.5s ease-out",
        "zoom-in-slow": "zoom-in 1.2s ease-out",
      },
      transitionDuration: {
        '1500': '1500ms',
        '2000': '2000ms',
        '3000': '3000ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
