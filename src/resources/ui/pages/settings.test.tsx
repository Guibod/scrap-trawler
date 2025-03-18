import { describe, it, vi, beforeEach, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsPage from "~/resources/ui/pages/settings";

// ✅ Mock settings provider properly
const setManyMock = vi.fn(() => Promise.resolve())
const settingsMock = {
  moxfieldApiKey: "test-api-key",
  enableCrossEventIdentification: true,
}
vi.mock("~/resources/ui/providers/settings", () => ({
  useSettings: vi.fn(() => ({
    settings: settingsMock,
    setMany: setManyMock,
  })),
}));

// ✅ Mock dependent components
vi.mock("~/resources/ui/components/import.export.card", () => ({
  default: () => <div data-testid="import-export-card" />,
}));
vi.mock("~/resources/ui/components/card/db.settings", () => ({
  default: () => <div data-testid="db-settings-card" />,
}));
vi.mock("~/resources/ui/components/card/index.settings", () => ({
  default: () => <div data-testid="index-settings-card" />,
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render settings page with initial values", () => {
    render(<SettingsPage />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByLabelText("Moxfield API Key")).toHaveValue("test-api-key");
    expect(screen.getByText("Enable Cross-Event Identification")).toBeInTheDocument();
  });

  it("should update state when input values change", async () => {
    render(<SettingsPage />);

    const input = screen.getByLabelText("Moxfield API Key");
    fireEvent.change(input, { target: { value: "new-api-key" } });

    expect(input).toHaveValue("new-api-key");
  });

  it("should call setMany when settings are saved", async () => {
    render(<SettingsPage />);

    const saveButton = screen.getByText("Save Settings");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(setManyMock).toHaveBeenCalled(); // ✅ Ensure settings are saved
    });
  });

  it("should toggle checkbox value", () => {
    render(<SettingsPage />);

    const checkbox = screen.getByText("Enable Cross-Event Identification").closest("label");
    expect(checkbox).toBeTruthy();

    fireEvent.click(checkbox!);

    expect(checkbox).not.toHaveClass("is-selected");
  });

  it("should render ImportExportCard, CardDatabaseSettings, and CardIndexSettings", () => {
    render(<SettingsPage />);

    expect(screen.getByTestId("import-export-card")).toBeInTheDocument();
    expect(screen.getByTestId("db-settings-card")).toBeInTheDocument();
    expect(screen.getByTestId("index-settings-card")).toBeInTheDocument();
  });
});
