import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import "fake-indexeddb/auto"
import MtgJsonService from "~/resources/integrations/mtg-json/service"
import { createFileStream } from "~/resources/utils/stream"
import path from "node:path"
import { File } from "blob-polyfill";
import { readFileSync } from "node:fs"
import CardDao from "~/resources/storage/card.dao"

const subsetPath = path.resolve(__dirname, '../../../resources/integrations/mtg-json/data/AtomicCards_subset.json.gz');
const startCallback = vi.fn();
const completeCallback = vi.fn();
const progressCallback = vi.fn();

describe('MtgJsonService', () => {
  const cardDao = CardDao.getInstance()
  const mtgJsonService = MtgJsonService.getInstance(cardDao);

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('Cancellation is a thing', () => {
    it('Cancelling should have an effect', async () => {
      const fileBuffer = readFileSync(subsetPath);
      const file = new File([fileBuffer], "AtomicCards_subset.json.gz", { type: "application/gz" });

      // Start import but do NOT await it immediately
      const importPromise = mtgJsonService.importFromFile(file);

      // Cancel after 300ms while the import is running
      setTimeout(() => {
        mtgJsonService.cancelImport();
      }, 300);

      // Now await the import and expect it to have stopped
      const result = await importPromise;

      expect(result.count).toBeGreaterThan(0);
      expect(result.version).toBe("5.2.2+20250309");
    })
  }, { timeout: 10000 });

  describe('With a 1000 card from local subset file', () => {
    beforeAll(async () => {
      await mtgJsonService.clear()
      mtgJsonService.onImportStart(startCallback);
      mtgJsonService.onImportComplete(completeCallback);
      mtgJsonService.onImportProgress(progressCallback, 100);
    })

    it('should have call the callbacks', async () => {
      const fileBuffer = readFileSync(subsetPath);

      const out = await mtgJsonService.importFromFile(
        new File([fileBuffer], "AtomicCards_subset.json.gz", { type: "application/gz" })
      );

      expect(out).toMatchObject({
        count: expect.toSatisfy((count) => count === 1000),
        version: "5.2.2+20250309"
      });

      expect(startCallback).toHaveBeenCalledWith(0);
      expect(progressCallback).toHaveBeenCalledTimes(10);
      expect(progressCallback).toHaveBeenCalledWith(100);
      expect(progressCallback).toHaveBeenCalledWith(200);
      expect(progressCallback).toHaveBeenCalledWith(300);
      expect(completeCallback).toHaveBeenCalledWith(1000);
    })
  }, { timeout: 60000 });

  describe('With a 1000 card from mocked WEB subset', () => {
    beforeEach(() => {
      vi.spyOn(cardDao, 'streamIn').mockResolvedValue();

      const testWebStream = createFileStream(subsetPath);

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          body: testWebStream,
        })
      ) as unknown as typeof fetch;
    });

    it('should process and store card data from a local file', async () => {
      await mtgJsonService.importFromWebsite();

      expect(cardDao.streamIn).toHaveBeenCalled();
      expect(cardDao.count()).resolves.toBe(1000)
    });

    it('should return the actual file version', async () => {
      const response = await mtgJsonService.importFromWebsite()

      expect(response.version).toBe("5.2.2+20250309")
    });
  }, { timeout: 10000 });

  describe('Remote access to the latest MTGJSON model version', () => {
    it('should fetch the latest MTGJSON model version', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ meta: { version: '5.2.2+20250309', date: "2025-03-09" } })
        })
      ) as unknown as typeof fetch;

      const version = await mtgJsonService.getRemoteVersion();
      expect(version).toBe('5.2.2+20250309');
    });
  })
});
