const { heroui } = require("@heroui/react");

const manaColors = {
  W: "#f8f4e8",
  U: "#a1d7e0",
  B: "#aca29a",
  R: "#e88063",
  G: "#96c296",
  C: "#cccccc",
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "media",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mtg: ["'IM Fell English'", "sans-serif"], // Define a custom font class "font-mtg"
        sans: ["sans-serif"], // Define a custom font class "font-mtg"
      },
      colors: {
        mana: manaColors
      },
      fill: theme => theme('colors.mana'),
      stroke: theme => theme('colors.mana'),
      textColor: theme => theme('colors.mana'),
    },
  },
  plugins: [
    heroui({
      defaultTheme: "light",
    }),
  ],
  safelist: [
    {
      pattern: /^(bg|text|fill|stroke)-mana-(W|U|B|R|G|C)$/,
    },
  ],
};
