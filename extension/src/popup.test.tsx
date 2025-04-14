import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Popup from "~/popup";
import { openApp } from "~/resources/ui/actions/open";

// ✅ Mock `openApp` function
vi.mock("~/resources/ui/actions/open", () => ({
  openApp: vi.fn(),
}));

describe("Popup Component", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  });


  it("renders the popup correctly", async () => {
    render(<Popup />);

    expect(await screen.findByText(/Scrap Trawler/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open Application/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Report a Bug/i })).toBeInTheDocument();
  });

  it("opens the application when 'Open Application' is clicked", async () => {
    render(<Popup />);

    const button = screen.getByRole("button", { name: /Open Application/i });

    await userEvent.click(button);

    expect(openApp).toHaveBeenCalledWith("/");
  });

  it("opens the settings page when settings button is clicked", async () => {
    render(<Popup />);

    const settingsButton = screen.getByRole("button", { name: "settings" });

    await userEvent.click(settingsButton);

    expect(openApp).toHaveBeenCalledWith("/settings");
  });

  it("opens the GitHub issue page when 'Report a Bug' is clicked", async () => {
    global.window.open = vi.fn();

    render(<Popup />);

    const bugButton = screen.getByRole("button", { name: /Report a Bug/i });

    await userEvent.click(bugButton);

    expect(global.window.open).toHaveBeenCalledWith(
      "https://github.com/Guibod/scrap-trawler/issues/new",
      "_blank",
      "noopener,noreferrer"
    );
  });
});
