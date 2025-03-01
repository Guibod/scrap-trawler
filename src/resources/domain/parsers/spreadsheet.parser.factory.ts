import type { SpreadsheetMetadata } from "~resources/domain/dbos/spreadsheet.dbo"
import type { SpreadsheetParser } from "~resources/domain/parsers/spreadsheet.parser"
import { CSVParser } from "~resources/domain/parsers/spreadsheet.parser.csv"
import { ExcelParser } from "~resources/domain/parsers/spreadsheet.parser.excel"
import { GoogleSheetsParser } from "~resources/domain/parsers/spreadsheet.parser.google"
import { getLogger } from "~resources/logging/logger"

const logger = getLogger("SpreadsheetParserFactory");

export class SpreadsheetParserFactory {
  static create(metadata: SpreadsheetMetadata): SpreadsheetParser {
    const extension = metadata.source.split(".").pop()?.toLowerCase();
    logger.debug(`Creating parser for ${metadata.source} with extension ${extension}`);

    if (extension === "csv") {
      logger.debug("Creating CSV parser");
      return new CSVParser(metadata);
    } else if (extension === "xls" || extension === "xlsx") {
      logger.debug("Creating Excel parser");
      return new ExcelParser(metadata);
    } else if (metadata.source.startsWith("http")) {
      logger.debug("Creating Google Sheets parser");
      return new GoogleSheetsParser(metadata);
    } else {
      logger.error(`Unsupported file type or source (${metadata.source})`);
      throw new Error("Unsupported file type or source");
    }
  }
}
