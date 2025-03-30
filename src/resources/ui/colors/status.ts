import { FetchStatus, type GlobalStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"

const statusColors: Record<GlobalStatus | FetchStatus | PairStatus | ScrapeStatus, string> = {
  UNRESOLVED: "fill-red-500 stroke-red-700",
  FAILED: "fill-red-500 stroke-red-700",
  COMPLETED: "fill-green-500 stroke-green-700",
  COMPLETED_ENDED: "fill-green-500 stroke-green-700",
  COMPLETED_LIVE: "fill-green-500 stroke-green-700",
  PARTIAL: "fill-yellow-500 stroke-yellow-700",
  COMPLETED_DEAD: "fill-black-500 stroke-black-700",
  NOT_STARTED: "fill-gray-400 stroke-gray-600"
}

export default statusColors;