import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand accent — confirmed mockup value.
        accent: {
          DEFAULT: "#1D9E75",
          hover: "#168661",
          muted: "#1D9E75/20",
        },
        // Neutral palette for dark-default surfaces.
        ink: {
          950: "#0A0A0A",
          900: "#111111",
          800: "#1A1A1A",
          700: "#262626",
          600: "#404040",
          500: "#737373",
          400: "#A3A3A3",
          300: "#D4D4D4",
          200: "#E5E5E5",
          100: "#F5F5F5",
          50: "#FAFAFA",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-dm-serif)", "ui-serif", "Georgia"],
      },
    },
  },
  plugins: [],
};

export default config;
