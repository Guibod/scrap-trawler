import { vi, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TableEvents from "~/resources/ui/components/table.events";

vi.mock("~/resources/ui/components/status.icons", () => ({
  GlobalStatusIcon: vi.fn(() => <div data-testid="global-status-icon" />),
}));

vi.mock("~/resources/domain/services/event.service", () => ({
  default: {
    getInstance: vi.fn(() => ({
      listEvents: vi.fn(async () => [
        { id: "1", title: "Event 1", date: new Date("2024-03-18"), organizer: "Org 1" },
        { id: "2", title: "Event 2", date: new Date("2024-03-17"), organizer: "Org 2" },
        { id: "3", title: "Event 3", date: new Date("2024-03-16"), organizer: "Org 3" }
      ])
    }))
  }
}));

describe("TableEvents Component", () => {
  test("renders event table correctly", async () => {
    render(<TableEvents title="Test Events" rowsPerPage={2} />);

    await waitFor(() => expect(screen.getByText("Event 1")).toBeInTheDocument());
    expect(screen.getByText("Event 2")).toBeInTheDocument();
    expect(screen.queryByText("Event 3")).not.toBeInTheDocument(); // Paginated out
  });

  test("pagination works", async () => {
    render(<TableEvents title="Test Events" rowsPerPage={2} />);

    await waitFor(() => expect(screen.getByText("Event 1")).toBeInTheDocument());

    const nextPageButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => expect(screen.getByText("Event 3")).toBeInTheDocument());
  });

  test("refresh button reloads events", async () => {
    const { getByTitle } = render(<TableEvents title="Test Events" rowsPerPage={2} />);
    await waitFor(() => expect(screen.getByText("Event 1")).toBeInTheDocument());

    const refreshButton = getByTitle("Refresh");
    fireEvent.click(refreshButton);

    await waitFor(() => expect(screen.getByText("Event 1")).toBeInTheDocument());
  });
});