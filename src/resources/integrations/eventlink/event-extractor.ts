import { EventLinkGraphQLClient } from "~/resources/integrations/eventlink/graphql/client";
import type { EventDetails, GameState, Organization } from "~/resources/integrations/eventlink/graphql/types"

export interface WotcExtractedEvent {
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
  private eventId: string
  private orgId: string

  constructor(accessToken: string, wotcClientHeader: string, eventId: string, orgId: string) {
    this.eventId = eventId;
    this.orgId = orgId
    this.client = new EventLinkGraphQLClient(accessToken, wotcClientHeader);
  }

  async extract(): Promise<WotcExtractedEvent> {
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
