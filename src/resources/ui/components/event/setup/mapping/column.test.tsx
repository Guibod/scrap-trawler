import { render, fireEvent, screen } from "@testing-library/react";
import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo";
import { vi, expect, describe, beforeEach, it } from "vitest";
import React from "react"
import SpreadsheetColumn from "~resources/ui/components/event/setup/mapping/column"

describe("SpreadsheetColumn", () => {
  const mockColumn = {
    index: 1,
    name: "Player Name",
    originalName: "Original Column Name",
    type: COLUMN_TYPE.FIRST_NAME,
  };

  let onUpdateMock;

  beforeEach(() => {
    onUpdateMock = vi.fn();
  });

  it("renders the column name", () => {
    render(<SpreadsheetColumn column={mockColumn} onUpdate={onUpdateMock} showType={true} />);
    expect(screen.getByText("Player Name")).toBeInTheDocument();
  });

  it("opens modal when edit button is clicked", async () => {
    render(<SpreadsheetColumn column={mockColumn} onUpdate={onUpdateMock} />);

    // Click the edit button
    fireEvent.click(screen.getByTitle("Edit Column"));

    // Modal should now be open
    expect(screen.getByLabelText("Column Name")).toBeInTheDocument();
  });

  it("updates column name when input changes", async () => {
    render(<SpreadsheetColumn column={mockColumn} onUpdate={onUpdateMock} />);

    fireEvent.click(screen.getByTitle("Edit Column"));

    const nameInput = screen.getByLabelText("Column Name");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    expect(nameInput.value).toBe("Updated Name");
  });

  it("updates column type when selection changes", async () => {
    render(<SpreadsheetColumn column={mockColumn} onUpdate={onUpdateMock} />);

    fireEvent.click(screen.getByTitle("Edit Column")); // Open modal

    const selectInput = screen.getByLabelText("Column Type", { selector: "select" }); // Correct selector
    fireEvent.change(selectInput, { target: { value: COLUMN_TYPE.LAST_NAME } });

    expect(selectInput).toHaveValue(COLUMN_TYPE.LAST_NAME);
  });

  it("calls onUpdate with new values when saving", async () => {
    render(<SpreadsheetColumn column={mockColumn} onUpdate={onUpdateMock} />);

    fireEvent.click(screen.getByTitle("Edit Column"));

    const selectInput = screen.getByLabelText("Column Type", { selector: "select" }); // Correct selector
    fireEvent.change(screen.getByLabelText("Column Name"), { target: { value: "Updated Name" } });
    fireEvent.change(selectInput, { target: { value: COLUMN_TYPE.LAST_NAME } });

    fireEvent.click(screen.getByText("Save"));

    expect(onUpdateMock).toHaveBeenCalledWith({
      ...mockColumn,
      name: "Updated Name",
      type: COLUMN_TYPE.LAST_NAME,
    });
  });

  it("closes modal when cancel is clicked", async () => {
    render(<SpreadsheetColumn column={mockColumn} onUpdate={onUpdateMock} />);

    fireEvent.click(screen.getByTitle("Edit Column"));

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByLabelText("Column Name")).not.toBeInTheDocument();
  });
});
