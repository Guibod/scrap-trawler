import type { EventDetails, GameState, Organization } from "~/resources/integrations/eventlink/graphql/types"

export enum ScrapeTrigger {
  MANUAL = "MANUAL",
  AUTOMATED = "AUTOMATED"
}

export interface WotcExtractedEvent {
  event: EventDetails
  organization: Organization
  rounds: {
    [key: number]: GameState,
  }
}