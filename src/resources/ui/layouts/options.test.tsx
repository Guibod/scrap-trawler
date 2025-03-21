import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react"
import OptionPageLayout from "~/resources/ui/layouts/options"
import { getHumanVersion } from "~/resources/utils/version"

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
      screen.getByText((content) => content.includes(`Scrap Trawler ${getHumanVersion()}`))
    ).toBeInTheDocument();
  });

  it("applies dark mode when preferred", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true
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
    expect(screen.getByText(`Scrap Trawler ${getHumanVersion()} © ${year}`)).toBeInTheDocument();
  });
});
