import { describe, it, expect } from "vitest";
import type EventModelBuilder from "~/resources/domain/builders/event.builder"
import StandingBuilder from "~/resources/domain/builders/standings.builder"
import type { MatchDbo } from "~/resources/domain/dbos/match.dbo"
import type { StandingDbo } from "~/resources/domain/dbos/standing.dbo"
import type RoundBuilder from "~/resources/domain/builders/round.builder"

// Mock EventModelBuilder since it's only used as a parent reference
const mockEventModelBuilder = {} as RoundBuilder;

describe("StandingBuilder", () => {
  it("should build a StandingDbo with default values", () => {
    const standing = new StandingBuilder().build();

    expect(standing.id).toBeDefined();
    expect(standing.rank).toBeDefined();
    expect(standing.wins).toBeDefined();
    expect(standing.losses).toBeDefined();
    expect(standing.draws).toBeDefined();
    expect(standing.matchPoints).toBe(standing.wins * 3 + standing.draws);
  });

  it("should allow setting individual properties", () => {
    const standing = new StandingBuilder()
      .withId("team-001")
      .withRank(1)
      .withWins(8)
      .withLosses(1)
      .withDraws(1)
      .withMatchPoints(25)
      .build();

    expect(standing.id).toBe("team-001");
    expect(standing.rank).toBe(1);
    expect(standing.wins).toBe(8);
    expect(standing.losses).toBe(1);
    expect(standing.draws).toBe(1);
    expect(standing.matchPoints).toBe(25);
  });

  it("should update standings with match results", () => {
    const matches: MatchDbo[] = [
      {
        id: "match-1",
        isBye: false,
        teamIds: ["team-001", "team-002"],
        tableNumber: 1,
        results: {
          "team-001": { isBye: false, wins: 2, losses: 1, draws: 0 },
          "team-002": { isBye: false, wins: 1, losses: 2, draws: 0 }
        }
      },
      {
        id: "match-2",
        isBye: false,
        teamIds: ["team-001", "team-003"],
        tableNumber: 2,
        results: {
          "team-001": { isBye: false, wins: 1, losses: 1, draws: 1 },
          "team-003": { isBye: false, wins: 1, losses: 1, draws: 1 }
        }
      }
    ];

    const standing = new StandingBuilder()
      .withId("team-001")
      .withMatches(matches)
      .build();

    expect(standing.wins).toBe(1);
    expect(standing.losses).toBe(0);
    expect(standing.draws).toBe(1);
    expect(standing.matchPoints).toBe(4);
  });

  it ("should update standings with previous standings", () => {
    const previousStandings: StandingDbo[] = [
      {
        id: "team-001",
        rank: 10,
        wins: 3,
        losses: 2,
        draws: 1,
        matchPoints: 10,
        gameWinPercent: 0.723,
        opponentGameWinPercent: 0.654,
        opponentMatchWinPercent: 0.543
      },
      {
        id: "team-002",
        rank: 11,
        wins: 2,
        losses: 1,
        draws: 3,
        matchPoints: 9,
        gameWinPercent: 0.423,
        opponentGameWinPercent: 0.454,
        opponentMatchWinPercent: 0.243
      }
    ];

    const standing = new StandingBuilder()
      .withId("team-001")
      .withPreviousStandings(previousStandings)
      .build();

    expect(standing.wins).toBeGreaterThanOrEqual(3);
    expect(standing.losses).toBeGreaterThanOrEqual(2);
    expect(standing.draws).toBeGreaterThanOrEqual(1);
    expect(standing.matchPoints).toBeGreaterThanOrEqual(10);
  })

  it ("should update standings with previous standings and current matches", () => {
    const previousStandings: StandingDbo[] = [
      {
        id: "team-001",
        rank: 10,
        wins: 3,
        losses: 2,
        draws: 1,
        matchPoints: 10,
        gameWinPercent: 0.723,
        opponentGameWinPercent: 0.654,
        opponentMatchWinPercent: 0.543
      }
    ];

    const matches: MatchDbo[] = [
      {
        id: "match-1",
        isBye: false,
        teamIds: ["team-001", "team-003"],
        tableNumber: 2,
        results: {
          "team-001": { isBye: false, wins: 1, losses: 1, draws: 1 },
          "team-003": { isBye: false, wins: 1, losses: 1, draws: 1 }
        }
      }
    ]

    const standing = new StandingBuilder()
      .withId("team-001")
      .withPreviousStandings(previousStandings)
      .withMatches(matches)
      .build();

    expect(standing.wins).toBe(3);
    expect(standing.losses).toBe(2);
    expect(standing.draws).toBe(2);
    expect(standing.matchPoints).toBe(11);
  })

  it("should return to parent builder when calling end()", () => {
    const parent = new StandingBuilder(mockEventModelBuilder).end();
    expect(parent).toBe(mockEventModelBuilder);
  });
});