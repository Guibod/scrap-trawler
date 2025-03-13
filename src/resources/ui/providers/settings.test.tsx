import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SettingsProvider, useSettings } from "~/resources/ui/providers/settings";
import userEvent from "@testing-library/user-event";
import SettingsService from "~/resources/domain/services/settings.service"
import React from "react";
import { DEFAULT_SETTINGS } from "~/resources/domain/models/settings.model"

// ✅ Test Component to Consume Settings Context
const TestComponent = () => {
  const { settings, setMany } = useSettings();
  return (
    <div>
      <p data-testid="moxfield">{settings?.moxfieldApiKey ?? ''}</p>
      <button onClick={() => setMany({ moxfieldApiKey: "new-key" })}>
        Update Key
      </button>
    </div>
  );
};

const settingsServiceMock = new SettingsService()
vi.spyOn(settingsServiceMock, "get").mockResolvedValue(DEFAULT_SETTINGS);
vi.spyOn(settingsServiceMock, "setOne")
  .mockImplementation((key, value) =>
    new Promise((resolve) => {
      resolve({ ...DEFAULT_SETTINGS, [key]: value });
    }))
vi.spyOn(settingsServiceMock, "setMany")
  .mockImplementation((props) =>
    new Promise((resolve) => {
      resolve({ ...DEFAULT_SETTINGS, ...props });
    }))

describe("SettingsProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides default settings", async () => {
    render(
      <SettingsProvider service={settingsServiceMock}>
        <TestComponent />
      </SettingsProvider>
    );

    expect(await screen.findByTestId("moxfield")).toHaveTextContent("");
  });

  it("updates settings when calling updateSettings", async () => {
    render(
      <SettingsProvider service={settingsServiceMock}>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => screen.getByRole("button", { name: /update key/i }))
      .then((button) => userEvent.click(button));

    expect(screen.getByTestId("moxfield")).toHaveTextContent("new-key");
    expect(settingsServiceMock.setMany).toHaveBeenCalledWith({
      moxfieldApiKey: "new-key",
    });
  });

  it("throws an error when `useSettings` is used outside of `SettingsProvider`", () => {
    const renderOutsideProvider = () => {
      render(<TestComponent />);
    };

    expect(renderOutsideProvider).toThrowError("useSettings must be used within a SettingsProvider");
  });
});
