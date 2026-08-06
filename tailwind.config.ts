import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { serif: ["Georgia", "Cambria", "Times New Roman", "serif"] },
      boxShadow: { glow: "0 0 0 1px rgba(148,163,184,.1), 0 10px 30px rgba(15,23,42,.12)" },
    },
  },
  plugins: [],
};

export default config;
