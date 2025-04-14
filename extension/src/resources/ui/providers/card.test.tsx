import { vi, expect, it, describe, beforeEach } from "vitest";
import React from "react"
import { act, render, screen } from "@testing-library/react"
import { CardProvider, useCards } from "~/resources/ui/providers/card";
import { useEffect } from "react"

vi.mock("~/resources/domain/services/card.service");

const TestComponent = () => {
  const { getCard, searchCard, isIndexing } = useCards();

  useEffect(() => {
    getCard("Test");
    searchCard("Query");
  }, [getCard, searchCard]);

  return <div data-testid="indexing-state">{isIndexing.toString()}</div>;
};

describe("CardProvider", () => {
  let mockCardService;

  beforeEach(() => {
    mockCardService = {
      getCard: vi.fn().mockResolvedValue(null),
      searchCard: vi.fn().mockResolvedValue([]),
      buildIndex: vi.fn().mockResolvedValue(null),
      onIndexingStart: vi.fn(),
      onIndexingProgress: vi.fn(),
      onIndexingComplete: vi.fn(),
    };
  });

  it("provides card service methods and indexing state", async () => {

    render(
      <CardProvider cardService={mockCardService}>
        <TestComponent />
      </CardProvider>
    );

    expect(mockCardService.getCard).toHaveBeenCalledWith("Test");
    expect(mockCardService.searchCard).toHaveBeenCalledWith("Query");
  });

  it("updates isIndexing state when callbacks are triggered", async () => {
    render(
      <CardProvider cardService={mockCardService}>
        <TestComponent />
      </CardProvider>
    );

    act(() => {
      mockCardService.onIndexingStart.mock.calls[0][0]();
    });
    expect(screen.getByTestId("indexing-state").textContent).toBe("true");

    act(() => {
      mockCardService.onIndexingComplete.mock.calls[0][0]();
    });
    expect(screen.getByTestId("indexing-state").textContent).toBe("false");
  });
});