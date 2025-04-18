import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { MoxfieldFetcher } from "~/resources/integrations/decks/fetchers/moxfield.fetcher"
import { TextFetcher } from "~/resources/integrations/decks/fetchers/text.fetcher"
import type { DeckFetcher } from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import { NothingFetcher } from "~/resources/integrations/decks/fetchers/nothing.fetcher"
import { MagicVilleFetcher } from "~/resources/integrations/decks/fetchers/magic-ville.fetcher"
import { ArchidektFetcher } from "~/resources/integrations/decks/fetchers/archidekt.fetcher"

export default class DeckFetcherResolver {
  static resolveFetcherType(row: SpreadsheetRow): DeckFetcher {
    if (!row) {
      return NothingFetcher;
    }

    if (row.decklistUrl?.includes("moxfield.com")) {
      return MoxfieldFetcher;
    }
    if (row.decklistUrl?.includes("magic-ville.com")) {
      return MagicVilleFetcher;
    }
    if (row.decklistUrl?.includes("archidekt.com")) {
      return ArchidektFetcher;
    }

    if (row.decklistTxt) {
      return TextFetcher;
    }
    return NothingFetcher;
  }
}