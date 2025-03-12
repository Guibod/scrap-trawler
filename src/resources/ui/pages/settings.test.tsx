import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSettings } from "~resources/ui/providers/settings"
import React from "react"
import SettingsPage from "~resources/ui/pages/settings"

// ✅ Mock `useSettings` before importing components
vi.mock("~resources/ui/providers/settings", () => ({
  useSettings: vi.fn(),
}));

describe("SettingsPage", () => {
  const mockUpdateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // ✅ Ensure `useSettings` returns consistent test data
    vi.mocked(useSettings).mockReturnValue({
      settings: {
        version: 1,
        moxfieldApiKey: "test-key",
        enableCrossEventIdentification: true,
        showWelcome: true
      },
      setMany: mockUpdateSettings,
      setOne: vi.fn()
    });
  });

  it("renders settings with initial values", () => {
    render(<SettingsPage />);

    expect(screen.getByLabelText("Moxfield API Key")).toHaveValue("test-key");
    expect(screen.getByLabelText("Enable Cross-Event Identification")).toBeChecked();
  });

  it("updates API Key when changed", async () => {
    render(<SettingsPage />);

    const apiKeyInput = screen.getByLabelText("Moxfield API Key");
    await userEvent.clear(apiKeyInput);
    await userEvent.type(apiKeyInput, "new-api-key");

    expect(apiKeyInput).toHaveValue("new-api-key");
  });

  it("toggles cross-event identification", async () => {
    render(<SettingsPage />);

    const checkbox = screen.getByLabelText("Enable Cross-Event Identification");
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls updateSettings on form submission", async () => {
    render(<SettingsPage />);

    const saveButton = screen.getByRole("button", { name: /save settings/i });

    await act(async () => {
      await userEvent.click(saveButton);
    });

    expect(mockUpdateSettings).toHaveBeenCalledWith({
      moxfieldApiKey: "test-key",
      enableCrossEventIdentification: true,
      version: 1,
      showWelcome: true
    });
  });
});
