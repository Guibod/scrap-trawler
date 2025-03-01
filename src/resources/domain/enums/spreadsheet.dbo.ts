export enum COLUMN_TYPE {
  IGNORED_DATA = "ignored",
  PLAYER_DATA = "player",
  UNIQUE_ID = "uniqueId",
  ARCHETYPE = "archetype",
  FIRST_NAME = "firstName",
  LAST_NAME = "lastName",
  DECKLIST_URL = "decklistUrl",
}

export enum DUPLICATE_HANDLING_STRATEGY {
  KEEP_FIRST = "keep_first",
  KEEP_LAST = "keep_last",
}

export type ProcessedSpreadsheetRow = {
  [COLUMN_TYPE.UNIQUE_ID]: string;
  [COLUMN_TYPE.FIRST_NAME]: string | null;
  [COLUMN_TYPE.LAST_NAME]: string | null;
  [COLUMN_TYPE.ARCHETYPE]: string | null;
  [COLUMN_TYPE.DECKLIST_URL]: string | null;
  [COLUMN_TYPE.PLAYER_DATA]: Record<string, string | number | null>;
};