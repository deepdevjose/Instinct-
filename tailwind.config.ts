import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#070908",
        canopy: "#101713",
        venom: "#8dff7a",
        moss: "#4f7d48",
        bone: "#d9d6c7",
        ember: "#d8903a"
      },
      boxShadow: {
        venom: "0 0 28px rgba(141, 255, 122, 0.16)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
} satisfies Config;
