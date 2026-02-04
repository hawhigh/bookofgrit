/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#00f0ff",
        "fire": "#ff4d00",
        "neon-magenta": "#ff00ff",
        "neon-yellow": "#ccff00",
        "background-dark": "#050505",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "graffiti": ["Permanent Marker", "cursive"],
        "stencil": ["Rock Salt", "cursive"],
        "bombed": ["Rubik Mono One", "sans-serif"],
        "technical": ["Courier Prime", "monospace"]
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
