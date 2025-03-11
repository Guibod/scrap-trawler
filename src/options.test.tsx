import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import Options from "./options"

// ✅ Mock Components
vi.mock("~resources/ui/layouts/options", () => ({
  default: ({ children }) => <div data-testid="option-page-layout">{children}</div>,
}));

vi.mock("~resources/ui/pages/settings", () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

vi.mock("~resources/ui/providers/settings", () => ({
  SettingsProvider: ({ children }) => <div data-testid="settings-provider">{children}</div>,
}));

describe("Options Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the options page correctly", () => {
    render(<Options />);

    // ✅ Ensure it renders inside OptionPageLayout
    expect(screen.getByTestId("option-page-layout")).toBeInTheDocument();

    // ✅ Ensure SettingsProvider wraps content
    expect(screen.getByTestId("settings-provider")).toBeInTheDocument();

    // ✅ Ensure SettingsPage is displayed
    expect(screen.getByTestId("settings-page")).toBeInTheDocument();
  });
});
