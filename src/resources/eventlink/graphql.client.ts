import type {
  EventDetails,
  EventResponse, GameState,
  GameStateResponse, Organization,
  OrganizationResponse
} from "~resources/eventlink/graphql.dto.types"
import { gql, GraphQLClient } from 'graphql-request'
import { GraphQlError, InvalidGraphQlResponseError } from "~resources/eventlink/exceptions"
import { getLogger, LoggerProxy } from "~resources/logging/logger"
const GRAPHQL_ENDPOINT = "https://api.tabletop.wizards.com/silverbeak-griffin-service/graphql";

type Variables = Record<string, unknown>

export class EventLinkGraphQLClient {
  private xWotcClientHeader: string;
  private client: GraphQLClient
  private logger: LoggerProxy

  constructor(accessToken: string, xWotcClientHeader: string) {
    this.xWotcClientHeader = xWotcClientHeader;
    this.logger = getLogger("eventlink-graphql-client");

    this.client = new GraphQLClient(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "x-wotc-client": this.xWotcClientHeader,
        "authorization": `Bearer ${accessToken}`
      }
    });
  }
  
  async getOrganization(id: string): Promise<Organization> {
    const query = gql`
      query getOrganization($id: ID!) {
        organization(id: $id) {
          ...OrganizationFields
          __typename
        }
      }
      
      fragment OrganizationFields on Organization {
        id
        name
        groups {
          id
          onlineOnly
          __typename
        }
        latitude
        longitude
        phoneNumber
        emailAddress
        postalAddress
        isPremium
        acceptedTermsAndConditionsAt
        availableTemplates {
          id
          name
          startDate
          endDate
          isEvergreen
          hasPromoProduct
          featured
          templateQuota
          wpnArticle
          keyArt
          fieldRules {
            id
            fieldName
            rule {
              rule
              value
              __typename
            }
            __typename
          }
          templateType
          prereleaseType
          mustHaveWizardsAccount
          __typename
        }
        venues {
          id
          name
          address
          timeZone
          phoneNumber
          googlePlaceId
          streetAddress
          city
          state
          country
          postalCode
          latitude
          longitude
          capacity
          emailAddress
          notes
          isApproved
          isDeleted
          __typename
        }
        brands
        ...RoleFields
        __typename
      }
      
      fragment RoleFields on Organization {
        roles {
          roleName
          user {
            personaId
            firstName
            lastName
            displayName
            emailAddress
            __typename
          }
          __typename
        }
        __typename
      }
    `;

    return this.request<OrganizationResponse, Organization, {id: string}>(
      query,
      { id },
      (response => response.organization)
    );
  }

  async getGameStateAtRound(id: string, round: number): Promise<GameState> {
    const query = gql`
      query getGameStateAtRound($eventId: ID!, $round: Int!) {
        gameStateV2AtRound(eventId: $eventId, round: $round) {
          ...GameStateFields
          __typename
        }
      }
      
      fragment GameStateFields on GameStateV2 {
        eventId
        minRounds
        podPairingType
        draft {
          ...DraftFields
          __typename
        }
        playoffDraft {
          ...DraftFields
          __typename
        }
        deckConstruction {
          timerId
          seats {
            ...SeatFields
            __typename
          }
          __typename
        }
        currentRoundNumber
        rounds {
          ...RoundFields
          __typename
        }
        drops {
          teamId
          roundNumber
          __typename
        }
        nextRoundMeta {
          hasDraft
          hasDeckConstruction
          __typename
        }
        gamesToWin
        teams {
          ...GameStateTeamFields
          __typename
        }
        playoffRounds
        __typename
      }
      
      fragment SeatFields on SeatV2 {
        seatNumber
        teamId
        __typename
      }
      
      fragment RoundFields on RoundV2 {
        roundId
        roundNumber
        isFinalRound
        isPlayoff
        isCertified
        pairingStrategy
        canRollback
        timerId
        matches {
          ...MatchFields
          __typename
        }
        standings {
          ...StandingFields
          __typename
        }
        __typename
      }
      
      fragment MatchFields on MatchV2 {
        matchId
        isBye
        teamIds
        tableNumber
        results {
          ...ResultsFields
          __typename
        }
        __typename
      }
      
      fragment ResultsFields on TeamResultV2 {
        isBye
        wins
        losses
        draws
        teamId
        __typename
      }
      
      fragment StandingFields on TeamStandingV2 {
        teamId
        rank
        wins
        losses
        draws
        matchPoints
        gameWinPercent
        opponentGameWinPercent
        opponentMatchWinPercent
        __typename
      }
      
      fragment DraftFields on DraftV2 {
        timerId
        pods {
          podNumber
          seats {
            ...SeatFields
            __typename
          }
          __typename
        }
        __typename
      }
      
      fragment GameStateTeamFields on TeamV2 {
        teamId
        teamName
        tableNumber
        players {
          personaId
          displayName
          firstName
          lastName
          __typename
        }
        __typename
      }
    `;

    return this.request<GameStateResponse, GameState, {eventId: string, round: number}>(
      query,
      { eventId: id, round },
      response => response.gameStateV2AtRound
    );
  }
  async getEventDetails(id: string, locale: string = "en"): Promise<EventDetails> {
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

    return this.request<EventResponse, EventDetails, {id: string, locale: string}>(
      query,
      { id, locale },
      response => response.event
    );
  }

  protected async request<T,R,V extends Variables = Variables>(
    query: string,
    variables: V,
    callback?: (response: T) => R
  ): Promise<R> {
    let result: T;
    try {
      result= await this.client.request<T, Variables>(query, variables);
    } catch (error) {
      this.logger.error(error);
      throw new GraphQlError("GraphQL request failed.", error instanceof Error ? error : undefined);
    }

    if (callback) {
      try {
        return callback(result)
      } catch (e) {
        throw new InvalidGraphQlResponseError(e instanceof Error ? e : undefined);
      }
    }

    return result as unknown as R;
  }

}
