import { EventLinkGraphQLClient } from "~scripts/eventlink/graphql.client"
import type { EventDetails } from "~scripts/eventlink/graphql.dto.types"

export interface ExtractedEvent {
  event: EventDetails
}

/**
 * Event Extractor is bound to the background,
 * it will orchestrate request to navigator window to perform actions on its behalf.
 */
export class EventExtractor {
  private client: EventLinkGraphQLClient
  private eventId: number

  constructor(accessToken: string, wotcClientHeader: string, eventId: number) {
    this.eventId = eventId;
    this.client = new EventLinkGraphQLClient(accessToken, wotcClientHeader);
  }

  async extract(): Promise<ExtractedEvent> {
    const event = await this.client.getEventDetails(this.eventId);
    return {
      event: event
    };
  }
}
