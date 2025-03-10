import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { COLUMN_TYPE, FILTER_OPERATOR } from "~/resources/domain/enums/spreadsheet.dbo";
import type { SpreadsheetFilter } from "~/resources/domain/dbos/spreadsheet.dbo";
import { useEventSetup } from "~/resources/ui/components/event/setup/provider";
import FilterInput from "~/resources/ui/components/event/setup/filter"

vi.mock("~/resources/ui/components/event/setup/provider", () => ({
  useEventSetup: vi.fn(),
}));

describe("FilterInput", () => {
  let filter: SpreadsheetFilter;
  let onChangeMock: ReturnType<typeof vi.fn>;
  let onRemoveMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    filter = {
      column: 0,
      operator: FILTER_OPERATOR.EQUALS,
      values: ["Modern"],
    };
    onChangeMock = vi.fn();
    onRemoveMock = vi.fn();

    vi.mocked(useEventSetup).mockReturnValue({
      spreadsheetMeta: {
        columns: [
          { index: 0, name: "Format", type: COLUMN_TYPE.FILTER, originalName: "Format" },
          { index: 1, name: "Player", type: COLUMN_TYPE.FILTER, originalName: "Player" },
        ],
      },
      status: {
        rawData: [
          ["Modern", "Alice"],
          ["Pioneer", "Bob"],
          ["Modern", "Charlie"],
          ["Legacy", "David"],
        ],
      },
    });
  });

  it("renders without errors", () => {
    render(<FilterInput filter={filter} onChange={onChangeMock} onRemove={onRemoveMock} />);
    expect(screen.getByLabelText("Select Column")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Operator")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Values")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /✖/ })).toBeInTheDocument();
  });

  it("does not trigger onChange on mount", () => {
    render(<FilterInput filter={filter} onChange={onChangeMock} onRemove={onRemoveMock} />);
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it("updates column selection and triggers onChange", async () => {
    render(<FilterInput filter={filter} onChange={onChangeMock} onRemove={onRemoveMock} />);

    // Open the column select dropdown
    const columnSelect = screen.getByLabelText("Select Column");
    fireEvent.click(columnSelect);

    // Wait for options to appear in the DOM
    const option = await screen.findByRole("option", { name: "Player" }); // Adjust based on your column name
    fireEvent.click(option);

    // Ensure onChange was called with updated value
    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith({
        column: "1",
        operator: FILTER_OPERATOR.EQUALS,
        values: ["Modern"],
      });
    });
  });


  it("updates operator selection and triggers onChange", async () => {
    render(<FilterInput filter={filter} onChange={onChangeMock} onRemove={onRemoveMock} />);

    // Open the column select dropdown
    const columnSelect = screen.getByLabelText("Select Operator");
    fireEvent.click(columnSelect);

    // Wait for options to appear in the DOM
    const option = await screen.findByRole("option", { name: "Not Equals" });
    fireEvent.click(option);

    expect(onChangeMock).toHaveBeenCalledWith({
      column: 0,
      operator: FILTER_OPERATOR.NOT_EQUALS, // Updated operator
      values: ["Modern"],
    });
  });

  it("updates value selection and triggers onChange", async () => {
    render(<FilterInput filter={filter} onChange={onChangeMock} onRemove={onRemoveMock} />);

    // Open the column select dropdown
    const columnSelect = screen.getByLabelText("Select Values");
    fireEvent.click(columnSelect);

    // Wait for options to appear in the DOM
    const option = await screen.findByRole("option", { name: "Pioneer" });
    fireEvent.click(option);

    expect(onChangeMock).toHaveBeenCalledWith({
      column: 0,
      operator: FILTER_OPERATOR.EQUALS,
      values: ["Modern", "Pioneer"], // Updated value
    });
  });

  it("calls onRemove when the remove button is clicked", () => {
    render(<FilterInput filter={filter} onChange={onChangeMock} onRemove={onRemoveMock} />);

    fireEvent.click(screen.getByRole("button", { name: /✖/ }));

    expect(onRemoveMock).toHaveBeenCalled();
  });
});
