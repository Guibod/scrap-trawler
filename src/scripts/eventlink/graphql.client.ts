import type { EventDetails, EventData } from "~scripts/eventlink/graphql.dto.types"
import { gql, GraphQLClient } from 'graphql-request'
const GRAPHQL_ENDPOINT = "https://api.tabletop.wizards.com/silverbeak-griffin-service/graphql";

export class EventLinkGraphQLClient {
  private xWotcClientHeader: string;
  private client: GraphQLClient

  constructor(accessToken: string, xWotcClientHeader: string) {
    this.xWotcClientHeader = xWotcClientHeader;
    this.client = new GraphQLClient(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "x-wotc-client": this.xWotcClientHeader,
        "authorization": `Bearer ${accessToken}`
      }
    });
  }

  async getEventDetails(id: number, locale: string = "en"): Promise<EventDetails> {
    const query = gql`
      query event($id: ID!, $locale: String) {
        event(id: $id) {
          ...EventFields
          ...PlayerListFields
          incidents {
            ...IncidentFields
            __typename
          }
          __typename
        }
      }

      fragment EventFields on Event {
        id
        status
        title
        eventFormat(locale: $locale) {
          id
          name
          color
          requiresSetSelection
          includesDraft
          includesDeckbuilding
          wizardsOnly
          __typename
        }
        cardSet(locale: $locale) {
          id
          name
          __typename
        }
        rulesEnforcementLevel
        entryFee {
          amount
          currency
          __typename
        }
        venue {
          id
          name
          latitude
          longitude
          address
          streetAddress
          city
          state
          country
          postalCode
          timeZone
          phoneNumber
          emailAddress
          __typename
        }
        pairingType
        capacity
        numberOfPlayers
        historicalNumPlayers
        description
        scheduledStartTime
        estimatedEndTime
        actualStartTime
        actualEndTime
        latitude
        longitude
        address
        timeZone
        phoneNumber
        emailAddress
        shortCode
        startingTableNumber
        hasTop8
        isAdHoc
        isOnline
        groupId
        requiredTeamSize
        eventTemplateId
        tags
        __typename
      }
      
      fragment IncidentFields on Incident {
        id
        ticketId
        offender {
          personaId
          firstName
          lastName
          displayName
          __typename
        }
        infraction {
          id
          name
          category {
            id
            name
            __typename
          }
          defaultPenalty {
            id
            name
            __typename
          }
          __typename
        }
        penalty {
          id
          name
          __typename
        }
        roundNumber
        comment
        reportedAt
        __typename
      }
      
      fragment PlayerListFields on Event {
        registeredPlayers {
          ...RegistrationFields
          __typename
        }
        interestedPlayers {
          personaId
          displayName
          firstName
          lastName
          emailAddress
          __typename
        }
        teams {
          ...TeamPayloadFields
          __typename
        }
        __typename
      }
      
      fragment TeamPayloadFields on TeamPayload {
        id
        eventId
        teamCode
        isLocked
        isRegistered
        tableNumber
        reservations {
          personaId
          displayName
          firstName
          lastName
          __typename
        }
        registrations {
          ...RegistrationFields
          __typename
        }
        __typename
      }
      
      fragment RegistrationFields on Registration {
        id
        personaId
        displayName
        firstName
        lastName
        status
        preferredTableNumber
        __typename
      }
    `;

    return this.client.request<EventData, {id: number, locale: string}>(
      query,
      { id, locale }
    ).then(data => data.event);
  }
}
