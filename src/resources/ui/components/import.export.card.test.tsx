import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, expect, beforeEach } from "vitest"
import React from "react";
import ImportExportCard from "~resources/ui/components/import.export.card";
import { ImportExportService } from "~resources/domain/import.export.service";

const serviceMock = {
  exportEvents: vi.fn(() => Promise.resolve()),
  importEvents: vi.fn(() => Promise.resolve()),
} as unknown as ImportExportService;

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
    render(<ImportExportCard service={serviceMock} />);
    const exportButton = screen.getByRole("button", { name: "Export Data" });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(vi.mocked(serviceMock.exportEvents)).toHaveBeenCalled();
    });
  });

  it("triggers file import when selecting a file", async () => {
    render(<ImportExportCard service={serviceMock} />);
    const fileInput = screen.getByLabelText("Import Data");
    const file = new File(["{}"], "test.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(vi.mocked(serviceMock.importEvents)).toHaveBeenCalled();
    });
  });
});
