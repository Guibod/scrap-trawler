import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import AbstractDeckFetcher from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import { type DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type { DeckDescription } from "~/resources/storage/entities/event.entity"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"
import type SettingsService from "~/resources/domain/services/settings.service"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { getLogger } from "~/resources/logging/logger"
import { sendToBackground } from "@plasmohq/messaging"
import type { FetchRequest, FetchResponse } from "~/background/messages/fetch/fetch"

type ParsedText = {
  name: string
  format: MTG_FORMATS
}

const MAGIC_VILLE_TYPE = {
  "Standard": MTG_FORMATS.STANDARD,
  "Modern": MTG_FORMATS.MODERN,
  "Legacy": MTG_FORMATS.LEGACY,
  "Vintage": MTG_FORMATS.VINTAGE,
  "Commander": MTG_FORMATS.COMMANDER,
}

export class MagicVilleFetcher extends AbstractDeckFetcher<string> {
  readonly logger = getLogger("fetcher-magic-ville")
  constructor(
    settingsService: SettingsService,
    cardService: CardService,
    eventService: EventService
  ) {
    super(settingsService, cardService, eventService);
  }

  static async generateId(row: SpreadsheetRow): Promise<string> {
    return `magic-ville:${MagicVilleFetcher.extractDeckId(row.decklistUrl)}`;
  }

  async run(request: DeckFetchRequest): Promise<DeckFetchResponse> {
    const id = MagicVilleFetcher.extractDeckId(request.row.decklistUrl);
    try {
      const response = await sendToBackground<FetchRequest, FetchResponse>({
        name: "fetch/fetch",
        body: {
          url: `https://scrap-trawler-proxy-staging.guibod12.workers.dev/magicville/${id}`
        }
      })

      const rawText = await response.data;

      return {
        request,
        deck: await this.parse(rawText, request),
        rawData: rawText,
        success: true
      };
    } catch (e: any) {
      return {
        request,
        deck: null,
        errorMessage: e.message ?? "Unknown error",
        success: false
      };
    }
  }

  async parse(raw: string, request: DeckFetchRequest): Promise<DeckDescription> {
    this.parseSetup(raw)
    const parsed = await this.parseText(raw, request.format);

    return this.describe({
      id: await MagicVilleFetcher.generateId(request.row),
      source: DeckSource.MAGIC_VILLE,
      url: request.row.decklistUrl,
      name: parsed.name,
      format: parsed.format as MTG_FORMATS,
      archetype: request.row.archetype ?? null,
    })
  }

  private static extractDeckId(url?: string): string {
    const match = url?.match(/ref=(\d+)/);
    if (!match) throw new Error("Could not extract MagicVille deck ID");
    return match[1];
  }

  public async parseText(
    raw: string,
    eventFormat: MTG_FORMATS
  ): Promise<ParsedText> {
    const lines = raw.split(/\r?\n/);
    let name: string | undefined;
    let format: MTG_FORMATS = eventFormat;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("// NAME :")) {
        name = trimmed.split(":", 2)[1]?.replace(/<br\s*\/?>/, "").trim();
      } else if (trimmed.startsWith("// FORMAT :")) {
        const candidateFormat = trimmed.split(":", 2)[1]?.replace(/<br\s*\/?>/, "").trim();
        format = MAGIC_VILLE_TYPE[candidateFormat] ?? null;

        if (format === MTG_FORMATS.COMMANDER && eventFormat === MTG_FORMATS.DUEL) {
          format = MTG_FORMATS.DUEL;
        }
      } else if (trimmed.startsWith("SB:")) {
        const match = trimmed.match(/^SB:\s*(?<quantity>\d+)\s+(?<card>.+)/);
        if (!match) continue
        this.addToBoard({
          name: match.groups['card'],
          quantity: parseInt(match.groups['quantity'], 10)
        }, 'sideboard')
      } else {
        const match = trimmed.match(/^(?<quantity>\d+)\s+(?<card>.+)/);
        if (!match) continue
        this.addToBoard({
          name: match.groups['card'],
          quantity: parseInt(match.groups['quantity'], 10)
        }, 'mainboard')
      }
    }

    if (!name) {
      throw new Error("Deck name could not be parsed");
    }

    if ([MTG_FORMATS.COMMANDER, MTG_FORMATS.DUEL].includes(format)) {
      this.boards.commanders.push(...this.boards.sideboard.splice(0, 2))
      if (this.boards.sideboard.length === 1) {
        this.boards.companions.push(this.boards.sideboard.pop());
      }
    }

    return {
      name,
      format,
    }
  }

  protected sanitizeString(str: string): string {
    return super.sanitizeString(str).replace(/<br\s*\/?>/, "")
  }
}
