import { faker } from "@faker-js/faker";
import type { OverrideDbo, PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type EventModelBuilder from "~/resources/domain/builders/event.builder"
import { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"

export default class PlayerBuilder {
  private player: Partial<PlayerDbo> = {};
  private parentBuilder: EventModelBuilder;
  private identity: { firstName: string; lastName: string; displayName: string };
  private isGuest: boolean = false;

  constructor(parent: EventModelBuilder) {
    this.parentBuilder = parent;
    this.identity = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      displayName: ""
    };
    this.identity.displayName = faker.internet.displayName({
      firstName: this.identity.firstName,
      lastName: this.identity.lastName
    });
  }

  partial(data: Partial<PlayerDbo>) {
    Object.assign(this.player, data);
    return this;
  }

  withId(id: string) {
    this.player.id = id;
    return this;
  }

  withAvatar(avatar: string | null) {
    this.player.avatar = avatar;
    return this;
  }

  withIsAnonymized(isAnonymized: boolean) {
    this.player.isAnonymized = isAnonymized;
    return this;
  }

  withGuest() {
    this.isGuest = true;
    this.player.status = PlayerStatusDbo.GUEST;
    return this;
  }

  withArchetype(archetype: string | null) {
    this.player.archetype = archetype;
    return this;
  }

  withTournamentId(tournamentId: string) {
    this.player.tournamentId = tournamentId;
    return this;
  }

  withTeamId(teamId: string) {
    this.player.teamId = teamId;
    return this;
  }

  withDisplayName(displayName: string | null) {
    this.player.displayName = displayName;
    return this;
  }

  withFirstName(firstName: string | null) {
    this.player.firstName = firstName;
    return this;
  }

  withLastName(lastName: string | null) {
    this.player.lastName = lastName;
    return this;
  }

  withStatus(status: PlayerStatusDbo) {
    this.player.status = status;
    return this;
  }

  withTableNumber(tableNumber: number | null) {
    this.player.tableNumber = tableNumber;
    return this;
  }

  withOverrides(overrides: OverrideDbo | null) {
    this.player.overrides = overrides;
    return this;
  }

  end() {
    return this.parentBuilder;
  }

  private fillMissingFields() {
    this.player.id ??= faker.string.uuid();
    this.player.avatar ??= faker.image.avatar();
    this.player.isAnonymized ??= false;
    this.player.archetype ??= faker.word.words(2);
    this.player.tournamentId ??= faker.string.uuid();
    this.player.teamId ??= faker.string.uuid();
    this.player.tableNumber ??= null;

    if (this.player.isAnonymized || this.isGuest) {
      this.player.displayName = null;
      this.player.firstName = null;
      this.player.lastName = null;
    } else {
      this.player.displayName ??= this.identity.displayName;
      this.player.firstName ??= this.identity.firstName;
      this.player.lastName ??= this.identity.lastName;
    }

    if (!this.isGuest) {
      this.player.status ??= PlayerStatusDbo.IDENTIFIED;
    }

    this.player.overrides ??= {
      displayName: this.identity.displayName,
      firstName: this.identity.firstName,
      lastName: this.identity.lastName,
      archetype: faker.word.words(2),
      decklistUrl: null,
      decklistTxt: null,
    };
  }

  build(): PlayerDbo {
    this.fillMissingFields();
    return this.player as PlayerDbo;
  }
}