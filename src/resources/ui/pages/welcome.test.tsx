import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom"
import { SettingsProvider } from "~resources/ui/providers/settings";
import WelcomePage from "~resources/ui/pages/welcome";
import { DEFAULT_SETTINGS } from "~resources/domain/models/settings.model";
import SettingsService from "~resources/domain/services/settings.service"

vi.stubGlobal("chrome", { storage: { local: {
  get: vi.fn().mockResolvedValue({
    scrapTrawlerSettings: DEFAULT_SETTINGS,
  })
} } });
vi.stubGlobal(
  "data-base64:../../../../assets/screenshots/eventlink.agenda.png",
  "mock-image"
);
vi.stubGlobal(
  "data-base64:../../../../assets/screenshots/eventlink.event.png",
  "mock-image"
);

// ✅ Mock useNavigate for navigation testing
const navigateMock = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: vi.fn(() => navigateMock) };
});


// ✅ Mock SettingsService
const settingsServiceMock = new SettingsService()
vi.spyOn(settingsServiceMock, "setOne").mockResolvedValue(DEFAULT_SETTINGS);

describe("WelcomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the welcome page correctly", async () => {
    render(
      <MemoryRouter>
        <SettingsProvider service={settingsServiceMock}>
          <WelcomePage />
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading settings...")).toBeInTheDocument();

    expect(await screen.findByText("Welcome to Scrap Trawler!")).toBeInTheDocument();
    screen.debug()
    expect(screen.queryByText(/Alpha Version Notice/)).toBeTruthy();
    expect(screen.queryByText(/Legal Disclaimer/)).toBeTruthy();
  });

  it("calls setOne to disable welcome flag", async () => {
    render(
      <MemoryRouter>
        <SettingsProvider service={settingsServiceMock}>
          <WelcomePage />
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading settings...")).toBeInTheDocument();

    // ✅ Wait for the actual page content to appear
    await screen.findByText("Welcome to Scrap Trawler!");

    await act(async () => {
      expect(settingsServiceMock.setOne).toHaveBeenCalledWith("showWelcome", false);
    });
  });

  it("navigates away when 'Get Started' is clicked", async () => {
    render(
      <MemoryRouter>
        <SettingsProvider service={settingsServiceMock}>
          <WelcomePage />
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading settings...")).toBeInTheDocument();

    // ✅ Wait for the actual page content to appear
    await screen.findByText("Welcome to Scrap Trawler!");

    const button = screen.getByRole("button", { name: /get started/i });

    await act(async () => {
      await userEvent.click(button);
    });

    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
