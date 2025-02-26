import type { PlayerStatusDbo } from "~resources/domain/enums/player.status.dbo"

export interface PlayerDbo {
  id: string  // wotc unique identifier
  isAnonymized: boolean
  archetype: string | null
  tournamentId: string  // internal id for the tournament
  teamId: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  status: PlayerStatusDbo
  tableNumber: number | null, // assigned table number
}