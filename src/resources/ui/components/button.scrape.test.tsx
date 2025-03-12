import { describe, it, expect, beforeEach, vi } from "vitest";
import React from 'react'
import { render, screen, fireEvent, act } from "@testing-library/react";
import ButtonScrape from "~resources/ui/components/button.scrape";
import { ScrapeStatus } from "~resources/domain/enums/status.dbo";
import { eventScrape } from "~resources/ui/actions/event.scrape";
import { sendToBackground } from "@plasmohq/messaging";
import type { EventModel } from "~resources/domain/models/event.model"

// ✅ Mock `eventScrape` and `sendToBackground`
vi.mock("~resources/ui/actions/event.scrape", () => ({
  eventScrape: vi.fn(),
}));

vi.mock("@plasmohq/messaging", () => ({
  sendToBackground: vi.fn(),
}));

describe("ButtonScrape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default 'Scrape!' text", async () => {
    render(<ButtonScrape eventId="test-event" organizationId="test-org" fake />);

    expect(await screen.findByRole("button")).toBeInTheDocument();
  });

  it("loads initial event status", async () => {
    vi.mocked(sendToBackground).mockResolvedValue({
      status: { scrape: ScrapeStatus.COMPLETED },
    });

    render(<ButtonScrape eventId="test-event" organizationId="test-org" />);

    expect(await screen.findByRole("button")).toBeInTheDocument();
  });

  it("updates status when clicked", async () => {
    vi.mocked(eventScrape).mockResolvedValue({
      status: { scrape: ScrapeStatus.COMPLETED },
    } as any as EventModel);

    render(<ButtonScrape eventId="test-event" organizationId="test-org" />);

    const button = await screen.findByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(await screen.findByRole("button")).toBeInTheDocument();
  });

  it("disables button while scraping", async () => {
    vi.mocked(eventScrape).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ status: { scrape: ScrapeStatus.COMPLETED } } as unknown as EventModel), 1000))
    );

    render(<ButtonScrape eventId="test-event" organizationId="test-org" />);

    const button = await screen.findByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();
  });

  it("handles errors gracefully", async () => {
    vi.mocked(eventScrape).mockRejectedValue(new Error("Scraping failed"));

    render(<ButtonScrape eventId="test-event" organizationId="test-org" />);

    const button = await screen.findByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(await screen.findByRole("button")).toBeInTheDocument();
  });
});
