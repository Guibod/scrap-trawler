import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { SettingsProvider, useSettings } from "~resources/ui/providers/settings";
import { DEFAULT_SETTINGS } from "~resources/domain/models/settings.model";
import userEvent from "@testing-library/user-event";
import React from "react";

// ✅ Ensure `chrome` is mocked globally
vi.stubGlobal("chrome", {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
});

// ✅ Mock `SettingsDao`
vi.mock("~resources/storage/settings.dao", () => ({
  SettingsDao: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(DEFAULT_SETTINGS),
    save: vi.fn(),
  })),
}));

// ✅ Import after mocks to ensure they are applied
import { SettingsDao } from "~resources/storage/settings.dao";

// ✅ Test Component to Consume Settings Context
const TestComponent = () => {
  const { settings, updateSettings } = useSettings();
  return (
    <div>
      <p data-testid="moxfield">{settings?.moxfieldApiKey ?? ''}</p>
      <button onClick={() => updateSettings({ moxfieldApiKey: "new-key" })}>
        Update Key
      </button>
    </div>
  );
};

describe("SettingsProvider", () => {
  let settingsDaoMock: ReturnType<typeof vi.mocked<SettingsDao>>;

  beforeEach(() => {
    vi.clearAllMocks();
    settingsDaoMock = vi.mocked(new SettingsDao(chrome.storage.local), true);
  });

  it("provides default settings", async () => {
    render(
      <SettingsProvider dao={settingsDaoMock}>
        <TestComponent />
      </SettingsProvider>
    );

    expect(await screen.findByTestId("moxfield")).toHaveTextContent("");
  });

  it("updates settings when calling updateSettings", async () => {
    render(
      <SettingsProvider dao={settingsDaoMock}>
        <TestComponent />
      </SettingsProvider>
    );

    const button = screen.getByRole("button", { name: /update key/i });

    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.getByTestId("moxfield")).toHaveTextContent("new-key");
    expect(settingsDaoMock.save).toHaveBeenCalledWith({
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
