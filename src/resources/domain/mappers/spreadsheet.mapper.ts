import { hashStringSHA256 } from "~resources/utils/crypto"
import type { ProcessedSpreadsheetRow, SpreadsheetMetadata } from "~resources/domain/dbos/spreadsheet.dbo"
import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo"

export async function mapSpreadsheetData(rawData: string[][], metadata: SpreadsheetMetadata): Promise<ProcessedSpreadsheetRow[]> {
  if (!rawData || rawData.length < 2) return []; // Ensure data exists

  const [headerRow, ...dataRows] = rawData;

  const processedRows = await Promise.all(dataRows.map(async (row) => {
    const processedRow: ProcessedSpreadsheetRow = {
      [COLUMN_TYPE.FIRST_NAME]: null,
      [COLUMN_TYPE.LAST_NAME]: null,
      [COLUMN_TYPE.UNIQUE_ID]: null,
      [COLUMN_TYPE.ARCHETYPE]: null,
      [COLUMN_TYPE.DECKLIST_URL]: null,
      [COLUMN_TYPE.PLAYER_DATA]: {},
    };

    Object.keys(metadata.columns).forEach((columnName) => {
      const columnIndex = headerRow.indexOf(columnName);
      if (columnIndex === -1) return; // Skip if column is missing

      const columnType = metadata.columns[columnName];
      if (columnType === COLUMN_TYPE.PLAYER_DATA) {
        processedRow[COLUMN_TYPE.PLAYER_DATA]![columnName] = row[columnIndex];
      } else {
        processedRow[columnType] = row[columnIndex];
      }
    });

    // Compute a unique ID if missing
    if (!processedRow[COLUMN_TYPE.UNIQUE_ID]) {
      const uniqueString = [
        processedRow[COLUMN_TYPE.FIRST_NAME] || "",
        processedRow[COLUMN_TYPE.LAST_NAME] || "",
        processedRow[COLUMN_TYPE.DECKLIST_URL] || "",
      ].join("|").trim();

      if (uniqueString.replace(/\|/g, "").length > 0) { // Ensure some content exists
        processedRow[COLUMN_TYPE.UNIQUE_ID] = await hashStringSHA256(uniqueString);
      }
    }

    return processedRow;
  }));

  return processedRows;
}
