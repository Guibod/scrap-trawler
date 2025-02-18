import heroui from "@heroui/theme"

export default {
  content: [
    "./node_modules/@heroui/theme/dist/components/(button|card|table|ripple|spinner|checkbox|form|spacer).js",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};