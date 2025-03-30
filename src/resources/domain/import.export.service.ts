import { getLogger } from "~/resources/logging/logger";
import { EventDao } from "~/resources/storage/event.dao";
import EventEntity, { isUpToDateEntity } from "~/resources/storage/entities/event.entity"
import { GzipUtils } from "~/resources/utils/gzip"
import EventHydrator from "~/resources/storage/hydrators/event.hydrator"

export enum formats {
  GZIP = 'gzip',
  JSON = 'json',
  LDJSON = 'ldjson'
}
const logger = getLogger("import-export-service");
export const LDJSON_DELIMITER = "\n";

class ImportExportError extends Error {
  constructor(message) {
    super(message);
    this.name = "ImportExportError";
  }
}

export class InvalidEventFormatError extends ImportExportError {
  constructor() {
    super("Invalid event format");
    this.name = "InvalidEventFormatError";
  }
}

export class FileProcessingError extends ImportExportError {
  constructor(message) {
    super(message);
    this.name = "FileProcessingError";
  }
}

export class ExportNotFoundError extends ImportExportError {
  constructor(message) {
    super(message);
    this.name = "ExportNotFoundError";
  }
}

export class ImportExportService {
  private dao: EventDao
  private progressCallback: (index: number, size: number | null) => Promise<void>;
  private index: number
  private size: number | null

  constructor(dao: EventDao = EventDao.getInstance(),
              progressCallback: (index: number, size: number) => Promise<void> = () => Promise.resolve())
  {
    this.dao = dao
    this.index = 0
    this.size = null
    this.progressCallback = progressCallback || (() => Promise.resolve());
  }

  public onProgress(callback: (index: number, size: number) => Promise<void>) {
    this.progressCallback = callback;
  }

  public async detectFormat(stream: ReadableStream): Promise<formats> {
    const reader = stream.getReader();

    const { value } = await reader.read();
    if (!value) throw new FileProcessingError("Empty stream");

    // Check headers for GZIP
    const header = new Uint8Array(value.slice(0, 4));
    if (header[0] === 0x1f && header[1] === 0x8b) return formats.GZIP; // Gzip header

    let buffer = new TextDecoder().decode(value);

    const firstChar = buffer.trimStart()[0];
    if (firstChar !== "{") throw new FileProcessingError("Invalid JSON format");

    while (true) {
      const { value, done } = await reader.read();

       // Look for the first newline
      const newlineIndex = buffer.indexOf(LDJSON_DELIMITER);
      if (newlineIndex !== -1) {
        const currentLine = buffer.slice(0, newlineIndex);

        if (currentLine.trimEnd()[currentLine.length - 1] !== "}") {
          return formats.JSON;
        }

        try {
          JSON.parse(currentLine);
        } catch (error) {
          // The line is incomplete JSON
          return formats.JSON
        }
      }

      buffer += new TextDecoder().decode(value);
      if (done) break;
    }

    return formats.LDJSON
  }

  private async *parseJson(stream: ReadableStream, format: formats.JSON | formats.LDJSON) {
    logger.debug(`Parsing ${format} stream`);

    const reader = stream.getReader();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += new TextDecoder().decode(value);

      if (format === formats.LDJSON) {
        let lines = buffer.split(LDJSON_DELIMITER);
        buffer = lines.pop() || ""; // Keep incomplete part in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const event = JSON.parse(line);
            if (!event.id) throw new InvalidEventFormatError();
            yield event;
            await this.callProgressCallback()
          } catch (error) {
            logger.error(`Failed to parse LDJSON line: ${line}`);
            throw new InvalidEventFormatError();
          }
        }
      }
    }

    // Final buffer processing after stream ends
    if (format === formats.LDJSON && buffer.trim()) {
      try {
        const event = JSON.parse(buffer);
        if (!event.id) throw new InvalidEventFormatError();
        yield event;
        await this.callProgressCallback()
      } catch (error) {
        logger.error(`Failed to parse final LDJSON fragment: ${buffer}`);
        throw new InvalidEventFormatError();
      }
    }

    if (format === formats.JSON) {
      try {
        const parsed = JSON.parse(buffer);
        yield isUpToDateEntity(parsed) ? parsed : EventHydrator.hydrate(parsed as EventEntity);
        await this.callProgressCallback()
      } catch (error) {
        logger.error(`Failed to parse full JSON object: ${buffer}`);
        throw new InvalidEventFormatError();
      }
    }
  }

  private async *decompressStream(stream: ReadableStream, format: formats) {
    if (format === formats.GZIP) {
      stream = GzipUtils.gunzipStream(stream)
    }

    yield* this.parseJson(stream, format === formats.GZIP ? formats.LDJSON : format);
  }

  protected async callProgressCallback() {
    this.index++;
    try {
      await this.progressCallback(this.index, this.size);
    } catch (error) {
      logger.debug("Progress callback failed", error);
    }
  }

  async importEvents(stream: ReadableStream) {
    let format: formats | null
    const [streamDetection, streamCompression] = stream.tee();

    try {
      format = await this.detectFormat(streamDetection);
    }  catch (error) {
      logger.error("Crashed while detecting format", error);
      throw new InvalidEventFormatError();
    }

    if (!format) {
      throw new FileProcessingError("Unsupported format");
    }

    try {
      logger.info(`Detected format: ${format}`);
      const eventStream = this.decompressStream(streamCompression, format);
      await this.dao.streamIn(eventStream);
    } catch (error) {
      logger.error("Failed to import events", error);
      throw new FileProcessingError("Import failed");
    }
  }

  async exportEvents(
    stream: WritableStream,
    eventIds: string[] | null,
    format: Exclude<formats, formats.LDJSON> = formats.JSON
  ) {
    let isFirst = true;
    if (eventIds) {
      this.size = await this.dao.countWith("id", eventIds);
    } else {
      this.size = await this.dao.count()
    }

    if (this.size === 0) {
      logger.warn("No events to export");
      throw new ExportNotFoundError("No events to export");
    }
    const space = this.size === 1 ? 2 : 0

    let writer: WritableStreamDefaultWriter;
    try {
      if (format === formats.GZIP) {
        try {
          stream = GzipUtils.gzipWritableStream(stream);
        } catch (error) {
          logger.error("Failed to compress stream", error);
          throw new FileProcessingError("Export failed");
        }
      }
      writer = stream.getWriter();

      for await (const event of this.dao.streamOut(eventIds)) {
        await writer.write(new TextEncoder().encode(
          (isFirst ? "" : LDJSON_DELIMITER) + JSON.stringify(event, null, space)
        ));
        isFirst = false;
        await this.callProgressCallback();
      }
    } catch (error) {
      logger.error("Failed to export events", error);
      throw new FileProcessingError("Export failed");
    } finally {
      await writer?.close(); // ✅ Ensure the writer is always closed
    }
  }


}
