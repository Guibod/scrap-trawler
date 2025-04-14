import { vi, describe, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SetupUpload from "~/resources/ui/components/event/setup/upload";
import React from "react";
import { useEventSetup } from "~/resources/ui/components/event/setup/provider";
import userEvent from "@testing-library/user-event"

// Mock the hook
vi.mock("~/resources/ui/components/event/setup/provider", () => ({
  useEventSetup: vi.fn(),
}));

describe("SetupUpload", () => {
  const handleFileUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload UI", () => {
    (useEventSetup as any).mockReturnValue({ handleFileUpload, status: { hasData: false }, event: { spreadsheet: null }});

    render(<SetupUpload />);

    expect(screen.getByText("Event Setup Guide")).toBeInTheDocument();
    expect(screen.getByLabelText("Auto-detect columns on upload")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("calls handleFileUpload on valid form submit, without auto-detection", async () => {
    (useEventSetup as any).mockReturnValue({ handleFileUpload, status: { hasData: false },  event: { spreadsheet: null } });

    render(<SetupUpload />);

    const file = new File(["name,deck"], "players.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("file-upload") as HTMLInputElement;

    const checkbox = screen.getByLabelText((_, el) =>
      el?.tagName === "INPUT" &&
      el.getAttribute("type") === "checkbox" &&
      el.getAttribute("aria-label") === "auto-detect"
    ) as HTMLInputElement;

    const user = userEvent.setup();

    // Simulate file upload correctly
    await user.upload(fileInput, file);

    // Uncheck autodetect
    await user.click(checkbox); // toggles off defaultSelected

    // Submit form
    const form = screen.getByLabelText("upload-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(handleFileUpload).toHaveBeenCalledWith(file, false);
    });
  });


  it("calls handleFileUpload on valid form submit, with auto-detection", async () => {
    (useEventSetup as any).mockReturnValue({ handleFileUpload, status: { hasData: false },  event: { spreadsheet: null } });

    render(<SetupUpload />);

    const file = new File(["name,deck"], "players.csv", { type: "text/csv" });
    const fileInput = screen.getByLabelText("file-upload") as HTMLInputElement;

    const user = userEvent.setup();

    // Simulate file upload correctly
    await user.upload(fileInput, file);

    // Submit form
    const form = screen.getByLabelText("upload-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(handleFileUpload).toHaveBeenCalledWith(file, true);
    });
  });

  it("shows success alert when status.hasData is true", () => {
    (useEventSetup as any).mockReturnValue({ handleFileUpload, status: { hasData: true },  event: { spreadsheet: null } });

    render(<SetupUpload />);

    expect(screen.getByText("The spreadsheet was recovered successfully")).toBeInTheDocument();
  });
});
