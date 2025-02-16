import { EventLinkGraphQLClient } from "~scripts/eventlink/graphql.client";
import type { EventDetails, GameState, Organization } from "~scripts/eventlink/graphql.dto.types"

export interface ExtractedEvent {
  event: EventDetails
  organization: Organization
  rounds: {
    [key: number]: GameState,
  }
}

/**
 * Event Extractor is bound to the background,
 * it will orchestrate request to navigator window to perform actions on its behalf.
 */
export class EventExtractor {
  private client: EventLinkGraphQLClient
  private eventId: number
  private orgId: number

  constructor(accessToken: string, wotcClientHeader: string, eventId: number, orgId: number) {
    this.eventId = eventId;
    this.orgId = orgId
    this.client = new EventLinkGraphQLClient(accessToken, wotcClientHeader);
  }

  async extract(): Promise<ExtractedEvent> {
    const [event, organization, round1] = await Promise.all([
      this.client.getEventDetails(this.eventId),
      this.client.getOrganization(this.orgId),
      this.client.getGameStateAtRound(this.eventId, 1)
    ]);

    const roundNumbers = Array.from({ length: round1.currentRoundNumber - 1 }, (_, i) => i + 2);

    const additionalRounds = await Promise.all(
      roundNumbers.map((round) => this.client.getGameStateAtRound(this.eventId, round))
    );

    const rounds = { 1: round1, ...Object.fromEntries(roundNumbers.map((r, i) => [r, additionalRounds[i]])) };

    return {
      event,
      organization,
      rounds
    };
  }
}
