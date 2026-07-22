import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Notebook-inspired palette: margin-red, ruled-blue, paper, ink
        paper: "#FBF9F4",
        ink: "#1E2124",
        "ruled-blue": "#2B4C7E",
        "margin-red": "#B5443C",
        "highlight-amber": "#E8A33D",
        "success-green": "#3F7D5C",
        border: "#DDD6C8",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "ruled-lines":
          "repeating-linear-gradient(transparent, transparent 27px, #DDD6C8 28px)",
      },
    },
  },
  plugins: [],
};
export default config;
