import { SETUP_STEPS } from "~/resources/ui/components/event/setup/config";
  import type {
  SpreadsheetData,
  SpreadsheetMetadata,
  SpreadsheetRawData, SpreadsheetRawRow,
  SpreadsheetRow
} from "~/resources/domain/dbos/spreadsheet.dbo"
  import { COLUMN_TYPE, COLUMN_TYPE_META } from "~/resources/domain/enums/spreadsheet.dbo"
import { SpreadsheetDataFactory } from "~/resources/domain/parsers/spreadsheet.data.factory"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { MappingDbo, PairingMode } from "~/resources/domain/dbos/mapping.dbo"

  export class SetupStatus {
    private _duplicates: Record<string, SpreadsheetData>;
    private _rawDuplicates: Record<string, SpreadsheetRawData>

    constructor(
      public readonly meta: SpreadsheetMetadata,
      public readonly rawData: SpreadsheetRawData | null,
      public readonly data: SpreadsheetData | null,
      public readonly pairs: MappingDbo | null,
      public readonly players: number
    ) {
      this._rawDuplicates = this.regroupRawDuplicates();
      this._duplicates = this.regroupDuplicates();
    }

    static async create(meta: SpreadsheetMetadata, data: SpreadsheetRawData | null, pairs: MappingDbo | null = null, players: number): Promise<SetupStatus> {
      const factory = new SpreadsheetDataFactory(meta, data)
      return new SetupStatus(meta, data, await factory.generate(), pairs, players);
    }

    get rows() {
      return this.data.length
    }

    get columns() {
      return this.meta.columns.length
    }

    get duplicates(): Record<string, SpreadsheetData> {
      return this._duplicates;
    }

    get duplicateRows() {
      return Object.values(this._duplicates).length;
    }

    get rawDuplicates() {
      return this._rawDuplicates;
    }

    get rawDuplicateRows() {
      return Object.values(this._rawDuplicates).length;
    }

    get missingColumns() {
      return Object.entries(COLUMN_TYPE_META)
        .filter(([, meta]) => meta.mandatory)
        .map(([type]) => type)
        .filter((type) => !this.meta.columns.some((col) => col.type === type))
        .map((type) => COLUMN_TYPE_META[type].label);
    }

    get isMappingComplete() {
      const mandatoryTypes = Object.entries(COLUMN_TYPE_META)
        .filter(([, meta]) => meta.mandatory)
        .map(([type]) => type);

      const presentTypes: string[] = this.meta.columns.map(({ type }) => type);

      return mandatoryTypes.every((type) => presentTypes.includes(type));
    }

    get furthestStepIndex() {
      return SETUP_STEPS.findIndex(({ isComplete }) => !isComplete(this));
    }

    get furthestStep() {
      return this.furthestStepIndex !== -1 ? SETUP_STEPS[this.furthestStepIndex] : SETUP_STEPS[0];
    }

    get progressPercentage() {
      return ((this.furthestStepIndex + 1) / SETUP_STEPS.length) * 100;
    }

    isStepDisabled(key: number): boolean {
      const stepIndex = SETUP_STEPS.findIndex(step => step.key === key);

      // If step not found, default to disabled
      if (stepIndex === -1) return true;

      // If step is before or equal to the furthest step, it's enabled
      return stepIndex > this.furthestStepIndex;
    }

    get hasData() {
      return this.rawData !== null && this.rawData.length > 0;
    }

    get hasMapping() {
      return this.meta.columns !== null && this.meta.columns.length > 0;
    }

    get hasPairings() {
      return this.pairs !== null && Object.keys(this.pairs).length > 0;
    }

    get hasAllPairings() {
      return this.pairs !== null && Object.keys(this.pairs).length >= Math.min(this.players, this.rows);
    }

    getRowByWotcId(wotcId: WotcId): SpreadsheetRow | null {
      const spreadsheetId = this.pairs?.[wotcId]?.rowId;
      return spreadsheetId ? this.data.find((row) => row.id === spreadsheetId) : null;
    }

    getModeByWotcId(wotcId: WotcId): PairingMode | null {
      return this.pairs?.[wotcId]?.mode;
    }

    getWotcIdByRow(row: SpreadsheetRow): WotcId | null {
      if (!this.pairs) return null;
      return Object.entries(this.pairs).find(([_, mappingEntry]) => mappingEntry.rowId === row.id)?.[0] ?? null;
    }

    get hasDuplicates() {
      return this.duplicateRows > 0;
    }

    get uniqueColumnIndex() {
      try {
        return this.meta.columns.find(({ type }) => type === COLUMN_TYPE.UNIQUE_ID)?.index;
      } catch (error) {
        console.error("Error getting unique column index:", error);
        return undefined;
      }
    }

    private regroupRawDuplicates(): Record<string, SpreadsheetRawRow[]> {
      if (!this.hasData || !this.hasMapping) return { };

      const uniqueColumnIndex = this.uniqueColumnIndex
      const uniqueValues = this.rawData.map((row) => row[uniqueColumnIndex]);

      const regrouped = uniqueValues.reduce((acc, value) => {
        acc[value] = this.data.filter((row) => row.id === value);
        return acc
      }, {})

      return Object.fromEntries(
        Object.entries(regrouped)
          .filter(([, rows]: [string, SpreadsheetData]) => rows.length > 1)
      ) as Record<string, SpreadsheetRawRow[]>;
    }

    private regroupDuplicates(): Record<string, SpreadsheetRow[]> {
      if (!this.hasData || !this.hasMapping) return { };

      const uniqueValues = this.data.map((row) => row.id);

      const regrouped = uniqueValues.reduce((acc, value) => {
        acc[value] = this.data.filter((row) => row.id === value);
        return acc
      }, {})

      return Object.fromEntries(
        Object.entries(regrouped)
          .filter(([, rows]: [string, SpreadsheetData]) => rows.length > 1)
      ) as Record<string, SpreadsheetData>;
    }
  }