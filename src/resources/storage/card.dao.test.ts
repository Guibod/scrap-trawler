import { beforeAll, beforeEach, afterEach, describe, expect, it } from "vitest"
import "fake-indexeddb/auto"
import CardDao from "~/resources/storage/card.dao"
import DatabaseService from "./database"
import CardEntity, { CardAtomic, CardLanguage } from "~/resources/storage/entities/card.entity"

const db = DatabaseService.getInstance();
let cardDao: CardDao;

describe('CardDao', () => {
  beforeAll(async () => {
    cardDao = CardDao.getInstance();
  });

  it("true is true", () => {
    expect(true).toBe(true);
  })

  afterEach(async () => {
    await cardDao.clear(); // Ensure a clean slate before each test
  })

  it('should clear all cards', async () => {
    await db.cards.put({ name: 'Test Card', colors: ['U'], manaValue: 2, type: 'Instant', legalities: {}, identifiers: {} } as CardEntity);
    await cardDao.clear();
    const count = await db.cards.count();
    expect(count).toBe(0);
  });

  describe('find cards', () => {
    beforeEach(async () => {
      await db.cards.bulkPut([
        { name: "A", localizedNames: { en: "A", fr: "French A", es: "Spanish A"}} as CardEntity,
        { name: "B", localizedNames: { en: "B", fr: "French B", es: "Spanish B"}} as CardEntity,
        { name: "C", localizedNames: { en: "C", fr: "French C", es: "Spanish C"}} as CardEntity,
        { name: "D", localizedNames: { en: "D", fr: "A", es: "Spanish D"}} as CardEntity,
      ]);
    })

    it("Find by exact name", async () => {
      expect(await cardDao.getExactName("A"))
        .toEqual({ name: "A", localizedNames: { en: "A", fr: "French A", es: "Spanish A"}});
      expect(await cardDao.getExactName("B"))
        .toEqual({ name: "B", localizedNames: { en: "B", fr: "French B", es: "Spanish B"}});
    })

    it("Find by exact ENGLISH name", async () => {
      expect(await cardDao.getExactLocalizedName("A", [CardLanguage.ENGLISH]))
        .toEqual({ name: "A", localizedNames: { en: "A", fr: "French A", es: "Spanish A"}});
      expect(await cardDao.getExactLocalizedName("B", [CardLanguage.ENGLISH]))
        .toEqual({ name: "B", localizedNames: { en: "B", fr: "French B", es: "Spanish B"}});
    })

    it("Find by exact ENGLISH or SPANISH name", async () => {
      expect(await cardDao.getExactLocalizedName("A", [CardLanguage.ENGLISH, CardLanguage.SPANISH]))
        .toEqual({ name: "A", localizedNames: { en: "A", fr: "French A", es: "Spanish A"}});
      expect(await cardDao.getExactLocalizedName("Spanish A", [CardLanguage.ENGLISH, CardLanguage.SPANISH]))
        .toEqual({ name: "A", localizedNames: { en: "A", fr: "French A", es: "Spanish A"}});
    })

    it("Find by localized name will prefer languages by order", async () => {
      expect(await cardDao.getExactLocalizedName("A", [CardLanguage.FRENCH, CardLanguage.ENGLISH]))
        .toEqual({ name: "D", localizedNames: { en: "D", fr: "A", es: "Spanish D"}});
      expect(await cardDao.getExactLocalizedName("A", [CardLanguage.ENGLISH, CardLanguage.FRENCH]))
        .toEqual({ name: "A", localizedNames: { en: "A", fr: "French A", es: "Spanish A"}});
    })
  })

  describe('streamIn', () => {
    beforeEach(async () => {
      async function* generateCards() {
        yield { name: 'Lightning Bolt', colors: ['R'], manaValue: 1, type: 'Instant', legalities: {}, identifiers: {}, foreignData: [{language: "French", name: "Foudre" }] } as CardAtomic;
        yield { name: 'Counterspell', colors: ['U'], manaValue: 2, type: 'Instant', legalities: {}, identifiers: {}, foreignData: [{language: "Japanese", name: "ブラックロータス" }] } as CardAtomic;
      }

      await cardDao.streamIn(generateCards());
    })

    it('should stream in card data', async () => {
      const count = await db.cards.count();
      expect(count).toBe(2);
    });

    it('should also prepare the localized name index', async () => {
      const entity = await db.cards.get("Lightning Bolt")
      expect(entity.localizedNames[CardLanguage.FRENCH]).toBe("Foudre");
      expect(entity.localizedNames[CardLanguage.ENGLISH]).toBe("Lightning Bolt");
      expect(entity.localizedNames[CardLanguage.SPANISH]).toBeUndefined();
    });
  })

  describe('streamOut', () => {
    beforeEach(async () => {
      // Insert test data into the mock IndexedDB
      await db.cards.bulkPut([
        { name: "Lightning Bolt", manaCost: "{R}" } as CardEntity,
        { name: "Black Lotus", manaCost: "{0}" } as CardEntity,
        { name: "Phblthp", manaCost: "{1}{U}" } as CardEntity,
      ]);
    });

    it('should stream out all cards', async () => {
      const results: CardEntity[] = [];

      for await (const card of cardDao.streamOut(null)) {
        results.push(card);
      }

      expect(results).toHaveLength(3);
      expect(results[0].name).toBe("Black Lotus");
      expect(results[1].name).toBe("Lightning Bolt");
      expect(results[2].name).toBe("Phblthp");
    });

    it('should stream out cards by names', async () => {
      const names = ["Lightning Bolt", "Black Lotus", "Nonexistent Card"];
      const results: CardEntity[] = [];

      for await (const card of cardDao.streamOut(names)) {
        results.push(card);
      }

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe("Lightning Bolt");
      expect(results[1].name).toBe("Black Lotus");
    });
  })
});
