import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"
import type { PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import type { DeckDbo } from "~/resources/domain/dbos/deck.dbo"

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
  extra: Record<string, string>
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
    }
  }
}