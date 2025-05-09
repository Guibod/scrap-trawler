import type { EventDetails, GameState, Organization } from "~/resources/integrations/eventlink/graphql/types"
import type { WotcExtractedEvent } from "~/resources/integrations/eventlink/types"

export const sampleGameState: GameState = {
  eventId: "event-123",
  minRounds: 3,
  podPairingType: "Swiss",
  draft: {
    timerId: "draft-timer-001",
    pods: [
      {
        podNumber: 1,
        seats: [
          { seatNumber: 1, teamId: "team-1" },
          { seatNumber: 2, teamId: "team-2" },
        ],
      },
    ],
  },
  playoffDraft: null,
  deckConstruction: {
    timerId: "deck-timer-001",
    seats: [
      { seatNumber: 1, teamId: "team-1" },
      { seatNumber: 2, teamId: "team-2" },
    ],
  },
  currentRoundNumber: 1,
  rounds: [
    {
      roundId: "round-1",
      roundNumber: 1,
      isFinalRound: false,
      isPlayoff: false,
      isCertified: true,
      pairingStrategy: "Swiss",
      canRollback: true,
      timerId: "round-timer-001",
      matches: [
        {
          matchId: "match-001",
          isBye: false,
          teamIds: ["team-1", "team-2"],
          tableNumber: 1,
          results: [
            { isBye: false, wins: 2, losses: 1, draws: 0, teamId: "team-1" },
            { isBye: false, wins: 1, losses: 2, draws: 0, teamId: "team-2" },
          ],
        },
      ],
      standings: [
        {
          teamId: "team-1",
          rank: 1,
          wins: 1,
          losses: 0,
          draws: 0,
          matchPoints: 3,
          gameWinPercent: 0.67,
          opponentGameWinPercent: 0.5,
          opponentMatchWinPercent: 0.5,
        },
      ],
    },
  ],
  drops: [
    {
      teamId: "team-3",
      roundNumber: 1,
    },
  ],
  nextRoundMeta: {
    hasDraft: false,
    hasDeckConstruction: true,
  },
  gamesToWin: 2,
  teams: [
    {
      teamId: "team-1",
      teamName: "Wizards of the West",
      tableNumber: 1,
      players: [
        {
          id: "player-001",
          personaId: "player-001",
          displayName: "JohnDoe",
          firstName: "John",
          lastName: "Doe",
          status: "Active",
          preferredTableNumber: 1,
        },
      ],
    },
  ],
  playoffRounds: 1,
};


export const sampleOrganizer: Organization = {
  id: "org-123",
  name: "Magic Tournament Organizers",
  groups: [
    {
      id: "group-001",
      onlineOnly: false,
    },
  ],
  latitude: 40.7128,
  longitude: -74.006,
  phoneNumber: "123-456-7890",
  emailAddress: "contact@magicorg.com",
  postalAddress: "456 Tournament Ave, New York, NY, USA",
  isPremium: true,
  acceptedTermsAndConditionsAt: "2024-01-01T12:00:00Z",
  availableTemplates: [
    {
      id: "template-001",
      name: "Standard Championship",
      startDate: "2024-06-01",
      endDate: "2024-06-02",
      isEvergreen: false,
      hasPromoProduct: true,
      featured: true,
      templateQuota: 100,
      wpnArticle: null,
      keyArt: null,
      fieldRules: [
        {
          id: "rule-001",
          fieldName: "decklistRequired",
          rule: {
            rule: "Mandatory",
            value: "true",
          },
        },
      ],
      templateType: "Competitive",
      prereleaseType: "Regular",
      mustHaveWizardsAccount: true,
    },
  ],
  venues: [
    {
      id: "venue-123",
      name: "Grand Hall",
      address: "123 Main St",
      timeZone: "EST",
      phoneNumber: "123-456-7890",
      googlePlaceId: null,
      streetAddress: "123 Main St",
      city: "New York",
      state: "NY",
      country: "USA",
      postalCode: "10001",
      latitude: 40.7128,
      longitude: -74.006,
      capacity: 500,
      emailAddress: "venue@grandhall.com",
      notes: null,
      isApproved: true,
      isDeleted: false,
    },
  ],
  brands: ["MTG"],
  roles: [
    {
      roleName: "Organizer",
      user: {
        personaId: "user-001",
        firstName: "John",
        lastName: "Doe",
        displayName: "JDoe",
        emailAddress: "jdoe@magicorg.com",
      },
    },
  ],
};


export const sampleEvent: EventDetails = {
  id: "event-123",
  status: "Scheduled",
  title: "Magic Championship",
  eventFormat: {
    id: "format-1",
    name: "Standard",
    color: "blue",
    requiresSetSelection: false,
    includesDraft: false,
    includesDeckbuilding: false,
    wizardsOnly: false,
  },
  cardSet: {
    id: "set-123",
    name: "Dominaria United",
  },
  rulesEnforcementLevel: "Competitive",
  entryFee: {
    amount: 30,
    currency: "USD",
  },
  venue: {
    id: "venue-001",
    name: "Grand Hall",
    latitude: 40.7128,
    longitude: -74.006,
    address: "123 Main St",
    streetAddress: "123 Main St",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10001",
    timeZone: "EST",
    phoneNumber: "123-456-7890",
    emailAddress: "contact@grandhall.com",
    googlePlaceId: "place-123",
    capacity: 100,
    notes: "A large event space.",
    isApproved: true,
    isDeleted: false,
  },
  pairingType: "Swiss",
  capacity: 100,
  numberOfPlayers: 64,
  historicalNumPlayers: 80,
  description: "A high-stakes Magic: The Gathering tournament.",
  scheduledStartTime: "2024-05-10T10:00:00Z",
  estimatedEndTime: "2024-05-10T18:00:00Z",
  actualStartTime: "2024-05-10T10:15:00Z",
  actualEndTime: null,
  latitude: 40.7128,
  longitude: -74.006,
  address: "123 Main St",
  timeZone: "EST",
  phoneNumber: "123-456-7890",
  emailAddress: "contact@event.com",
  shortCode: "MAGIC2024",
  startingTableNumber: 1,
  hasTop8: true,
  isAdHoc: false,
  isOnline: false,
  groupId: null,
  requiredTeamSize: 1,
  eventTemplateId: "template-123",
  tags: ["competitive", "standard", "tournament"],
  registeredPlayers: [
    {
      id: "player-001",
      personaId: "persona-001",
      displayName: "JohnDoe",
      firstName: "John",
      lastName: "Doe",
      status: "Registered",
      preferredTableNumber: null,
    },
  ],
  interestedPlayers: [],
  teams: [],
  incidents: [],
};

export const sampleRawData: WotcExtractedEvent = {
  event: sampleEvent,
  organization: sampleOrganizer,
  rounds: {
    1: sampleGameState,
  }
}