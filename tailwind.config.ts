import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#07070f",
        surface: "#0d0d1a",
        card:    "#111120",
        border:  "rgba(255,255,255,0.07)",
        green:   "#00ff85",
        purple:  "#8b5cf6",
        muted:   "#4b4b6b",
        dim:     "#2a2a42",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
