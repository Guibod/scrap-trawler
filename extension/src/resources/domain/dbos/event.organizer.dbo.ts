import type { GeoJSON, Point } from "geojson"

export interface EventOrganizerDbo {
  id: string
  name: string
  phoneNumber: string
  emailAddress: string
  location: GeoJSON<Point, { address: string }>
  isPremium: boolean
}
