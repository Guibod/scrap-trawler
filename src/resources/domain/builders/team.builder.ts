import { faker } from "@faker-js/faker";
import type { TeamDbo } from "~/resources/domain/dbos/team.dbo"
import type EventModelBuilder from "~/resources/domain/builders/event.builder"
import { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"

export default class TeamBuilder {
  private team: Partial<TeamDbo> = {};
  private parentBuilder: EventModelBuilder;

  constructor(parent: EventModelBuilder) {
    this.parentBuilder = parent;
  }

  partial(data: Partial<TeamDbo>) {
    Object.assign(this.team, data);
    return this;
  }

  withId(id: string) {
    this.team.id = id;
    return this;
  }

  withDisplayName(displayName: string | null) {
    this.team.displayName = displayName;
    return this;
  }

  withStatus(status: PlayerStatusDbo) {
    this.team.status = status;
    return this;
  }

  withTableNumber(tableNumber: number | null) {
    this.team.tableNumber = tableNumber;
    return this;
  }

  withPlayers(players: string[]) {
    this.team.players = players;
    return this;
  }

  end() {
    return this.parentBuilder;
  }

  private fillMissingFields() {
    this.team.id ??= faker.string.uuid();
    this.team.displayName ??= faker.word.words(2);
    this.team.status ??= PlayerStatusDbo.IDENTIFIED;
    this.team.tableNumber ??= null;
    this.team.players ??= [];
  }

  build(): TeamDbo {
    this.fillMissingFields();
    return this.team as TeamDbo;
  }
}
