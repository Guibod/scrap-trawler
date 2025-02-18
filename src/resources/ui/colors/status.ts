import { FetchStatus, type GlobalStatus, PairStatus, ScrapeStatus } from "~resources/domain/enums/status.dbo"

const statusColors: Record<GlobalStatus | FetchStatus | PairStatus | ScrapeStatus, string> = {
  UNRESOLVED: "fill-red-500 stroke-red-700",
  COMPLETED: "fill-green-500 stroke-green-700",
  PARTIAL: "fill-yellow-500 stroke-yellow-700",
  IN_PROGRESS: "fill-orange-500 stroke-orange-700",
  NOT_STARTED: "fill-gray-400 stroke-gray-600"
}

export default statusColors;