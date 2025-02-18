const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./src/*.tsx", "./node_modules/@heroui/**/*.tsx"],
  plugins: [heroui()]
}