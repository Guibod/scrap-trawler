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

export const COLUMN_TYPE_META: Record<COLUMN_TYPE, { mandatory: boolean, color: string, background: string, label: string }> = {
  [COLUMN_TYPE.UNIQUE_ID]: { mandatory: true, label: "Player Id", background: "bg-yellow-500/30", color: "bg-yellow-500"},
  [COLUMN_TYPE.ARCHETYPE]: { mandatory: false, label: "Archetype", background: "bg-red-200/40", color: "bg-red-500"},
  [COLUMN_TYPE.FIRST_NAME]: { mandatory: true, label: "First Name", background: "bg-orange-200/30", color: "bg-orange-500"},
  [COLUMN_TYPE.LAST_NAME]: { mandatory: true, label: "Last Name", background: "bg-amber-200/30", color: "bg-amber-500"},
  [COLUMN_TYPE.DECKLIST_URL]: { mandatory: true, label: "Decklist as URL", background: "bg-green-200/40", color: "bg-green-500"},
  [COLUMN_TYPE.DECKLIST_TXT]: { mandatory: false, label: "Decklist as Text", background: "bg-green-200/40", color: "bg-green-500"},
  [COLUMN_TYPE.IGNORED_DATA]: { mandatory: false, label: "Ignored Data", background: "bg-gradient-to-r from-gray-200/40 via-gray-300/40 to-gray-200/40 bg-[length:10px_10px] bg-repeat", color: "bg-gray-300 text-black"},
  [COLUMN_TYPE.PLAYER_DATA]: { mandatory: false, label: "Player Data", background: "bg-pink-200/30", color: "bg-pink-500"},
  [COLUMN_TYPE.FILTER]: { mandatory: false, label: "Filter", background: "bg-indigo-500/30", color: "bg-indigo-500"},
}

export const COLUMN_TYPE_UNIQUE = [
  COLUMN_TYPE.UNIQUE_ID,
  COLUMN_TYPE.ARCHETYPE,
  COLUMN_TYPE.FIRST_NAME,
  COLUMN_TYPE.LAST_NAME,
  COLUMN_TYPE.DECKLIST_URL,
  COLUMN_TYPE.DECKLIST_TXT,
]

export enum DUPLICATE_STRATEGY {
  NONE = "none",
  KEEP_FIRST = "keep_first",
  KEEP_LAST = "keep_last",
}

export const DUPLICATE_STRATEGY_META: Record<DUPLICATE_STRATEGY, { label: string, description: string, children: undefined }> = {
  [DUPLICATE_STRATEGY.NONE]: { label: "No Strategy", description: "Do not handle duplicates", children: undefined },
  [DUPLICATE_STRATEGY.KEEP_FIRST]: { label: "Keep First", description: "If many rows share the same id, the first one is kept.", children: undefined },
  [DUPLICATE_STRATEGY.KEEP_LAST]: { label: "Keep Last", description: "If many rows share the same id, the last one is kept.", children: undefined },
}

export enum FILTER_OPERATOR {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  INCLUDES = "includes",
  EXCLUDES = "excludes",
  CONTAINS = "contains",
}

export const FILTER_OPERATOR_META: Record<FILTER_OPERATOR, { label: string, description: string, children: undefined }> = {
  [FILTER_OPERATOR.EQUALS]: { label: "Equals", description: "The cell value must be equal to the filter value", children: undefined },
  [FILTER_OPERATOR.NOT_EQUALS]: { label: "Not Equals", description: "The cell value must not be equal to the filter value", children: undefined },
  [FILTER_OPERATOR.INCLUDES]: { label: "Includes", description: "The cell value must include the filter value", children: undefined },
  [FILTER_OPERATOR.EXCLUDES]: { label: "Excludes", description: "The cell value must not include the filter value", children: undefined },
  [FILTER_OPERATOR.CONTAINS]: { label: "Contains", description: "The cell value must contain the filter value", children: undefined },
}