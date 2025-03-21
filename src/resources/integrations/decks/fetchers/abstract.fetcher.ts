import type { DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type SettingsService from "~/resources/domain/services/settings.service"
import { NotYetImplemented } from "~/resources/exception"
import type { DeckDescription } from "~/resources/storage/entities/event.entity"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import type { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"

export interface DeckFetcher {
  new (settingsService: SettingsService, cardService: CardService, eventService: EventService): AbstractDeckFetcher;
  generateId: (row: SpreadsheetRow) => Promise<string>;
}

export default abstract class AbstractDeckFetcher {
  protected constructor(
    protected readonly settingsService: SettingsService,
    protected readonly cardService: CardService,
    protected readonly eventService: EventService
  ) {}

  abstract run(row: DeckFetchRequest): Promise<DeckFetchResponse>;
  abstract parse(raw: string | object, format?: MTG_FORMATS, archetype?: string): Promise<DeckDescription>

  static async generateId(row: SpreadsheetRow): Promise<string> {
    throw new NotYetImplemented("generateId() is not yet implemented");
  }

  async applyThrottle(): Promise<this> {
    return new Promise(resolve => setTimeout(resolve, 1000)).then(() => this);
  }
}