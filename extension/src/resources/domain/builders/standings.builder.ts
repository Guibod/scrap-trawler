import { faker } from "@faker-js/faker";
import type { StandingDbo } from "~/resources/domain/dbos/standing.dbo"
import type { MatchDbo } from "~/resources/domain/dbos/match.dbo"
import type RoundBuilder from "~/resources/domain/builders/round.builder"

export default class StandingBuilder {
  private standing: Partial<StandingDbo> = {};
  private parentBuilder: RoundBuilder;

  constructor(parent: RoundBuilder | null = null) {
    this.parentBuilder = parent;
  }

  partial(data: Partial<StandingDbo>) {
    Object.assign(this.standing, data);
    return this;
  }

  withId(id: string) {
    this.standing.id = id;
    return this;
  }

  withRank(rank: number) {
    this.standing.rank = rank;
    return this;
  }

  withWins(wins: number) {
    this.standing.wins = wins;
    return this;
  }

  withLosses(losses: number) {
    this.standing.losses = losses;
    return this;
  }

  withDraws(draws: number) {
    this.standing.draws = draws;
    return this;
  }

  withMatchPoints(matchPoints: number) {
    this.standing.matchPoints = matchPoints;
    return this;
  }

  withGameWinPercent(gameWinPercent: number) {
    this.standing.gameWinPercent = gameWinPercent;
    return this;
  }

  withOpponentGameWinPercent(opponentGameWinPercent: number) {
    this.standing.opponentGameWinPercent = opponentGameWinPercent;
    return this;
  }

  withOpponentMatchWinPercent(opponentMatchWinPercent: number) {
    this.standing.opponentMatchWinPercent = opponentMatchWinPercent;
    return this;
  }

  withPreviousStandings(standings: StandingDbo[]) {
    const previousStanding = standings.find(s => s.id === this.standing.id);

    if (previousStanding) {
      this.standing.wins = (this.standing.wins ?? 0) + previousStanding.wins;
      this.standing.losses = (this.standing.losses ?? 0) + previousStanding.losses;
      this.standing.draws = (this.standing.draws ?? 0) + previousStanding.draws;
      this.standing.matchPoints = (this.standing.matchPoints ?? 0) + previousStanding.matchPoints;
    }

    return this;
  }

  withMatches(results: MatchDbo[]) {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let matchPoints = 0;

    // no need to calculate match points for playoff rounds
    results.forEach((match) => {
      if (!match.results[this.standing.id]) return; // Skip if the team isn't part of the match

      const result = match.results[this.standing.id];
      if (result.wins > result.losses) {
        wins += 1;
        matchPoints += 3
      } else if (result.losses > result.wins) {
        losses += 1
      } else {
        draws += 1;
        matchPoints += 1
      }
    });

    this.standing.wins = (this.standing.wins ?? 0) + wins;
    this.standing.losses = (this.standing.losses ?? 0) + losses;
    this.standing.draws = (this.standing.draws ?? 0) + draws;
    this.standing.matchPoints = (this.standing.matchPoints ?? 0) + matchPoints;

    return this;
  }

  end() {
    return this.parentBuilder;
  }

  private fillMissingFields() {
    this.standing.id ??= faker.string.uuid();
    this.standing.rank ??= faker.number.int({ min: 1, max: 100 });
    this.standing.wins ??= faker.number.int({ min: 0, max: 10 });
    this.standing.losses ??= faker.number.int({ min: 0, max: 10 });
    this.standing.draws ??= faker.number.int({ min: 0, max: 5 });
    this.standing.matchPoints ??= this.standing.wins * 3 + this.standing.draws;
    this.standing.gameWinPercent ??= parseFloat(faker.number.float({ min: 0.3, max: 1.0 }).toFixed(2));
    this.standing.opponentGameWinPercent ??= parseFloat(faker.number.float({ min: 0.3, max: 1.0 }).toFixed(2));
    this.standing.opponentMatchWinPercent ??= parseFloat(faker.number.float({ min: 0.3, max: 1.0 }).toFixed(2));
  }

  build(): StandingDbo {
    this.fillMissingFields();
    return this.standing as StandingDbo;
  }
}
