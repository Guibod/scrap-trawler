import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SettingsProvider, useSettings } from "~/resources/ui/providers/settings";
import userEvent from "@testing-library/user-event";
import SettingsService from "~/resources/domain/services/settings.service"
import React from "react";
import { DEFAULT_SETTINGS } from "~/resources/domain/models/settings.model"
import { createMock } from "@golevelup/ts-vitest"

// ✅ Test Component to Consume Settings Context
const TestComponent = () => {
  const { settings, setMany } = useSettings();
  return (
    <div>
      <p data-testid="cross-identification">{String(settings?.enableCrossEventIdentification)}</p>
      <button onClick={() => setMany({ enableCrossEventIdentification: true })}>
        Update Key
      </button>
    </div>
  );
};

const settingsServiceMock = createMock<SettingsService>()
settingsServiceMock.get.mockResolvedValue(DEFAULT_SETTINGS);
settingsServiceMock.setOne.mockImplementation((key, value) =>
    new Promise((resolve) => {
      resolve({ ...DEFAULT_SETTINGS, [key]: value });
    }))
settingsServiceMock.setMany.mockImplementation((props) =>
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

    expect(await screen.findByTestId("cross-identification")).toHaveTextContent("false");
  });

  it("updates settings when calling updateSettings", async () => {
    render(
      <SettingsProvider service={settingsServiceMock}>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => screen.getByRole("button", { name: /update key/i }))
      .then((button) => userEvent.click(button));

    expect(screen.getByTestId("cross-identification")).toHaveTextContent("true");
    expect(settingsServiceMock.setMany).toHaveBeenCalledWith({
      enableCrossEventIdentification: true,
    });
  });

  it("throws an error when `useSettings` is used outside of `SettingsProvider`", () => {
    const renderOutsideProvider = () => {
      render(<TestComponent />);
    };

    expect(renderOutsideProvider).toThrowError("useSettings must be used within a SettingsProvider");
  });
});
