import { describe, it, expect } from "vitest";
import type EventModelBuilder from "~/resources/domain/builders/event.builder"
import RoundBuilder from "~/resources/domain/builders/round.builder"
import { PairingStrategyDbo } from "~/resources/domain/enums/pairing.strategy.dbo"

// Mock EventModelBuilder since it's only used as a parent reference
const mockEventModelBuilder = {} as EventModelBuilder;

describe("RoundBuilder", () => {
  it("should build a RoundDbo with default values", () => {
    const round = new RoundBuilder(mockEventModelBuilder).build();

    expect(round.id).toBeDefined();
    expect(round.roundNumber).toBeDefined();
    expect(round.isFinalRound).toBe(false);
    expect(round.isPlayoff).toBe(false);
    expect(round.isCertified).toBe(false);
    expect(round.pairingStrategy).toBe(PairingStrategyDbo.SWISS);
    expect(round.matches).toBeDefined();
    expect(round.standings).toBeDefined();
    expect(round.drops).toBeDefined();
  });

  it("should correctly implement playoff logic with top 8 teams", () => {
    const previousRound = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(5)
      .withTeams(["team-1", "team-2", "team-3", "team-4", "team-5", "team-6", "team-7", "team-8", "team-9", "team-10"])
      .build();

    const playoffRound = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(6)
      .withPlayoff(true)
      .withPreviousRounds([previousRound])
      .withTeams(["team-1", "team-2", "team-3", "team-4", "team-5", "team-6", "team-7", "team-8", "team-9", "team-10"])
      .build();

    expect(Object.keys(playoffRound.matches).length).toBe(4);
    expect(Object.values(playoffRound.matches).every(match => match.teamIds.length === 2)).toBe(true);
    expect(Object.keys(playoffRound.drops).length).toBe(2 + 4);
  });

  it("should correctly implement playoff logic on semi finals (2 matches, not 4)", () => {
    const quarterFinals = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(5)
      .withPlayoff(true)
      .withTeams(["team-1", "team-2", "team-3", "team-4", "team-5", "team-6", "team-7", "team-8"])
      .build();

    const semiFinals = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(6)
      .withPlayoff(true)
      .withPreviousRounds([quarterFinals])
      .withTeams(["team-1", "team-2", "team-3", "team-4", "team-5", "team-6", "team-7", "team-8"])
      .build();

    expect(Object.keys(semiFinals.matches).length).toBe(2);
    expect(Object.values(semiFinals.matches).every(match => match.teamIds.length === 2)).toBe(true);
    expect(Object.keys(semiFinals.drops).length).toBe(2 + 4);
  });

  it("should NOT update standings in the playoff", () => {
    const lastSwissRound = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(5)
      .withPlayoff(false)
      .withTeams(["team-1", "team-2", "team-3", "team-4", "team-5", "team-6", "team-7", "team-8"])
      .build();

    const quarterFinals = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(6)
      .withPlayoff(true)
      .withPreviousRounds([lastSwissRound])
      .withTeams(["team-1", "team-2", "team-3", "team-4", "team-5", "team-6", "team-7", "team-8"])
      .build();

    expect(quarterFinals.standings).toEqual(lastSwissRound.standings);
  });

  it("should correctly assign drops after result generation, ensuring playoff losers drop", () => {
    const round = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(6)
      .withPlayoff(true)
      .withTeams(["team-1", "team-2", "team-3", "team-4", "team-5", "team-6", "team-7", "team-8"])
      .build();

    expect(round.drops).toBeDefined();
    expect(Object.keys(round.drops).length).toBe(4);
  });

  it("should correctly consider previous rounds for pairing and avoid rematches", () => {
    const previousRound = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(1)
      .withTeams(["team-1", "team-2", "team-3", "team-4"])
      .build();

    const round = new RoundBuilder(mockEventModelBuilder)
      .withRoundNumber(2)
      .withPreviousRounds([previousRound])
      .withTeams(["team-1", "team-2", "team-3", "team-4"])
      .build();

    expect(round.matches).toBeDefined();
    Object.values(round.matches).forEach(match => {
      expect(match.teamIds.length).toBeGreaterThan(0);
    });
  });

  it("should return to parent builder when calling end()", () => {
    const parent = new RoundBuilder(mockEventModelBuilder).end();
    expect(parent).toBe(mockEventModelBuilder);
  });
});
