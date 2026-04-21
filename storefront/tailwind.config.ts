import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sericia: { ink: "#1a1a1a", paper: "#faf7f2", accent: "#8b5a2b" },
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
