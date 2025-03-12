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
    coverage: {
      provider: 'v8', // Use 'v8' for native V8 coverage
      reporter: ['text', 'lcov', 'json-summary'], // Useful coverage reports
      exclude: ['**/node_modules/**', '**/dist/**', '**/test/**', '**/mocks/**', '**/build/**'],
      include: ['**/src/**'],
      all: true, // Enforce coverage for untested files
      thresholds: {
        statements: 52,
        branches: 80,
        functions: 67,
        lines: 52
      }
    },
  },
  resolve: {
    alias: [
      {
        find: /^data-base64:.*/,
        replacement: "/__mocks__/mockImage.ts",
      },
    ],
  },
});

