import { getLogger } from "~/resources/logging/logger"
import CardDao from "~/resources/storage/card.dao"
import CardEntity, { CardAtomic, isCardAtomic, isCardAtomicArray } from "~/resources/storage/entities/card.entity"
import {
  MtgJsonNotFoundException,
  MtgJsonVersionException,
  MtgJsonWriteStreamException
} from "~/resources/integrations/mtg-json/exceptions"
import {
  type JsonValueAndPath,
  parseJsonStreamWithPaths,
  streamToIterable
} from "json-stream-es"
import { ExtractVersionTransform } from "~/resources/integrations/mtg-json/stream/extract.version"
import SettingsService from "~/resources/domain/services/settings.service"
import { CardMapper } from "~/resources/domain/mappers/card.mapper"

export type MtgJsonImportCompletion = { version: string, count: number } | null

const DEFAULT_IMPORTATION_SIZE = 32000

export default class MtgJsonService {
  private static instance: MtgJsonService | null = null;
  private logger = getLogger(this.constructor.name);
  private cardDao: CardDao;
  private settingsService: SettingsService
  private readonly MTGJSON_ATOMIC_CARDS_URL = 'https://mtgjson.com/api/v5/AtomicCards.json.gz';
  private readonly MTGJSON_META_URL = 'https://mtgjson.com/api/v5/Meta.json';
  private importStartCallback: (count: number) => Promise<void> | null = null;
  private importCompleteCallback: (count: number) => Promise<void> | null = null;
  private importProgressCallback: (index: number) => Promise<void> | null = null;
  private importProgressInterval: number = 100
  private processed: number = 0
  private abortController: AbortController

  private constructor(cardDao: CardDao, settingsService: SettingsService) {
    this.cardDao = cardDao;
    this.settingsService = settingsService;
    this.abortController = new AbortController();
  }

  static getInstance(cardDao: CardDao = CardDao.getInstance(), settingsService: SettingsService = SettingsService.getInstance()): MtgJsonService {
    if (!MtgJsonService.instance) {
      MtgJsonService.instance = new MtgJsonService(cardDao, settingsService);
    }
    return MtgJsonService.instance;
  }

  cancelImport() {
    this.logger.debug("User canceled the import process");
    this.abortController.abort();
    this.abortController = new AbortController(); // Reset for future imports
  }

  onImportStart(callback: (count: number) => Promise<void>): void {
    this.importStartCallback = callback;
  }

  onImportComplete(callback: (count: number) => Promise<void>): void {
    this.importCompleteCallback = callback;
  }

  onImportProgress(callback: (index: number) => Promise<void>, interval = 100): void {
    this.importProgressInterval = interval;
    this.importProgressCallback = callback;
  }

  async importFromWebsite(): Promise<MtgJsonImportCompletion> {
    this.logger.info(`Fetching MTGJSON data from ${this.MTGJSON_ATOMIC_CARDS_URL}...`);

    return this.importWrapper(
      fetch(this.MTGJSON_ATOMIC_CARDS_URL, {signal: this.abortController.signal})
        .then((response) => {
          if (!response.ok) {
            this.logger.error(`Got ${response.status} from MTGJSON atomic cards endpoint`);
            throw new MtgJsonNotFoundException(`Got ${response.status} from MTGJSON atomic cards endpoint`);
          }
          if (!response.body) {
            throw new Error("Response body is null. Unable to fetch data.");
          }
          return this.processJsonStream(response.body);
        })
        .then(async (response) => {
          if (response) {
            return response
          }
          this.logger.warn("MTGJSON version was not found in the payload.");
          return null
        })
        .catch((error) => {
          this.logger.error("Error during fetch and store process", error);
          throw error;
        })
    );
  }

  async importFromFile(file: File): Promise<MtgJsonImportCompletion> {
    return this.importWrapper(
      this.processJsonStream(file.stream())
    )
  }

