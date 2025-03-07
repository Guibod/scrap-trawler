import { faker } from "@faker-js/faker";
import type { MatchDbo } from "~resources/domain/dbos/match.dbo"
import type EventModelBuilder from "~resources/domain/builders/event.builder"

export default class MatchBuilder {
  private match: Partial<MatchDbo> = {};
  private parentBuilder: EventModelBuilder;

  constructor(parent: EventModelBuilder | null = null) {
    this.parentBuilder = parent;
    this.match.teamIds = [];
    this.match.results = {};
  }

  partial(data: Partial<MatchDbo>) {
    Object.assign(this.match, data);
    return this;
  }

  withId(id: string) {
    this.match.id = id;
    return this;
  }

  withTableNumber(tableNumber: number) {
    this.match.tableNumber = tableNumber;
    return this;
  }

  withBye(teamId: string) {
    this.match.teamIds = [teamId];
    this.match.isBye = true;
    this.match.results[teamId] = { isBye: true, wins: 2, losses: 0, draws: 0 };
    return this;
  }

  withResult(teamIds: string[], wins: number, losses: number, draws: number = 0) {
    if (teamIds.length !== 2) {
      throw new Error("Results can only be set when there are exactly 2 teams.");
    }
    this.match.teamIds = teamIds;
    const [team1, team2] = this.match.teamIds;
    this.match.results[team1] = { isBye: false, wins, losses, draws };
    this.match.results[team2] = { isBye: false, wins: losses, losses: wins, draws };
    return this;
  }

  withRandomResult(teamIds: string[], isPlayoff: boolean = false) {
    if (teamIds.length === 1) {
      return this.withBye(teamIds[0]);
    }

    if (teamIds.length !== 2) {
      throw new Error("Results can only be set when there are exactly 2 teams.");
    }

    this.match.teamIds = teamIds;
    const [team1, team2] = this.match.teamIds;

    let wins = faker.number.int({ min: 0, max: 2 });
    let losses = 2 - wins;
    if (isPlayoff && wins == losses) {
      wins++
    }

    this.match.results[team1] = { isBye: false, wins, losses, draws: 0 };
    this.match.results[team2] = { isBye: false, wins: losses, losses: wins, draws: 0 };
    return this;
  }

  withIntentionalDraw(teamIds: string[]) {
    if (teamIds.length !== 2) {
      throw new Error("Intentional draws can only occur in matches with 2 teams.");
    }
    this.match.teamIds = teamIds;
    const [team1, team2] = this.match.teamIds;
    this.match.results[team1] = { isBye: false, wins: 0, losses: 0, draws: 3 };
    this.match.results[team2] = { isBye: false, wins: 0, losses: 0, draws: 3 };
    return this;
  }

  end() {
    return this.parentBuilder;
  }

  private fillMissingFields() {
    this.match.id ??= faker.string.uuid();
    this.match.tableNumber ??= faker.number.int({ min: 1, max: 100 });
    this.match.isBye ??= this.match.teamIds.length === 1;
    if (!this.match.results || Object.keys(this.match.results).length === 0) {
      if (this.match.isBye) {
        this.match.results[this.match.teamIds[0]] = { isBye: true, wins: 2, losses: 0, draws: 0 };
      } else {
        this.withRandomResult([
          faker.number.int({ min: 1, max: 100 }).toString(),
          faker.number.int({ min: 1, max: 100 }).toString()
        ]);
      }
    }
  }

  build(): MatchDbo {
    this.fillMissingFields();
    return this.match as MatchDbo;
  }
}