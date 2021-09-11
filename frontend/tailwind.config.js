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
      yellow: colors.yellow,
      primary: {
        light: "#93B2E9",
        DEFAULT: "#498CF9",
      },
      secondary: {
        DEFAULT: "#f9b649",
      },
    },
    extend: {
      gridTemplateColumns: {
        "triple": "3.5rem 1fr 3.5rem",
        "triple-lg": "4rem 1fr 4rem",
        "table-5": "3fr 1fr 2fr 1fr 1.5rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
