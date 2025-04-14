import { faker } from "@faker-js/faker"
import PlayerBuilder from "./player.builder"
import SpreadsheetBuilder from "./spreadsheet.builder"
import MappingDboBuilder from "./mapping.builder"
import RoundBuilder from "./round.builder"
import TeamBuilder from "./team.builder"
import OrganizerBuilder from "./organizer.builder"
import type { EventModel } from "~/resources/domain/models/event.model"
import { PairingStrategyDbo } from "~/resources/domain/enums/pairing.strategy.dbo"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import type { RoundDbo } from "~/resources/domain/dbos/round.dbo"
import DeckBuilder from "~/resources/domain/builders/deck.builder"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { SpreadsheetRowId } from "~/resources/domain/dbos/spreadsheet.dbo"

export default class EventBuilder {
  private event: Partial<EventModel> = {};
  private organizerBuilder: OrganizerBuilder;
  private playerBuilders: PlayerBuilder[] = [];
  private deckBuilders: DeckBuilder[] = [];
  private playoff: boolean = false;
  private playerRowMatching: Map<WotcId, SpreadsheetRowId> = new Map();

  constructor() {
    this.organizerBuilder = new OrganizerBuilder(this);
  }

  static get anEvent() {
    return new EventBuilder();
  }

  partial(data: Partial<EventModel>) {
    Object.assign(this.event, data);
    return this;
  }

  withId(id: string) {
    this.event.id = id;
    return this;
  }

  withTitle(title: string) {
    this.event.title = title;
    return this;
  }

  withDate(date: Date) {
    this.event.date = date;
    return this;
  }

  withPlayoff(playoff: boolean) {
    this.playoff = playoff;
    return this;
  }

  withPlayers(count: number) {
    for (let i = 0; i < count; i++) {
      this.playerBuilders.push(new PlayerBuilder(this));
    }
    return this;
  }

  withDecks(count: number) {
    for (let i = 0; i < count; i++) {
      this.deckBuilders.push(new DeckBuilder(this));
    }
    return this;
  }

  withWotcIdToRowIdMapping(wotcId: WotcId, rowId: SpreadsheetRowId) {
    this.playerRowMatching.set(wotcId, rowId);
    return this;
  }

  organizer() {
    return this.organizerBuilder;
  }

  player() {
    const builder = new PlayerBuilder(this);
    this.playerBuilders.push(builder);
    return builder;
  }

  deck() {
    const builder = new DeckBuilder(this);
    this.deckBuilders.push(builder);
    return builder;
  }

  private inferRounds(players: number): number {
    return Math.ceil(Math.log2(players));
  }

  private fillMissingFields() {
    this.event.id ??= faker.string.uuid();
    this.event.title ??= faker.lorem.words(3);
    this.event.date ??= faker.date.future();
    this.event.organizer ??= this.organizerBuilder.build();

    const players = Object.values(this.event.players)
    const decksRowIds = Object.values(this.event.decks).map(deck => deck.spreadsheetRowId);

    // Infer number of rounds
    const roundsCount = this.inferRounds(players.length);

    // Team building ;)
    const teams = Object.fromEntries(players.map((p) => {
      return [p.teamId, new TeamBuilder(this).withId(p.teamId).withPlayers([p.id]).build()];
    }));
    this.event.teams = teams

    // Build spreadsheet & mapping
    const spreadsheet = new SpreadsheetBuilder().withDimension(10, players.length).withRowIds(decksRowIds).build();
    this.event.spreadsheet = spreadsheet;

    const mapping = new MappingDboBuilder().withPlayersAndSpreadsheet(players, spreadsheet.data, this.playerRowMatching).build();
    this.event.mapping = mapping;

    // Build rounds with previous rounds reference
    const rounds = Array.from({ length: roundsCount }).reduce((acc, _, roundIndex) => {
      const previousRounds = Object.values(acc);
      const round = new RoundBuilder(this)
        .withRoundNumber(roundIndex + 1)
        .withPreviousRounds(previousRounds)
        .withPairingStrategy(PairingStrategyDbo.SWISS)
        .withTeams(Object.values(players).map(p => p.teamId))
        .build();
      acc[round.roundNumber] = round;
      return acc;
    }, {} as Record<number, RoundDbo>) as Record<number, RoundDbo>;

    // Add playoff rounds if needed
    if (this.playoff) {
      const playoffRounds = Array.from({ length: 3 }).reduce((acc, _, roundIndex) => {
        const previousRounds = Object.values(acc);
        const round = new RoundBuilder(this)
          .withRoundNumber(roundIndex + 1 + roundsCount)
          .withPreviousRounds(previousRounds)
          .withPairingStrategy(PairingStrategyDbo.SWISS)
          .withPlayoff(true)
          .withTeams(Object.values(players).map(p => p.teamId))
          .build();
        acc[round.roundNumber] = round;
        return acc;
      }, rounds as Record<number, RoundDbo>);

      Object.assign(rounds, playoffRounds);
    }
    this.event.rounds = rounds;

    this.event.status ??= { global: GlobalStatus.COMPLETED, scrape: ScrapeStatus.COMPLETED_ENDED, pair: PairStatus.COMPLETED, fetch: FetchStatus.COMPLETED };
    this.event.lastUpdated ??= new Date();
    this.event.lastScrapedAt ??= new Date();
    this.event.lastRound ??= Object.keys(rounds).length;
  }

  build(): EventModel {
    if (this.playerBuilders.length < 8) {
      this.withPlayers(8 - this.playerBuilders.length);
    }

    this.event.players = Object.fromEntries(
      this.playerBuilders.map(builder => {
        const player = builder.build();
        return [player.id, player];
      })
    );

    this.event.decks = Object.fromEntries(
      this.deckBuilders.map(builder => {
        const deck = builder.build();
        return [deck.id, deck];
      })
    );

    this.fillMissingFields();
    return this.event as EventModel;
  }
}