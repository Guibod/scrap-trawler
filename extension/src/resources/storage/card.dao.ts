import { getLogger } from "~/resources/logging/logger"
import CardEntity, { CardLanguage } from "~/resources/storage/entities/card.entity"
import type { EntityTable } from "dexie"
import DatabaseService from "~/resources/storage/database"

export default class CardDao {
  private static instance: CardDao;
  private logger = getLogger(this.constructor.name);
  protected table: EntityTable<CardEntity, "name">;

  private constructor(db: DatabaseService = DatabaseService.getInstance()) {
    this.table = db.cards;
  }

  static getInstance(db?: DatabaseService): CardDao {
    if (!this.instance) {
      this.instance = new CardDao(db);
    }
    return this.instance;
  }

  /** Clears all stored card data. */
  async clear(): Promise<void> {
    this.logger.info("Clearing all card data");
    await this.table.clear().catch((error) => {
      this.logger.error("Failed to clear card data", error);
    });
  }

  /** Streams in card data efficiently. */
  async streamIn(cards: AsyncIterable<CardEntity>, bufferSize = 500): Promise<void> {
    this.logger.info("Streaming in card data");
    const bulkInsert: CardEntity[] = [];

    for await (const card of cards) {
      bulkInsert.push(card);

      if (bulkInsert.length >= bufferSize) {
        await this.table.bulkPut(bulkInsert); // Efficient bulk insert
        bulkInsert.length = 0; // Clear the array for the next batch
        await new Promise((resolve) => setTimeout(resolve, 10)); // Yield control
        globalThis.gc?.();
      }
    }

    // Insert any remaining items
    if (bulkInsert.length > 0) {
      await this.table.bulkPut(bulkInsert);
    }
  }


  /** Returns the count of stored cards. */
  count(): Promise<number> {
    return this.table.count();
  }

  async *streamOut(names: string[] | null): AsyncGenerator<CardEntity, void, void> {
    try {
      if (!names) {
        names = await this.table.toCollection().primaryKeys();
      }

      for (const id of names) {
        const event = await this.table.get(id);
        if (event) yield event;
      }
    } catch (error) {
      this.logger.error("Failed to stream out cards", error);
      throw new Error("Stream out failed");
    }
  }

  /** ✅ Finds a card by exact name. */
  async getExactLocalizedName(name: string, langs: CardLanguage[] = [CardLanguage.ENGLISH]): Promise<CardEntity | undefined> {
    for (const lang of langs) {
      const queryField = lang === CardLanguage.ENGLISH ? 'name' : `localizedNames.${lang}`;
      const match = await this.table.where(queryField).equals(name).first();
      if (match) return match;
    }
    return undefined;
  }

  async getExactName(name: string): Promise<CardEntity | undefined> {
    return this.table.get(name);
  }
}
