export enum COLUMN_TYPE {
  UNIQUE_ID = "uniqueId",
  ARCHETYPE = "archetype",
  FIRST_NAME = "firstName",
  LAST_NAME = "lastName",
  DECKLIST_URL = "decklistUrl",
  DECKLIST_TXT = "decklistTxt",
  IGNORED_DATA = "ignored",
  PLAYER_DATA = "player",
  FILTER = "filter",
}

export const COLUMN_TYPE_META: Record<COLUMN_TYPE, { color: string, background: string, label: string }> = {
  [COLUMN_TYPE.UNIQUE_ID]: { label: "Player Id", background: "bg-yellow-500/30", color: "bg-yellow-500"},
  [COLUMN_TYPE.ARCHETYPE]: { label: "Archetype", background: "bg-red-200/40", color: "bg-red-500"},
  [COLUMN_TYPE.FIRST_NAME]: { label: "First Name", background: "bg-orange-200/30", color: "bg-orange-500"},
  [COLUMN_TYPE.LAST_NAME]: { label: "Last Name", background: "bg-amber-200/30", color: "bg-amber-500"},
  [COLUMN_TYPE.DECKLIST_URL]: { label: "Decklist as URL", background: "bg-green-200/40", color: "bg-green-500"},
  [COLUMN_TYPE.DECKLIST_TXT]: { label: "Decklist as Text", background: "bg-green-200/40", color: "bg-green-500"},
  [COLUMN_TYPE.IGNORED_DATA]: { label: "Ignored Data", background: "bg-gradient-to-r from-gray-200/40 via-gray-300/40 to-gray-200/40 bg-[length:10px_10px] bg-repeat", color: "bg-gray-300 text-black"},
  [COLUMN_TYPE.PLAYER_DATA]: { label: "Player Data", background: "bg-pink-200/30", color: "bg-pink-500"},
  [COLUMN_TYPE.FILTER]: { label: "Filter", background: "bg-indigo-500/30", color: "bg-indigo-500"},
}

export const COLUMN_TYPE_UNIQUE = [
  COLUMN_TYPE.UNIQUE_ID,
  COLUMN_TYPE.ARCHETYPE,
  COLUMN_TYPE.FIRST_NAME,
  COLUMN_TYPE.LAST_NAME,
  COLUMN_TYPE.DECKLIST_URL,
  COLUMN_TYPE.DECKLIST_TXT,
]

export enum DUPLICATE_HANDLING_STRATEGY {
  KEEP_FIRST = "keep_first",
  KEEP_LAST = "keep_last",
}
