import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react"
import { render, screen, act, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { EventProvider, useEvent } from "~resources/ui/providers/event";
import EventService from "~resources/domain/services/event.service";
import { EventScrapeStateDbo } from "~resources/domain/enums/event.scrape.state.dbo";
import { PairStatus } from "~resources/domain/enums/status.dbo";
import type { EventModel } from "~resources/domain/models/event.model"

// ✅ Mock EventService
vi.mock("~resources/domain/services/event.service");

const mockEvent = {
  id: "123",
  title: "Test Event",
  scrapeStatus: EventScrapeStateDbo.PURGED,
  status: { pair: PairStatus.COMPLETED },
  players: {
    "1": { name: "Player One", overrides: null },
  },
} as unknown as EventModel;

// ✅ Test Component to Consume the Event Context
const TestComponent = () => {
  const { event, updatePlayerOverride, updateEvent } = useEvent();
  return (
    <div>
      <p data-testid="event-name">{event?.title || "No Event"}</p>
      <button onClick={() => updatePlayerOverride("1", { archetype: "override" })}>
        Update Player
      </button>
      <button onClick={() => updateEvent({ title: "Updated Event" })}>
        Update Event
      </button>
    </div>
  );
};

describe("EventProvider", () => {
  let eventServiceMock;

  beforeEach(() => {
    vi.clearAllMocks();

    eventServiceMock = new EventService();

    vi.mocked(eventServiceMock.getEvent).mockResolvedValue(mockEvent);
    vi.mocked(eventServiceMock.saveEvent).mockImplementation(async (event) => event);
  });

  it("renders loading spinner while fetching event", async () => {
    render(
      <MemoryRouter initialEntries={["/event/123"]}>
        <Routes>
          <Route
            path="/event/:eventId"
            element={
              <EventProvider service={eventServiceMock}>
                <TestComponent />
              </EventProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Please wait while recovering the event")).toBeInTheDocument();
  });

  it("renders event data after fetching", async () => {
    render(
      <MemoryRouter initialEntries={["/event/123"]}>
        <Routes>
          <Route
            path="/event/:eventId"
            element={
              <EventProvider service={eventServiceMock}>
                <TestComponent />
              </EventProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    waitFor(() => screen.getByTestId("event-name"))
      .then((item) => expect(item).toBeInTheDocument());
  });

  it("updates player override correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/event/123"]}>
        <Routes>
          <Route
            path="/event/:eventId"
            element={
              <EventProvider service={eventServiceMock}>
                <TestComponent />
              </EventProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("button", { name: /update player/i }))
      .then((button) => act(() => button.click()));

    expect(eventServiceMock.saveEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        players: expect.objectContaining({
          "1": expect.objectContaining({
            overrides: expect.objectContaining({ archetype: "override" }),
          }),
        }),
      })
    );
  });

  it("updates event details correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/event/123"]}>
        <Routes>
          <Route
            path="/event/:eventId"
            element={
              <EventProvider service={eventServiceMock}>
                <TestComponent />
              </EventProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByRole("button", { name: /update event/i }))
      .then((button) => act(() => button.click()))

    expect(eventServiceMock.saveEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Updated Event" })
    );
  });

  it("renders not found message when event is missing", async () => {
    vi.mocked(eventServiceMock.getEvent).mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={["/event/123"]}>
        <Routes>
          <Route
            path="/event/:eventId"
            element={
              <EventProvider service={eventServiceMock}>
                <TestComponent />
              </EventProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.findByText("Event not found"))
      .then(item => {
        expect(item).toBeInTheDocument()
      });
  });
});
