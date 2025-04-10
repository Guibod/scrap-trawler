import type { SpreadsheetRow, SpreadsheetRowId } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"
import type { PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import type { DeckDbo } from "~/resources/domain/dbos/deck.dbo"
import type { ResultDbo } from "~/resources/domain/dbos/result.dbo"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type { StandingDbo } from "~/resources/domain/dbos/standing.dbo"

export type PlayerProfile = {
  id: WotcId
  avatar: string
  isAnonymized: boolean
  isOverride: boolean
  archetype: string | null
  tournamentId: string  // internal id for the tournament
  teamId: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  status: PlayerStatusDbo
  tableNumber: number | null // assigned table number
  mapMode: PairingMode
  spreadsheetRowId: SpreadsheetRowId
  spreadsheetRow: SpreadsheetRow | null
  decklistUrl: string | null
  decklistTxt: string | null
  deck: DeckDbo | null
  matches: PlayerMatch[],
  standings: Record<string, StandingDbo>,
  extra: Record<string, string>
}

type PlayerMatch = {
  matchId: string
  round: number
  tableNumber: number
  result: ResultDbo
  opponentTeamId: string
  opponentPlayerIds: string[]
}

export class PlayerMapper {
  static toProfile(event: EventModel, playerId: WotcId): PlayerProfile {
    const player = this.getPlayerOrThrow(event, playerId)
    const rowId = event.mapping?.[playerId]?.rowId ?? null
    const row = this.findSpreadsheetRow(event, rowId)
    const deck = this.findPlayerDeck(event, rowId)
    const avatar = this.resolveAvatar(deck?.face, playerId)
    const matches = PlayerMapper.getPlayerMatches(event, player)
    const standings = this.buildStandings(event, player)

    return {
      ...player,
      avatar,
      spreadsheetRowId: rowId,
      spreadsheetRow: row,
      isOverride: player.overrides !== null,
      displayName: player.overrides?.displayName ?? player.displayName,
      firstName: player.overrides?.firstName ?? row?.firstName ?? player.firstName,
      lastName: player.overrides?.lastName ?? row?.lastName ?? player.lastName,
      archetype: player.overrides?.archetype ?? deck?.archetype ?? row?.archetype ?? player.archetype,
      decklistUrl: player.overrides?.decklistUrl ?? row?.decklistUrl,
      decklistTxt: player.overrides?.decklistTxt ?? row?.decklistTxt,
      mapMode: event.mapping?.[playerId]?.mode ?? null,
      extra: row?.player ?? null,
      deck,
      matches: matches ?? [],
      standings,
    }
  }

  static getPlayerMatches(event: EventModel, player: PlayerDbo): PlayerMatch[] {
    const playerTeamId = player.teamId
    const rounds = Object.values(event.rounds ?? {})

    const matches: PlayerMatch[] = []

    for (const round of rounds) {
      for (const match of Object.values(round.matches ?? {})) {
        if (!match.teamIds.includes(playerTeamId)) continue

        const opponentTeamId = match.teamIds.find(tid => tid !== playerTeamId) ?? playerTeamId
        const opponentPlayerIds = event.teams[opponentTeamId].players

        const result = match.results[playerTeamId] ?? {
          isBye: true,
          wins: 0,
          losses: 0,
          draws: 0,
        }

        matches.push({
          matchId: match.id,
          round: round.roundNumber,
          tableNumber: match.tableNumber,
          result,
          opponentTeamId,
          opponentPlayerIds
        })
      }
    }

    return matches
  }

  private static getPlayerOrThrow(event: EventModel, playerId: WotcId): PlayerDbo {
    const player = event.players[playerId]
    if (!player) throw new Error(`Player ${playerId} not found in event`)
    return player
  }

  private static findSpreadsheetRow(event: EventModel, rowId?: string | null): SpreadsheetRow | null {
    return rowId ? event.spreadsheet?.data?.find(row => row.id === rowId) ?? null : null
  }

  private static findPlayerDeck(event: EventModel, rowId?: string | null): DeckDbo | null {
    return rowId ? Object.values(event.decks ?? {}).findLast(deck => deck.spreadsheetRowId === rowId) ?? null : null
  }

  private static resolveAvatar(face: string | undefined, playerId: WotcId): string {
    return face
      ? `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(face)}&format=image&version=art_crop`
      : `https://api.dicebear.com/7.x/identicon/svg?seed=${playerId}`
  }

  private static buildStandings(event: EventModel, player: PlayerDbo): Record<string, StandingDbo> {
    return Object.fromEntries(
      Object.entries(event.rounds).map(([roundId, round]) => [
        roundId,
        round.standings[player.teamId] ?? null,
      ])
    )
  }
}