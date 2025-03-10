import type { PairingStrategyDbo } from "~/resources/domain/enums/pairing.strategy.dbo"
import type { MatchDbo } from "~/resources/domain/dbos/match.dbo"
import type { StandingDbo } from "~/resources/domain/dbos/standing.dbo"
import type { DropDbo } from "~/resources/domain/dbos/drop.dbo"

export interface RoundDbo {
  id: string
  roundNumber: number
  isFinalRound: boolean
  isPlayoff: boolean
  isCertified: boolean
  pairingStrategy: PairingStrategyDbo
  matches: Record<string, MatchDbo>
  standings: Record<number, StandingDbo>
  drops: Record<string, DropDbo>
}