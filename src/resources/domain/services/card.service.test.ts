import { beforeAll, describe, expect, it, vi } from "vitest"
import "fake-indexeddb/auto"
import CardService from "~/resources/domain/services/card.service"
import path from "node:path"
import { CardLanguage } from "~/resources/storage/entities/card.entity"
import MtgJsonService from "~/resources/integrations/mtg-json/service"
import { readFileSync } from "node:fs"
import { File } from "blob-polyfill"
import { isCardDbo } from "~/resources/domain/dbos/card.dbo"
import type SettingsService from "~/resources/domain/services/settings.service"
import { createMock } from "@golevelup/ts-vitest"

const subsetPath = path.resolve(__dirname, '../../../resources/integrations/mtg-json/data/AtomicCards_subset.json.gz');

const mockedSettingsService = createMock<SettingsService>({
  get: vi.fn(async () => ({
    searchLanguages: [CardLanguage.ENGLISH, CardLanguage.FRENCH, CardLanguage.SPANISH]
  })),
})
vi.doMock("~/resources/domain/services/settings.service", () => ({
  default: {
    getInstance: mockedSettingsService
  }
}))

describe('cardService', () => {
  const mtgJsonService = MtgJsonService.getInstance()
  const cardService = CardService.getInstance(undefined, mockedSettingsService);

  it('should be a singleton', () => {
    const cardService1 = CardService.getInstance();
    const cardService2 = CardService.getInstance();
    expect(cardService1).toBe(cardService2);
  })

  describe("Search within 1000 cards", () => {
    beforeAll(async () => {
      const fileBuffer = readFileSync(subsetPath);

      await mtgJsonService.importFromFile(
        new File([fileBuffer], "AtomicCards_subset.json.gz", { type: "application/gz" })
      )
      .then(({version, count}) => {
        console.log(`Imported ${count} cards from MTGJSON version ${version}`)
      })
      .catch((error) => {
        console.log(error)
      });
    }, 300000);

    it("should trigger indexing callbacks and update state", async () => {
      const startCallback = vi.fn();
      const progressCallback = vi.fn();
      const completeCallback = vi.fn();

      cardService.onIndexingStart(startCallback);
      cardService.onIndexingProgress(progressCallback);
      cardService.onIndexingComplete(completeCallback);

      const indexPromise = cardService.buildIndex();
      expect(cardService.getIndexingState()).toBe(true);

      await indexPromise;
      expect(cardService.getIndexingState()).toBe(false);
      expect(startCallback).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalledTimes(10);
      expect(completeCallback).toHaveBeenCalledWith(1000);
    });

    it('should have 1000 cards', async () => {
      expect(await cardService.count()).toBe(1000)
    })

    it('should have indexed 3 languages', async () => {
      const index = await cardService.getIndex()
      const keys = index.getIndex().toJSON().keys

      expect(keys).toHaveLength(3)
      expect(keys[0]).toSatisfy((key: {id: string}) => key.id === "localizedNames.en")
      expect(keys[1]).toSatisfy((key: {id: string}) => key.id === "localizedNames.fr")
      expect(keys[2]).toSatisfy((key: {id: string}) => key.id === "localizedNames.es")
    })

    it('a card has an localizedNames object', async () => {
      const card = await cardService.getCard("Ancient Spider")
      expect(card.localizedNames.en).toEqual("Ancient Spider")
      expect(card.localizedNames.fr).toEqual("Ancienne araignée")
      expect(card.localizedNames.es).toEqual("Araña antigua")
      expect(card.localizedNames.it).toEqual("Ragno Antico")
      expect(card.localizedNames.de).toEqual("Uralte Spinne")
      expect(card.localizedNames.pt_BR).toEqual("Aranha Anciã")
    })

    it('a card may miss some translations', async () => {
      const card = await cardService.getCard("Ancient Spider")

      expect(card.localizedNames.ru).toBeUndefined()
      expect(card.localizedNames.ph).toBeUndefined()
    })

    describe("Exact search", () => {
      it('should get card by exact name', async () => {
        expect(await cardService.getCard("Ancient Spider")).toMatchObject({
          name: "Ancient Spider",
        })
      })

      it('should NOT get card by exact name, if bad case', async () => {
        expect(await cardService.getCard("ancient SPIDER")).toBeNull()
      })

      it('should return null if unknown card', async () => {
        expect(await cardService.getCard("This card does not exists")).toBeNull()
      })
    })

    describe("Search ONE card", () => {
      it('should search card by exact name', async () => {
        expect(await cardService.searchCard("Ancient Spider")).toMatchObject({
          name: "Ancient Spider",
        })
      })

      it('should search card by exact name, if bad case', async () => {
        expect(await cardService.searchCard("ancient SPIDER")).toMatchObject({
          name: "Ancient Spider",
        })
      })
      it('should search card by approx name', async () => {
        expect(await cardService.searchCard("Ancent Spuder")).toMatchObject({
          name: "Ancient Spider",
        })
      })

      it('should search card by exact name, in indexed language', async () => {
        expect(await cardService.searchCard("Ancienne araignée", [CardLanguage.FRENCH])).toMatchObject({
          name: "Ancient Spider",
        })
      })

      it('should search card by approx name, in indexed language', async () => {
        expect(await cardService.searchCard("Ancienn araignee", [CardLanguage.FRENCH])).toMatchObject({
          name: "Ancient Spider",
        })
      })

      it('should search card by exact name, in non-indexed language', async () => {
        expect(await cardService.searchCard("Uralte Spinne", [CardLanguage.GERMAN])).toMatchObject({
          name: "Ancient Spider",
        })
      })

      it('should search card by approx name, in non-indexd language, will return null', async () => {
        expect(await cardService.searchCard("Uralt Spine", [CardLanguage.GERMAN])).toBeNull()
      })

      it('should search card by approx name in many options', async () => {
        const match = await cardService.searchCard("Goblin")
        expect(match).toMatchObject({
          name: "A-Sprouting Goblin",
        })
      })

      it('should return null if unknown card', async () => {
        expect(await cardService.searchCard("This card does not exists")).toBeNull()
      })
    })

    describe("Search MANY cards", () => {
      it('should search card by exact name', async () => {
        const results = await cardService.searchCards("Spider")

        expect(results).toHaveLength(4)
        expect(results[0].item).toSatisfy((card) => isCardDbo(card))
        expect(results[0].item.name).toBe("A-Thran Spider")
        expect(results[0].score).toBeLessThan(1)
      })
    })

  })
})

