import type { RoundDbo } from "~/resources/domain/dbos/round.dbo"

export type TeamId = string;
export type TeamPairing = [TeamId, TeamId] | [TeamId];

export default class PairingSystem {
  constructor(private readonly sortedTeamIds: TeamId[]) {
    if (sortedTeamIds.length < 2) {
      throw new Error("Pairing system requires at least 2 teams.");
    }
  }

  generateSwissPairings(previousMatches: Set<TeamPairing>): TeamPairing[] {
    const paired: TeamPairing[] = [];
    const sorted = [...this.sortedTeamIds];

    if (sorted.length % 2 !== 0) {
      // Identify the team that has not received a bye yet
      const byeTeam = sorted.reverse().find(team =>
        previousMatches.has([team])
      );
      paired.push([byeTeam]);

      sorted.splice(sorted.indexOf(byeTeam), 1);
    }

    while (sorted.length > 1) {
      const team1 = sorted.shift();
      let team2Index = sorted.findIndex(t =>
        !previousMatches.has([team1,t]) &&
        !previousMatches.has([t,team1]))

      if (team2Index === -1) team2Index = 0;
      const team2 = sorted.splice(team2Index, 1)[0];
      paired.push([team1, team2]);
    }

    return paired;
  }

  generatePlayoffPairings(previousResults?: Record<TeamId, boolean>): TeamPairing[] {
    const pairedTeams: TeamPairing[] = [];
    const numTeams = this.sortedTeamIds.length;

    if (numTeams === 8) {
      // Quarterfinals: Fixed bracket pairing (1v8, 2v7, etc.)
      for (let i = 0; i < 4; i++) {
        pairedTeams.push([this.sortedTeamIds[i], this.sortedTeamIds[numTeams - 1 - i]]);
      }
    } else if (numTeams === 4 && previousResults) {
      // Semifinals: Pair winners from Quarterfinals
      const advancingTeams = this.sortedTeamIds.filter(team => previousResults[team]);
      if (advancingTeams.length === 4) {
        pairedTeams.push([advancingTeams[0], advancingTeams[1]]);
        pairedTeams.push([advancingTeams[2], advancingTeams[3]]);
      }
    } else if (numTeams === 2 && previousResults) {
      // Finals: Pair winners from Semifinals
      const advancingTeams = this.sortedTeamIds.filter(team => previousResults[team]);
      if (advancingTeams.length === 2) {
        pairedTeams.push([advancingTeams[0], advancingTeams[1]]);
      }
    }

    return pairedTeams;
  }

  static previousMatches(rounds: Pick<RoundDbo, "matches">[] | null): Set<TeamPairing> {
    const previousMatches = new Set<TeamPairing>();

    if (!rounds) {
      return previousMatches;
    }

    for (const round of rounds) {
      for (const match of Object.values(round.matches)) {
        if (!match.isBye) {
          previousMatches.add([match.teamIds[0], match.teamIds[1]]);
        } else {
          previousMatches.add([match.teamIds[0]]);
        }
      }
    }
    return previousMatches;
  }

  static lastResults(previousRounds: Pick<RoundDbo, "matches">[] | null): Record<TeamId, boolean> {
    const lastResults: Record<TeamId, boolean> = {};

    if (!previousRounds || previousRounds.length === 0) {
      return lastResults;
    }

    const lastRound = previousRounds[previousRounds.length - 1];

    for (const match of Object.values(lastRound.matches)) {
      const [team1, team2] = match.teamIds;
      lastResults[team1] = match.results[team1].wins > match.results[team1].losses;
      lastResults[team2] = match.results[team2].wins > match.results[team2].losses;
    }
    return lastResults;
  }
}