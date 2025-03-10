import type { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"

export interface OverrideDbo {
  displayName: string | null
  firstName: string | null
  lastName: string | null
  archetype: string | null
}

export interface PlayerDbo {
  id: WotcId
  avatar: string | null
  isAnonymized: boolean
  archetype: string | null
  tournamentId: string  // internal id for the tournament
  teamId: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  status: PlayerStatusDbo
  tableNumber: number | null // assigned table number
  overrides: OverrideDbo | null // manual overrides
}