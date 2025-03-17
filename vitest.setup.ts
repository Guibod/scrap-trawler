import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// ✅ Mock the global `chrome` object
global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys) => Promise.resolve(typeof keys === "string" ? { [keys]: null } : {})),
      set: vi.fn((items) => Promise.resolve()),
      remove: vi.fn((keys) => Promise.resolve()),
    },
  },
  runtime: {
    getURL: vi.fn(),
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    create: vi.fn()
  }
} as unknown as typeof chrome;
