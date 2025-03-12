import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MainLayout from "~resources/ui/layouts/main";

// ✅ Mock window.matchMedia to simulate dark mode
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("MainLayout Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the layout correctly", async () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    expect(await screen.findByText("Scrap Trawler")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /scrap trawler/i})).toBeInTheDocument();
  });

  it("respects dark mode preference", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true, // Simulate dark mode enabled
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    const layoutDiv = screen.getByRole("main").parentElement;
    expect(layoutDiv).toHaveClass("dark");
  });

  it("contains a footer with the current year", async () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    const year = new Date().getFullYear();
    expect(screen.getByText(`Scrap Trawler © ${year}`)).toBeInTheDocument();
  });
});
