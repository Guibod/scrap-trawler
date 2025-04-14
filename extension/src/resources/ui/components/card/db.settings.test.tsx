import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useMtgJson } from "~/resources/ui/providers/mtgjson";
import React from "react"
import CardDatabaseSettings from "~/resources/ui/components/card/db.settings"

vi.mock("~/resources/ui/providers/mtgjson", () => ({
  useMtgJson: vi.fn(),
}));

describe("CardDatabaseSettings", () => {
  const mockMtgJson = {
    tableSize: 1000,
    localVersion: "2025-03-01",
    remoteVersion: "2025-03-15",
    startImport: vi.fn().mockResolvedValue(undefined),
    cancelImport: vi.fn().mockResolvedValue(undefined),
    importProgress: 0,
    importSize: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMtgJson).mockReturnValue(mockMtgJson as unknown as ReturnType<typeof useMtgJson>);
  });

  it("renders correctly with initial state", () => {
    render(<CardDatabaseSettings />);

    expect(screen.getByText("Card Database")).toBeInTheDocument();
    expect(screen.getByText("(1000 cards)")).toBeInTheDocument();
    expect(screen.getByText("Local Version")).toBeInTheDocument();
    expect(screen.getByText("2025-03-01")).toBeInTheDocument();
    expect(screen.getByText("Remote Version")).toBeInTheDocument();
    expect(screen.getByText("2025-03-15")).toBeInTheDocument();
    expect(screen.getByText("Update Card Database")).toBeInTheDocument();
  });

  it("shows warning when no local version is available", () => {
    vi.mocked(useMtgJson).mockReturnValue({ ...mockMtgJson, localVersion: null } as unknown as ReturnType<typeof useMtgJson>);

    render(<CardDatabaseSettings />);
    expect(screen.getByText("not imported yet")).toBeInTheDocument();
  });

  it("calls startImport when clicking 'Update Card Database'", async () => {
    render(<CardDatabaseSettings />);

    const button = screen.getByText("Update Card Database");
    fireEvent.click(button);

    expect(mockMtgJson.startImport).toHaveBeenCalledTimes(1);
  });

  it("calls cancelImport when clicking 'Cancel Import'", async () => {
    vi.mocked(useMtgJson).mockReturnValue({ ...mockMtgJson, importProgress: 50 } as unknown as ReturnType<typeof useMtgJson>);

    render(<CardDatabaseSettings />);

    const button = screen.getByText("Cancel Import");
    fireEvent.click(button);

    expect(mockMtgJson.cancelImport).toHaveBeenCalledTimes(1);
  });

  it("displays progress bar during import", () => {
    vi.mocked(useMtgJson).mockReturnValue({ ...mockMtgJson, importProgress: 50 } as unknown as ReturnType<typeof useMtgJson>);

    render(<CardDatabaseSettings />);

    expect(screen.getByLabelText("settings-mtgjson-progress")).toBeInTheDocument();
  });
});
