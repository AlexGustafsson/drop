const colors = require('tailwindcss/colors') // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  mode: 'jit',
  content: ['./web/**/*.{html,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        gray: colors.slate,
        white: colors.white,
        black: colors.black,
        red: colors.red,
        yellow: colors.yellow,
        primary: {
          light: '#93B2E9',
          DEFAULT: '#498CF9',
        },
        secondary: {
          DEFAULT: '#f9b649',
        },
      },
      gridTemplateColumns: {
        triple: '3.5rem 1fr 3.5rem',
        'triple-lg': '4rem 1fr 4rem',
        'table-5': '3fr 1fr 2fr 1fr 1.5rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
