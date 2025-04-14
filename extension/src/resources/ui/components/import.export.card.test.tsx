import { vi, expect, beforeEach, it, describe } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ImportExportCard from "~/resources/ui/components/import.export.card";
import { exportEventsToFile, importEventsFromFile } from "~/resources/utils/export"

const mockedExport = vi.mocked(exportEventsToFile)
const mockedImport = vi.mocked(importEventsFromFile)

vi.mock("~/resources/utils/export", () => {
  return {
    exportEventsToFile: vi.fn(() => Promise.resolve()),
    importEventsFromFile: vi.fn(() => Promise.resolve()),
  }
})

describe("ImportExportCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })

  it("renders the component correctly", () => {
    render(<ImportExportCard />);
    expect(screen.getByText("Import & Export Data")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export Data" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import Data" })).toBeInTheDocument();
  });

  it("opens modal when clicking export button", async () => {
    render(<ImportExportCard />);
    const exportButton = screen.getByRole("button", { name: "Export Data" });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("Exporting Data")).toBeInTheDocument();
    });
  });

  it("calls exportEvents when clicking export button", async () => {
    render(<ImportExportCard />);
    const exportButton = screen.getByRole("button", { name: "Export Data" });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(vi.mocked(exportEventsToFile)).toHaveBeenCalled();
    });
  });

  it("triggers file import when selecting a file", async () => {
    render(<ImportExportCard />);
    const fileInput = screen.getByLabelText("Import Data");
    const file = new File(["{}"], "test.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(vi.mocked(importEventsFromFile)).toHaveBeenCalled();
    });
  });
});
