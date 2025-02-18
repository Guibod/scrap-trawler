const { heroui } = require("@heroui/react");

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
      },
    },
  },
  plugins: [
    heroui({
      defaultTheme: "light",
    }),
  ],
};
