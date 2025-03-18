import { getLogger } from "~/resources/logging/logger"
import CardDao from "~/resources/storage/card.dao"
import { CardLanguage } from "~/resources/storage/entities/card.entity"
import Fuse, { type Expression, type FuseResult } from "fuse.js"
import type { CardDbo, CardIndexRecord } from "~/resources/domain/dbos/card.dbo"
import { CardMapper } from "~/resources/domain/mappers/card.mapper"
import SettingsService from "~/resources/domain/services/settings.service"

export default class CardService {
  private static instance: CardService | null = null;
  private fuseIndex: Fuse<CardIndexRecord> | null = null;
  private cardDao: CardDao;
  private settingsService: SettingsService
  private logger = getLogger(this.constructor.name);
  private indexingProgress: number | null = null
  private indexingStartCallback?: () => void;
  private indexingCompleteCallback?: (total: number) => void;
  private indexingProgressCallback?: (index: number, total: number) => void
  private indexingProgressInterval: number = 100

  private constructor(cardDao: CardDao, settingsService: SettingsService) {
    this.cardDao = cardDao;
    this.settingsService = settingsService;
  }

  static getInstance(cardDao: CardDao = CardDao.getInstance(), settingsService: SettingsService = SettingsService.getInstance()): CardService {
    if (!CardService.instance) {
      CardService.instance = new CardService(cardDao, settingsService);
    }
    return CardService.instance;
  }

  getIndex(): Promise<Fuse<CardIndexRecord>> {
    return this.getOrBuildSearchIndex();
  }

  getIndexingState(): boolean {
    return this.indexingProgress !== null;
  }

  onIndexingStart(callback: () => void): void {
    this.indexingStartCallback = callback;
  }

  onIndexingProgress(callback: (index: number, total: number) => void, interval = 100): void {
    this.indexingProgressCallback = callback;
    this.indexingProgressInterval = interval;
  }

  onIndexingComplete(callback: (total: number) => void): void {
    this.indexingCompleteCallback = callback;
  }

  public async buildIndex(): Promise<Fuse<CardIndexRecord>> {
    this.fuseIndex = null;
    return this.getOrBuildSearchIndex()
  }

  async getCard(name: string): Promise<CardDbo | null> {
    return this.cardDao.getExactName(name).then(card => card ? CardMapper.toDbo(card) : null);
  }

  /** Searches for a card by name within multiple languages, using exact match first, then fuzzy fallback */
  async searchCard(name: string, languages?: CardLanguage[]): Promise<CardDbo | null> {
    if (!languages) languages = (await this.settingsService.get()).searchLanguages;

    const exactMatch = await this.cardDao.getExactLocalizedName(name, languages);
    if (exactMatch) return CardMapper.toDbo(exactMatch);

    return this.searchCards(name, languages).then(results => {
      if (results.length === 0) return null;
      return results[0].item;
    })
  }

  async searchCards(name: string, languages?: CardLanguage[]): Promise<FuseResult<CardDbo>[]> {
    if (!languages) languages = (await this.settingsService.get()).searchLanguages;

    const fuse = await this.getOrBuildSearchIndex();

    const query: Expression = languages.length === 1
      ? { [`localizedNames.${languages[0]}`]: name }
      : { $or: languages.map(lang => ({ [`localizedNames.${lang}`]: name })) };

    const searchResults: FuseResult<CardIndexRecord>[] = fuse.search(query);

    const resultsWithFullData: FuseResult<CardDbo>[] = await Promise.all(
      searchResults.map(async (result) => {
        const cardDbo = await this.getCard(result.item.name);
        return {
          ...result,
          item: cardDbo
        };
      })
    );

    return resultsWithFullData.filter(result => result.item !== null);
  }

  async count() {
    return this.cardDao.count()
  }

  private async getOrBuildSearchIndex(): Promise<Fuse<CardIndexRecord>> {
    if (this.fuseIndex) {
      return this.fuseIndex;
    }

    this.indexingProgress = 0
    if (this.indexingStartCallback) this.indexingStartCallback();

    const languages = (await this.settingsService.get()).searchLanguages;
    this.logger.info(`Building unified search index for languages: ${languages}.`);
    const fuse = new Fuse([], {
      keys: [...languages.map(lang => `localizedNames.${lang}`)],
      isCaseSensitive: false,
      includeScore: true,
      shouldSort: true,
      threshold: 0.3
    });
    this.fuseIndex = fuse;

    const count = await this.count()
    for await (const entity of this.cardDao.streamOut(null)) {
      this.indexingProgress++
      fuse.add(CardMapper.toIndexRecord(entity));
      if (this.indexingProgressCallback && this.indexingProgress % this.indexingProgressInterval === 0) {
        this.indexingProgressCallback(this.indexingProgress, count);
      }
    }
    if (this.indexingCompleteCallback) this.indexingCompleteCallback(this.indexingProgress);
    this.logger.info(`Unified search index built.`);
    this.indexingProgress = null;
    return fuse;
  }
}