  async processJsonStream(stream: ReadableStream<Uint8Array>): Promise<MtgJsonImportCompletion> {
    const [metaStream, dataStream] = stream
      .pipeThrough(new DecompressionStream("gzip"))
      .tee()

    let version: string | null = null;

    try {
      version = await this.extractVersion(metaStream);

      await this.streamData(dataStream);

      this.logger.info("MTG-JSON data successfully stored.");
      await this.settingsService.setOne("mtgJsonVersion", version);
    } catch (error) {
      console.log(error)
      this.logger.error("Failed to store MTG-JSON data", error);
    }

    return { version, count: this.processed };
  }

  private async streamData(dataStream: ReadableStream<any>): Promise<void> {
    const reportAndRespite = this.progressReport.bind(this);

    try {
      const parsedStream = dataStream
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(parseJsonStreamWithPaths(["data"]))
        .pipeThrough(new TransformStream<JsonValueAndPath, CardEntity>({
          async transform(chunk, controller) {
            if (isCardAtomicArray(chunk.value)) {
              await reportAndRespite();
              const entity = CardMapper.fromAtomicArray(chunk.value);
              controller.enqueue(entity);
            }
          }
        }, {
          highWaterMark: 10 // small for memory efficiency
        }), {
          signal: this.abortController.signal
        })

      const iterable = streamToIterable<CardEntity>(parsedStream)

      await this.cardDao.streamIn(iterable, 500)
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        this.logger.warn("Import process was aborted by user");
        return
      }

      this.logger.error("Failed to parse MTG-JSON data", error)
      throw new MtgJsonWriteStreamException("Failed to parse MTG-JSON data")
    }
  }

  private async extractVersion(metaStream: ReadableStream<any>): Promise<string | null> {
    try {
      this.logger.debug("Parsing MTG-JSON metadata...")
      const versionStream = metaStream
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new ExtractVersionTransform())

      return versionStream
        .getReader()
        .read()
        .then(({ value }) => {
          if (!value) {
            this.logger.warn("Parsing MTG-JSON meta data found nothing...")
          }
          return value || null
        })
    } catch (error) {
      throw new MtgJsonVersionException("Failed to parse MTG-JSON metadata")
    }
  }

  async getRemoteVersion(): Promise<string> {
    this.logger.debug('Fetching MTGJSON metadata...');
    const response = await fetch(this.MTGJSON_META_URL);
    if (!response.ok) {
      this.logger.error(`Got ${response.status} from MTGJSON metadata endpoint`);
      throw new MtgJsonNotFoundException(`Got ${response.status} from MTGJSON metadata endpoint`);
    }

    const data = await response.json();
    this.logger.info(`MTG-JSON latest release is ${data.meta.version}`);
    return data.meta.version
  }

  async getLocalVersion(): Promise<string | null> {
    return this.settingsService.get().then((settings) => {
      return settings.mtgJsonVersion
    })
  }

  /**
   * Reports progress to the callback
   * @private
   */
  private async progressReport() {
    this.processed++;

    // Measure processing speed every 100 items
    if (this.processed % 100 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Yield to event loop
    }

    if (this.importProgressCallback && this.processed % this.importProgressInterval === 0) {
      this.logger.debug(`Processed ${this.processed} cards, notifying via callback...`);
      this.importProgressCallback(this.processed);
    }
  }


  /**
   * Wraps the import process with callbacks
   * @private
   */
  private async importWrapper(promise: Promise<MtgJsonImportCompletion>) {
    this.processed = 0;
    this.abortController = new AbortController();
    if (this.importStartCallback) {
      await this.cardDao.count()
        .then((count) => {
          this.importStartCallback(count);
        })
    }

    return promise
      .then(async (response) => {
        if (this.importCompleteCallback) {
          await this.cardDao.count()
            .then((count) => {
              this.importCompleteCallback(count);
            })
        }
        return response;
      })
      .catch(async (error) => {
        if (this.importCompleteCallback) {
          await this.cardDao.count()
            .then((count) => {
              this.importCompleteCallback(count);
            })
        }
        throw error
      })
  }

  async estimateImportSize(): Promise<number> {
    return this.cardDao.count()
      .then((count) => {
        return Math.max(DEFAULT_IMPORTATION_SIZE, count)
      })
  }

  count() {
    return this.cardDao.count()
  }

  clear() {
    return this.cardDao.clear()
  }
}
