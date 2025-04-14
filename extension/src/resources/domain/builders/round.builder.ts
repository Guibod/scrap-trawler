import { faker } from "@faker-js/faker";
import MatchBuilder from "./match.builder";
import type { RoundDbo } from "~/resources/domain/dbos/round.dbo"
import type EventModelBuilder from "~/resources/domain/builders/event.builder"
import { PairingStrategyDbo } from "~/resources/domain/enums/pairing.strategy.dbo"
import StandingBuilder from "~/resources/domain/builders/standings.builder"
import PairingSystem, { type TeamPairing } from "~/resources/domain/pairing"

export default class RoundBuilder {
  private round: Partial<RoundDbo> = {};
  private parentBuilder: EventModelBuilder;
  private previousRounds: RoundDbo[] | null = null;

  constructor(parent: EventModelBuilder) {
    this.parentBuilder = parent;
    this.round.matches = {};
    this.round.standings = {};
    this.round.drops = {};
  }

  partial(data: Partial<RoundDbo>) {
    Object.assign(this.round, data);
    return this;
  }

  withId(id: string) {
    this.round.id = id;
    return this;
  }

  withRoundNumber(roundNumber: number) {
    this.round.roundNumber = roundNumber;
    return this;
  }

  withFinalRound(isFinal: boolean) {
    this.round.isFinalRound = isFinal;
    return this;
  }

  withPlayoff(isPlayoff: boolean) {
    this.round.isPlayoff = isPlayoff;
    return this;
  }

  withCertified(isCertified: boolean) {
    this.round.isCertified = isCertified;
    return this;
  }

  withPairingStrategy(pairingStrategy: PairingStrategyDbo) {
    this.round.pairingStrategy = pairingStrategy;
    return this;
  }

  withPreviousRounds(previousRounds: RoundDbo[]) {
    if (previousRounds.length) {
      this.previousRounds = previousRounds;
    }
    return this;
  }

  withTeamDrop(teamId: string) {
    this.round.drops![teamId] = { id: teamId, roundNumber: this.round.roundNumber! };
    return this;
  }

  withTeams(teamIds: string[]) {
    this.generatePairings(teamIds);
    this.generateStandings(teamIds);
    this.generateDrops();
    return this;
  }

  private cutTop8(teamIds: string[]): string[] {
    if (!this.previousRounds || this.previousRounds.length === 0) return teamIds;

    const lastRound = this.previousRounds[this.previousRounds.length - 1];
    if (Object.keys(lastRound.standings).length === 0) {
      lastRound.standings = Object.fromEntries(teamIds.map(id => [id, new StandingBuilder(this).withId(id).build()]));
    }

    const sortedTeams = Object.values(lastRound.standings || {})
      .sort((a, b) => a.rank - b.rank)

    const top8 = sortedTeams.slice(0, 8).map(s => s.id);

    const removedTeams = sortedTeams.slice(8).map(s => s.id);
    removedTeams.forEach(teamId => {
      if (teamId in this.round.drops!) return;
      this.round.drops![teamId] = { id: teamId, roundNumber: this.round.roundNumber! };
    });

    return top8;
  }

  private generateDrops() {
    const drops = { ... this.round.drops };
    if (this.previousRounds) {
      for (const round of this.previousRounds) {
        Object.values(round.drops).forEach(drop => {
          drops[drop.id] = { id: drop.id, roundNumber: drop.roundNumber };
        });
      }
    }
    this.round.drops = drops

    const activeDrops = new Set(Object.keys(drops))

    Object.values(this.round.matches!).forEach(match => {
      match.teamIds.forEach(teamId => {
        if (activeDrops.has(teamId)) {
          return
        }

        const result = match.results[teamId];
        if (this.round.isPlayoff && result.losses > result.wins) {
          this.round.drops![teamId] = { id: teamId, roundNumber: this.round.roundNumber! };
          return
        }
      });
    });
  }

  private generatePairings(teamIds: string[]) {
    const drops = {}
    if (this.previousRounds) {
      for (const round of this.previousRounds) {
        Object.values(round.drops).forEach(drop => {
          drops[drop.id] = { id: drop.id, roundNumber: drop.roundNumber };
        });
      }
    }

    if (this.round.isPlayoff) {
      teamIds = this.cutTop8(teamIds)
    }
    const activeTeams = teamIds.filter(id => !(id in drops!));

    const lastPreviousRound = this.previousRounds ? this.previousRounds[this.previousRounds.length - 1] : null;
    const lastStandings = (lastPreviousRound?.standings ? Object.values(lastPreviousRound?.standings) : []);
    let sortedTeams = activeTeams.map(id => ({
      id,
      standing: lastStandings.find(value => value.id === id)?.rank || faker.number.int({ min: 0, max: 30 })
    }));

    if (this.previousRounds) {
      sortedTeams.sort((a, b) => b.standing - a.standing);
    } else {
      sortedTeams = faker.helpers.shuffle(sortedTeams);
    }

    let pairedTeams: TeamPairing[] = [];
    const pairer = new PairingSystem(sortedTeams.map(t => t.id));
    if (this.round.isPlayoff) {
      pairedTeams = pairer.generatePlayoffPairings(PairingSystem.lastResults(this.previousRounds))
    } else {
      pairedTeams = pairer.generateSwissPairings(PairingSystem.previousMatches(this.previousRounds));
    }

    pairedTeams.forEach((pair, index) => {
      const match = new MatchBuilder(this.parentBuilder)
        .withTableNumber(index + 1)
        .withRandomResult(pair, this.round.isPlayoff)
        .build();
      this.round.matches![match.id] = match;
    });
  }

  private generateStandings(teamIds: string[]) {
    const previousStandings = this.previousRounds
      ? this.previousRounds[this.previousRounds.length - 1].standings
      : {};

    if (this.round.isPlayoff) {
      this.round.standings = previousStandings
      return
    }

    const standings = teamIds.map((teamId) => {
      return new StandingBuilder(this)
        .withId(teamId)
        .withPreviousStandings(Object.values(previousStandings))
        .withMatches(Object.values(this.round.matches))
        .build()
    })

    this.round.standings = Object.fromEntries(
      standings.sort((a, b) => {
        if (a.matchPoints === b.matchPoints) {
          if (a.gameWinPercent === b.gameWinPercent) {
            return b.opponentMatchWinPercent - a.opponentMatchWinPercent;
          }
          return a.gameWinPercent - b.gameWinPercent;
        }
        return b.matchPoints - a.matchPoints;
      }).map((standing, index) => {
        return [index + 1, {...standing, rank: index + 1}];
      })
    )
  }

  end() {
    return this.parentBuilder;
  }

  private fillMissingFields() {
    this.round.id ??= faker.string.uuid();
    this.round.roundNumber ??= faker.number.int({ min: 1, max: 10 });
    this.round.isFinalRound ??= false;
    this.round.isPlayoff ??= false;
    this.round.isCertified ??= false;
    this.round.pairingStrategy ??= PairingStrategyDbo.SWISS;
  }

  build(): RoundDbo {
    this.fillMissingFields();
    return this.round as RoundDbo;
  }
}