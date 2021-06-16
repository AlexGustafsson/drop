const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

module.exports = {
  mode: "jit",
  purge: [
    "./src/**/*.tsx",
  ],
  darkMode: "media",
  theme: {
    colors: {
      transparent: "transparent",
      "current": "currentColor",
      gray: colors.blueGray,
      white: colors.white,
      black: colors.black,
      red: colors.red,
      primary: {
        light: "#93B2E9",
        DEFAULT: "#498CF9",
      },
      secondary: {
        DEFAULT: "#f9b649",
      },
    },
    keyframes: {
      "move-in": {
        "0%": {opacity: 0, transform: "translateY(25%)"},
        "100%": {opacity: 1, transform: "translateY(0)"},
      },
      "fade-in": {
        "0%": { opacity: 0 },
        "100%": { opacity: 1 },
      },
    },
    extend: {
      gridTemplateColumns: {
        "triple": "3.5rem 1fr 3.5rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
