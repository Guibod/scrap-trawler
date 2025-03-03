import type { SpreadsheetMetadata } from "~resources/domain/dbos/spreadsheet.dbo"
import type { SpreadsheetParser } from "~resources/domain/parsers/spreadsheet.parser"
import { CSVParser } from "~resources/domain/parsers/spreadsheet.parser.csv"
import { ExcelParser } from "~resources/domain/parsers/spreadsheet.parser.excel"
import { GoogleSheetsParser } from "~resources/domain/parsers/spreadsheet.parser.google"
import { getLogger } from "~resources/logging/logger"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"

const logger = getLogger("SpreadsheetParserFactory");

export class SpreadsheetParserFactory {
  static create(metadata: SpreadsheetMetadata, players: Record<string, PlayerDbo>): SpreadsheetParser {
    const extension = metadata.source.split(".").pop()?.toLowerCase();
    logger.debug(`Creating parser for ${metadata.source} with extension ${extension}`);

    const {firstNames, lastNames} = SpreadsheetParserFactory.buildNameSets(players);

    if (extension === "csv") {
      logger.debug("Creating CSV parser");
      return new CSVParser(metadata, firstNames, lastNames);
    } else if (extension === "xls" || extension === "xlsx") {
      logger.debug("Creating Excel parser");
      return new ExcelParser(metadata, firstNames, lastNames);
    } else if (metadata.source.startsWith("http")) {
      logger.debug("Creating Google Sheets parser");
      return new GoogleSheetsParser(metadata, firstNames, lastNames);
    } else {
      logger.error(`Unsupported file type or source (${metadata.source})`);
      throw new Error("Unsupported file type or source");
    }
  }

  /**
   * Extracts known first names and last names from a record of PlayerDbo objects.
   * @param players Record<string, PlayerDbo> - A dictionary of players keyed by their unique ID.
   * @returns { firstNames: Set<string>, lastNames: Set<string> } - Extracted sets of first and last names.
   */
  static buildNameSets(players: Record<string, PlayerDbo>): { firstNames: Set<string>, lastNames: Set<string> } {
    const firstNames = new Set<string>();
    const lastNames = new Set<string>();

    Object.values(players).forEach(player => {
      if (player.firstName && typeof player.firstName === "string") {
        firstNames.add(player.firstName.trim());
      }
      if (player.lastName && typeof player.lastName === "string") {
        lastNames.add(player.lastName.trim());
      }
    });

    return { firstNames, lastNames };
  }
}
