import { RelDbo } from "~/resources/domain/enums/rel.dbo"
import type { MoneyDbo } from "~/resources/domain/dbos/money.dbo"
import type { PairingDbo } from "~/resources/domain/enums/pairing.dbo"
import type { GeoJSON, Point } from "geojson"

interface EventDetailsDbo {
  id: string
  status: string
  title: string
  format: string
  rulesEnforcementLevel: RelDbo,
  entryFee: MoneyDbo,
  pairingType: PairingDbo,
  capacity: number,
  numberOfPlayers: number,
  historicalNumPlayers: number,
  description: string,
  scheduledStartTime: Date
  estimatedEndTime: Date
  actualStartTime: Date
  actualEndTime: Date
  location: GeoJSON<Point, { address: string }>
  timeZone: string
  phoneNumber: string
  emailAddress: string
  shortCode: string
  startingTableNumber: number
  hasTop8: boolean,
  isAdHoc: boolean,
  isOnline: boolean,
  requiredTeamSize: 1,
}