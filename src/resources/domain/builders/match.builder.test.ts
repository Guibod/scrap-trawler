import { describe, it, expect } from "vitest";
import type EventModelBuilder from "~resources/domain/builders/event.builder"
import MatchBuilder from "~resources/domain/builders/match.builder"

// Mock EventModelBuilder since it's only used as a parent reference
const mockEventModelBuilder = {} as EventModelBuilder;

describe("MatchBuilder", () => {
  it("should build a MatchDbo with default values", () => {
    const match = new MatchBuilder(mockEventModelBuilder).build();

    expect(match.id).toBeDefined();
    expect(match.tableNumber).toBeDefined();
    expect(match.teamIds.length).toBeGreaterThanOrEqual(1);
    expect(match.results).toBeDefined();
  });

  it("should allow setting individual properties", () => {
    const match = new MatchBuilder(mockEventModelBuilder)
      .withId("match-001")
      .withTableNumber(5)
      .withResult(["team-1", "team-2"], 2, 1, 0)
      .build();

    expect(match.id).toBe("match-001");
    expect(match.tableNumber).toBe(5);
    expect(match.teamIds).toEqual(["team-1", "team-2"]);
    expect(match.results["team-1"]).toEqual({ isBye: false, wins: 2, losses: 1, draws: 0 });
    expect(match.results["team-2"]).toEqual({ isBye: false, wins: 1, losses: 2, draws: 0 });
  });

  it("should correctly handle Bye matches", () => {
    const match = new MatchBuilder(mockEventModelBuilder)
      .withBye("team-1")
      .build();

    expect(match.isBye).toBe(true);
    expect(match.teamIds).toEqual(["team-1"]);
    expect(match.results["team-1"]).toEqual({ isBye: true, wins: 2, losses: 0, draws: 0 });
  });

  it("should correctly handle intentional draws", () => {
    const match = new MatchBuilder(mockEventModelBuilder)
      .withIntentionalDraw(["team-1", "team-2"])
      .build();

    expect(match.results["team-1"]).toEqual({ isBye: false, wins: 0, losses: 0, draws: 3 });
    expect(match.results["team-2"]).toEqual({ isBye: false, wins: 0, losses: 0, draws: 3 });
  });

  it("should return to parent builder when calling end()", () => {
    const parent = new MatchBuilder(mockEventModelBuilder).end();
    expect(parent).toBe(mockEventModelBuilder);
  });
});
