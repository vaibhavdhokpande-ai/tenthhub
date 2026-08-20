import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F4EF",
        ink: "#171717",
        lavender: "#B9A9F0",
        "lavender-dark": "#9C86E8",
        coral: "#F0603F",
        "coral-dark": "#DA4E2F",
        sunshine: "#F3C548",
        "sunshine-dark": "#E0AE2C",
        line: "#E7E2D8",
      },
      fontFamily: {
        display: ["'Fredoka'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
