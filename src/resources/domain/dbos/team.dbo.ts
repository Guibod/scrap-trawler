import type { PlayerStatusDbo } from "~resources/domain/enums/player.status.dbo"

export interface TeamDbo {
  id: string  // internal id for the tournament
  displayName: string | null
  status: PlayerStatusDbo
  tableNumber: number | null, // assigned table number
  players: string[] // player ids
}