import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: [
      "./setupTests.ts",
    ],
    environment: "jsdom",
    coverage: { provider: "v8", reporter: [ "text", "json", "html" ] }
  }
});

