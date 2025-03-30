import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"
import type { PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import type { DeckDbo } from "~/resources/domain/dbos/deck.dbo"
import type { ResultDbo } from "~/resources/domain/dbos/result.dbo"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"

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
  deck: DeckDbo | null
  matches: PlayerMatch[]
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
    const player = event.players[playerId]
    if (!player) {
      throw new Error(`Player ${playerId} not found in event`)
    }

    const rowId = event.mapping?.[playerId]?.rowId
    const row : SpreadsheetRow | null = event.spreadsheet?.data?.find((row) => row.id == rowId) ?? null

    const deck = Object.values(event.decks ?? {}).find(
      (deck) => deck.spreadsheetRowId === rowId
    )

    let avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${playerId}`
    if (deck?.face) {
      const encodedName = encodeURIComponent(deck.face);
      avatar = `https://api.scryfall.com/cards/named?exact=${encodedName}&format=image&version=art_crop`
    }

    const matches = PlayerMapper.getPlayerMatches(event, player)

    return {
      ...player,
      avatar,
      isOverride: player.overrides !== null,
      displayName: player.overrides?.displayName ?? player.displayName,
      firstName: player.overrides?.firstName ?? row?.firstName ?? player.firstName,
      lastName: player.overrides?.lastName ?? row?.lastName ?? player.lastName,
      archetype: player.overrides?.archetype ?? deck?.archetype ?? row?.archetype ?? player.archetype,
      mapMode: event.mapping?.[playerId]?.mode ?? null,
      extra: row?.player ?? null,
      deck: deck ?? null,
      matches: matches ?? []
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
}