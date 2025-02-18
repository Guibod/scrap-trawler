export interface EventResponse {
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

export interface GameStateResponse {
  gameStateV2AtRound: GameState;
}

export interface GameState {
  eventId: string;
  minRounds: number;
  podPairingType: string;
  draft: Draft | null;
  playoffDraft: Draft | null;
  deckConstruction: DeckConstruction;
  currentRoundNumber: number;
  rounds: Round[];
  drops: Drop[];
  nextRoundMeta: NextRoundMeta;
  gamesToWin: number;
  teams: GameStateTeam[];
  playoffRounds: number;
}

export interface Draft {
  timerId: string;
  pods: Pod[];
}

export interface Pod {
  podNumber: number;
  seats: Seat[];
}

export interface Seat {
  seatNumber: number;
  teamId: string;
}

export interface DeckConstruction {
  timerId: string;
  seats: Seat[];
}

export interface Round {
  roundId: string;
  roundNumber: number;
  isFinalRound: boolean;
  isPlayoff: boolean;
  isCertified: boolean;
  pairingStrategy: string;
  canRollback: boolean;
  timerId: string;
  matches: Match[];
  standings: Standing[];
}

export interface Match {
  matchId: string;
  isBye: boolean;
  teamIds: string[];
  tableNumber: number;
  results: Result[];
}

export interface Result {
  isBye: boolean;
  wins: number;
  losses: number;
  draws: number;
  teamId: string;
}

export interface Standing {
  teamId: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  matchPoints: number;
  gameWinPercent: number;
  opponentGameWinPercent: number;
  opponentMatchWinPercent: number;
}

export interface Drop {
  teamId: string;
  roundNumber: number;
}

export interface NextRoundMeta {
  hasDraft: boolean;
  hasDeckConstruction: boolean;
}

export interface GameStateTeam {
  teamId: string;
  teamName: string;
  tableNumber: number;
  players: Player[];
}

export interface Player {
  personaId: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

export interface OrganizationResponse {
  organization: Organization;
}

export interface Organization {
  id: string;
  name: string;
  groups: Group[];
  latitude: number;
  longitude: number;
  phoneNumber: string | null;
  emailAddress: string | null;
  postalAddress: string | null;
  isPremium: boolean;
  acceptedTermsAndConditionsAt: string | null;
  availableTemplates: Template[];
  venues: Venue[];
  brands: string[];
  roles: Role[];
}

export interface Group {
  id: string;
  onlineOnly: boolean;
}

export interface Template {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isEvergreen: boolean;
  hasPromoProduct: boolean;
  featured: boolean;
  templateQuota: number;
  wpnArticle: string | null;
  keyArt: string | null;
  fieldRules: FieldRule[];
  templateType: string;
  prereleaseType: string;
  mustHaveWizardsAccount: boolean;
}

export interface FieldRule {
  id: string;
  fieldName: string;
  rule: Rule;
}

export interface Rule {
  rule: string;
  value: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  timeZone: string;
  phoneNumber: string | null;
  googlePlaceId: string | null;
  streetAddress: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  capacity: number;
  emailAddress: string | null;
  notes: string | null;
  isApproved: boolean;
  isDeleted: boolean;
}

export interface Role {
  roleName: string;
  user: User;
}

export interface User {
  personaId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  emailAddress: string;
}