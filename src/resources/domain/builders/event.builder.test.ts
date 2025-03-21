import { describe, it, expect } from "vitest";
import EventBuilder from "~/resources/domain/builders/event.builder"
import { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"


describe("EventBuilder", () => {
  it("should build an event with default values", () => {
    const event = new EventBuilder().build();

    expect(event.id).toBeDefined();
    expect(event.title).toBeDefined();
    expect(event.date).toBeInstanceOf(Date);
    expect(event.organizer).toBeDefined();
    expect(event.players).toBeDefined();
    expect(event.teams).toBeDefined();
    expect(event.status).toStrictEqual({
      global: GlobalStatus.COMPLETED,
      pair: PairStatus.COMPLETED,
      fetch: FetchStatus.COMPLETED,
      scrape: ScrapeStatus.COMPLETED
    });
    expect(event.rounds).toBeDefined();
    expect(event.mapping).toBeDefined();
    expect(event.spreadsheet).toBeDefined();
    expect(event.scrapeStatus).toBe(EventScrapeStateDbo.COMPLETE);
    expect(event.lastUpdated).toBeInstanceOf(Date);
  });

  it("should correctly handle the playoff flag", () => {
    const event = new EventBuilder().withPlayoff(true).build();
    const totalRounds = Object.keys(event.rounds).length;

    expect(totalRounds).toBeGreaterThan(3); // Should include playoff rounds
  });

  it("should allow setting a custom player count", () => {
    const event = new EventBuilder().withPlayers(16).build();
    expect(Object.keys(event.players)).toHaveLength(16);
  });

  describe("should correctly build rounds depending on the number of players", () => {
    it("3 rounds for 8 players, without playoff", () => {
      const event = new EventBuilder().withPlayers(8).withPlayoff(false).build();

      expect(Object.keys(event.rounds)).toHaveLength(3);
      expect(Object.keys(event.rounds[3].matches)).toHaveLength(4);
    })
    it("6 rounds for 8 players, with playoff", () => {
      const event = new EventBuilder().withPlayers(8).withPlayoff(true).build();

      expect(Object.keys(event.rounds)).toHaveLength(6);
      expect(Object.keys(event.rounds[3].matches)).toHaveLength(4);
      expect(Object.keys(event.rounds[3].drops)).toHaveLength(0);

      expect(Object.keys(event.rounds[4].matches)).toHaveLength(4);
      expect(Object.keys(event.rounds[4].drops)).toHaveLength(4);

      expect(Object.keys(event.rounds[5].matches)).toHaveLength(2);
      expect(Object.keys(event.rounds[5].drops)).toHaveLength(6);

      expect(Object.keys(event.rounds[6].matches)).toHaveLength(1);
      expect(Object.keys(event.rounds[6].drops)).toHaveLength(7);
    })

    it("6 rounds for 64 players, without playoff", () => {
      const event = new EventBuilder().withPlayers(64).withPlayoff(false).build();

      expect(Object.keys(event.rounds)).toHaveLength(6);
      expect(Object.keys(event.rounds[6].matches)).toHaveLength(32);
    })

    it("9 rounds for 64 players, with playoff", () => {
      const event = new EventBuilder().withPlayers(64).withPlayoff(true).build();

      expect(Object.keys(event.rounds)).toHaveLength(9);
      expect(Object.keys(event.rounds[6].matches)).toHaveLength(32);
      expect(Object.keys(event.rounds[6].drops).length).toBeLessThan(10);

      expect(Object.keys(event.rounds[7].matches)).toHaveLength(4);
      expect(Object.keys(event.rounds[7].drops)).toHaveLength(56 + 4);

      expect(Object.keys(event.rounds[8].matches)).toHaveLength(2);
      expect(Object.keys(event.rounds[8].drops)).toHaveLength(56 + 4 + 2);

      expect(Object.keys(event.rounds[9].matches)).toHaveLength(1);
      expect(Object.keys(event.rounds[9].drops)).toHaveLength(56 + 4 + 2 + 1);
    })

  });

  it("should generate teams corresponding to players", () => {
    const event = new EventBuilder().withPlayers(10).withDecks(10).build();
    expect(Object.keys(event.teams)).toHaveLength(10);
    expect(Object.entries(event.teams)
      .map(([_, team]) => team.players[0]))
      .toEqual(Object.keys(event.players));
  });
});