import { describe, it, expect } from "vitest";
import PairingSystem, { type TeamPairing } from "./pairing"
import type { RoundDbo } from "~resources/domain/dbos/round.dbo"
import MatchBuilder from "~resources/domain/builders/match.builder"


describe("PairingSystem", () => {
  describe("Swiss rounds", () => {
    it("should generate valid Swiss pairings", () => {
      const teams = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const previousMatches = new Set<TeamPairing>();
      const pairingSystem = new PairingSystem(teams);

      const pairings = pairingSystem.generateSwissPairings(previousMatches);
      expect(pairings.length).toBe(4);
    });

    it("should handle bye rounds correctly in Swiss pairings", () => {
      const teams = ["A", "B", "C", "D", "E"]; // Odd number of teams
      const previousMatches = new Set<TeamPairing>();
      const pairingSystem = new PairingSystem(teams);

      const pairings = pairingSystem.generateSwissPairings(previousMatches);
      expect(pairings.length).toBe(3);
      expect(pairings.some(p => p.length === 1)).toBe(true); // One team gets a bye
    });
  })

  it("should generate correct Quarterfinal pairings for Top 8", () => {
    const teams = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const pairingSystem = new PairingSystem(teams);

    const pairings = pairingSystem.generatePlayoffPairings();
    expect(pairings).toEqual([
      ["1", "8"],
      ["2", "7"],
      ["3", "6"],
      ["4", "5"]
    ]);
  });

  it("should generate correct Semifinal pairings from Quarterfinal results", () => {
    const teams = ["1", "2", "3", "4"];
    const previousResults = { "1": true, "2": true, "3": true, "4": true };
    const pairingSystem = new PairingSystem(teams);

    const pairings = pairingSystem.generatePlayoffPairings(previousResults);
    expect(pairings).toEqual([
      ["1", "2"],
      ["3", "4"]
    ]);
  });

  it("should generate correct Final pairing from Semifinal results", () => {
    const teams = ["1", "2"];
    const previousResults = { "1": true, "2": true };
    const pairingSystem = new PairingSystem(teams);

    const pairings = pairingSystem.generatePlayoffPairings(previousResults);
    expect(pairings).toEqual([
      ["1", "2"]
    ]);
  });

  describe("should helps translating previous rounds to a set of matches", () => {
    it("with a pretty simple example", () => {
      const rounds: Pick<RoundDbo, "matches">[] = [
        {
          matches: {
            a: new MatchBuilder().withRandomResult(["1", "2"]).build(),
            b: new MatchBuilder().withRandomResult(["3", "4"]).build(),
            c: new MatchBuilder().withRandomResult(["5", "6"]).build(),
            d: new MatchBuilder().withRandomResult(["7", "8"]).build(),
          }
        },
        {
          matches: {
            e: new MatchBuilder().withRandomResult(["1", "5"]).build(),
            f: new MatchBuilder().withRandomResult(["2", "6"]).build(),
            g: new MatchBuilder().withRandomResult(["3", "7"]).build(),
            h: new MatchBuilder().withRandomResult(["4", "8"]).build(),
          }
        }
      ]

      const previousMatches = PairingSystem.previousMatches(rounds);
      expect(previousMatches).toEqual(new Set([
        ["1", "2"],
        ["3", "4"],
        ["5", "6"],
        ["7", "8"],
        ["1", "5"],
        ["2", "6"],
        ["3", "7"],
        ["4", "8"],
      ]));
    })

    it("with a bye round", () => {
      const rounds: Pick<RoundDbo, "matches">[] = [
        {
          matches: {
            a: new MatchBuilder().withRandomResult(["1", "2"]).build(),
            b: new MatchBuilder().withRandomResult(["3", "4"]).build(),
            c: new MatchBuilder().withRandomResult(["5", "6"]).build(),
            d: new MatchBuilder().withBye("7").build(),
          }
        },
        {
          matches: {
            e: new MatchBuilder().withRandomResult(["1", "5"]).build(),
            f: new MatchBuilder().withRandomResult(["2", "6"]).build(),
            g: new MatchBuilder().withRandomResult(["3", "7"]).build(),
            h: new MatchBuilder().withBye("4").build(),
          }
        }
      ]

      const previousMatches = PairingSystem.previousMatches(rounds);
      expect(previousMatches).toEqual(new Set([
        ["1", "2"],
        ["3", "4"],
        ["5", "6"],
        ["7"],
        ["1", "5"],
        ["2", "6"],
        ["3", "7"],
        ["4"],
      ]));
    })
  })

  it("should helps translating previous round to results", () => {
    const rounds: Pick<RoundDbo, "matches">[] = [
      {
        matches: {
          a: new MatchBuilder().withResult(["1", "2"], 2, 0).build(),
          b: new MatchBuilder().withResult(["3", "4"], 1, 0).build(),
        }
      },
      {
        matches: {
          e: new MatchBuilder().withResult(["1", "3"], 2, 0).build(),
          f: new MatchBuilder().withResult(["2", "4"], 0, 1).build(),
        }
      }
    ]

    const playoffResults = PairingSystem.lastResults(rounds);
    expect(playoffResults).toEqual({
      "1": true,
      "2": false,
      "3": false,
      "4": true,
    });
  })
});
