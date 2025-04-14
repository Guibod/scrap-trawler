import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

vi.stubGlobal("fetch", vi.fn(() =>
  Promise.resolve(new Response("{}", { status: 200 }))
))

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
    lastError: null,
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    create: vi.fn()
  },
  identity: {
    getAuthToken: vi.fn(),
    removeCachedAuthToken: vi.fn()
  },
} as unknown as typeof chrome;

vi.stubGlobal("matchMedia", () => ({
  matches: vi.fn().mockReturnValue(false),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

global.ResizeObserver = class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}