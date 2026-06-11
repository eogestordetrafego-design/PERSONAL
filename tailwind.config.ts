import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#09090F",
        card: "#13131C",
        line: "#1E1E2A",
        accent: "#00D68F",
        accent2: "#7B6EF6",
        danger: "#FF4D6D",
        warn: "#FFB020",
        txt: "#F0F0F8",
        txt2: "#8888A0",
      },
      borderRadius: { card: "18px" },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
