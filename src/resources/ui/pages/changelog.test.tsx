import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// ✅ Mock `changelog.json`
vi.mock("~/changelog.json", () => ({
  default: [
    {
      version: "1.2.3",
      timestamp: 1710000000, // Example Unix timestamp
      changes: ["Fixed a bug", "Added new feature"],
    },
    {
      version: "1.2.2",
      timestamp: 1708000000,
      changes: ["Improved performance"],
    },
  ]
}));

import ChangelogPage from "~resources/ui/pages/changelog";
describe("ChangelogPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the changelog page correctly", async () => {
    render(<ChangelogPage />);

    expect(await screen.findByText("📜 Changelog")).toBeInTheDocument();
    expect(screen.getByText("Here is the list of changes made to the app over time.")).toBeInTheDocument();

    // Ensure all versions are displayed
    expect(screen.getByText("Version 1.2.3 - 3/9/2024")).toBeInTheDocument();
    expect(screen.getByText("Version 1.2.2 - 2/15/2024")).toBeInTheDocument();
  });

  it("renders the correct number of changelog entries", async () => {
    render(<ChangelogPage />);

    const accordionItems = screen.getAllByRole("button"); // AccordionItem buttons
    expect(accordionItems).toHaveLength(2);
  });

  it("expands an accordion item to show changes", async () => {
    render(<ChangelogPage />);

    const firstAccordionButton = screen.getByText("Version 1.2.3 - 3/9/2024");
    fireEvent.click(firstAccordionButton);

    expect(screen.getByText("Fixed a bug")).toBeInTheDocument();
    expect(screen.getByText("Added new feature")).toBeInTheDocument();
  });

  it("does not show changes initially", async () => {
    render(<ChangelogPage />);

    expect(screen.queryByText("Fixed a bug")).not.toBeInTheDocument();
    expect(screen.queryByText("Improved performance")).not.toBeInTheDocument();
  });
});
