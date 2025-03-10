import type { ResultDbo } from "~/resources/domain/dbos/result.dbo"

export interface MatchDbo {
  id: string
  isBye: boolean
  teamIds: string[],
  tableNumber: number,
  results: Record<string, ResultDbo>
}