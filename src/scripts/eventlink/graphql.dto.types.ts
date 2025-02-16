export interface EventData {
  event: EventDetails;
}

export interface EventDetails {
  id: string;
  status: string;
  title: string;
  eventFormat: EventFormat;
  cardSet: CardSet;
  rulesEnforcementLevel: string;
  entryFee: Money;
  venue: Venue | null;
  pairingType: string;
  capacity: number;
  numberOfPlayers: number;
  historicalNumPlayers: number | null;
  description: string;
  scheduledStartTime: string;
  estimatedEndTime: string;
  actualStartTime: string;
  actualEndTime: string;
  latitude: number;
  longitude: number;
  address: string | null;
  timeZone: string;
  phoneNumber: string | null;
  emailAddress: string | null;
  shortCode: string;
  startingTableNumber: number;
  hasTop8: boolean;
  isAdHoc: boolean;
  isOnline: boolean;
  groupId: string | null;
  requiredTeamSize: number;
  eventTemplateId: string;
  tags: string[];
  registeredPlayers: Player[];
  interestedPlayers: Player[];
  teams: Team[];
  incidents: Incident[];
}

export interface EventFormat {
  id: string;
  name: string;
  color: string;
  requiresSetSelection: boolean;
  includesDraft: boolean;
  includesDeckbuilding: boolean;
  wizardsOnly: boolean;
}

export interface CardSet {
  id: string;
  name: string;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Venue {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  timeZone: string | null;
  phoneNumber: string | null;
  emailAddress: string | null;
}

export interface Player {
  id: string;
  personaId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  status: string;
  preferredTableNumber: number | null;
}

export interface Team {
  id: string;
  eventId: string;
  teamCode: string;
  isLocked: boolean;
  isRegistered: boolean;
  tableNumber: number | null;
  reservations: Player[];
  registrations: Player[];
}

export interface Incident {
  id: string;
  ticketId: string;
  offender: Player;
  infraction: Infraction;
  penalty: Penalty;
  roundNumber: number;
  comment: string;
  reportedAt: string;
}

export interface Infraction {
  id: string;
  name: string;
  category: InfractionCategory;
  defaultPenalty: Penalty | null;
}

export interface InfractionCategory {
  id: string;
  name: string;
}

export interface Penalty {
  id: string;
  name: string;
}
