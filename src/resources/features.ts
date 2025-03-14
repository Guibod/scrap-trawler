export type Feature = {
  title: string,
  status: 'done' | 'partial' | 'in development' | 'planned',
  items?: Feature[]
}
export const features: Feature[] = [
  { title: "Extract data from EventLink",  status: 'done', items: [
      { title: "Player registration details",  status: 'done' },
      { title: "Round pairings & match results",  status: 'done' },
      { title: "Standings & tiebreakers",  status: 'done' },
      { title: "Penalties & infractions",  status: 'done' },
    ]},
  { title: "Extract data from your registration sheet",  status: 'partial', items: [
      { title: "Read a CSV spreadsheet",  status: 'done' },
      { title: "Read a XSLX spreadsheet",  status: 'done' },
      { title: "Read a Google spreadsheet",  status: 'planned' },
      { title: "Define column role", status: 'done' },
      { title: "Associate your players with eventlink players", status: 'done', items: [
          { title: "Manually", status: 'done' },
          { title: "Automatically", status: 'done' },
          { title: "Randomly", status: 'done' },
        ] },
    ]},
  { title: "Recover player decklists",  status: 'planned', items: [
      {title: "Moxfield", status: 'planned'},
      {title: "Archidekt", status: 'planned'},
      {title: "MagicVille 🇫🇷", status: 'planned'},
      { title: "TappedOut", status: 'planned' },
      { title: "Deckbox", status: 'planned' },
      { title: "MTGGoldfish", status: 'planned' },
    ]},
  { title: "Give eternal access to your tournament", status: 'done', items: [
      {title: "Registrations", status: 'done'},
      {title: "Standings", status: 'done'},
      {title: "Pairings", status: 'done'},
      {title: "Incidents", status: 'done'},
    ]},
  { title: "Display the tournament meta (partial) to your players", status: 'planned' },
  { title: "Display and export the tournament meta (complete) to your players and the world", status: 'planned' },
  { title: "Export/Import data", status: 'done', items: [
      { title: "Export ALL", status: 'done' },
      { title: "Export ONE tournament", status: 'done' },
      { title: "Import anything", status: 'done' },
    ]},
]
