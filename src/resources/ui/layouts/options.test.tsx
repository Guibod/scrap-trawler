import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import packageJson from "../../../../package.json";
import React from "react"
import OptionPageLayout from "~resources/ui/layouts/options"

// ✅ Mock `window.matchMedia`
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: query === "(prefers-color-scheme: dark)", // Simulate dark mode
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("OptionPageLayout Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the layout correctly", async () => {
    render(
      <OptionPageLayout>
        <p>Test Content</p>
      </OptionPageLayout>
    );

    expect(await screen.findByText("Test Content")).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes(`Scrap Trawler v${packageJson.version}`))
    ).toBeInTheDocument();
  });

  it("applies dark mode when preferred", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true, // Simulate dark mode enabled
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<OptionPageLayout><p>Dark Mode Test</p></OptionPageLayout>);

    // ✅ Select the correct container using aria-label
    const layoutContainer = screen.getByLabelText("layout-container");

    // ✅ Expect the container to have the dark mode class
    expect(layoutContainer).toHaveClass("dark");
  });

  it("displays the correct footer year", async () => {
    render(<OptionPageLayout><p>Footer Test</p></OptionPageLayout>);

    const year = new Date().getFullYear();
    expect(screen.getByText(`Scrap Trawler v${packageJson.version} © ${year}`)).toBeInTheDocument();
  });
});
