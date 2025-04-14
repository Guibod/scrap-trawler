import { beforeEach, describe, expect, it } from "vitest";
import { SetupStatus } from "~/resources/ui/components/event/setup/status";
import type { SpreadsheetMetadata, SpreadsheetRawData } from "~/resources/domain/dbos/spreadsheet.dbo";
import { COLUMN_TYPE, DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo";

describe("SetupStatus", () => {
  let meta: SpreadsheetMetadata;
  let rawData: SpreadsheetRawData;

  beforeEach(() => {
    meta = {
      source: "Google Sheets",
      sourceType: "url",
      autodetect: false,
      sheet: "Sheet1",
      filters: [],
      duplicateStrategy: DUPLICATE_STRATEGY.NONE,
      finalized: false,
      format: null,
      columns: [
        { type: COLUMN_TYPE.UNIQUE_ID, index: 0, name: "ID", originalName: "id but longer" },
        { type: COLUMN_TYPE.FIRST_NAME, index: 1, name: "Name", originalName: "Name but longer" },
      ],
    };

    rawData = [
      ["1", "Alice"],
      ["2", "Bob"],
      ["3", "Charlie"],
      ["4", "Alice"],
      ["4", "Lulu"],
    ];
  });

  it("should create an instance of SetupStatus", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus).toBeInstanceOf(SetupStatus);
  });

  it("should return the correct number of rows", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.rows).toBe(5);
  });

  it("should return the correct number of columns", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.columns).toBe(2);
  });

  it("should correctly identify missing mandatory columns", async () => {
    meta.columns = [{ type: COLUMN_TYPE.UNIQUE_ID, index: 0, name: "ID", originalName: "id but longer" }];
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.missingColumns).toContain("First Name");
  });

  it("should correctly compute progress percentage", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.progressPercentage).toBeGreaterThan(0);
    expect(setupStatus.progressPercentage).toBeLessThanOrEqual(100);
  });

  it("should disable steps correctly", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.isStepDisabled(1)).toBe(false); // Data exists
    expect(setupStatus.isStepDisabled(2)).toBe(false); // Mapping exists
    expect(setupStatus.isStepDisabled(3)).toBe(true);  // Mapping not complete
  });

  it("should detect duplicate rows", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.hasDuplicates).toBe(true);
  });

  it("should return false for duplicate detection when unique", async () => {
    rawData = [["1", "Alice"], ["2", "Bob"], ["3", "Charlie"]];
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.hasDuplicates).toBe(false);
  });

  it("should handle an empty dataset correctly", async () => {
    rawData = [];
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.hasData).toBe(false);
    expect(setupStatus.rows).toBe(0);
  });

  it("should return the correct furthest step index", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.furthestStepIndex).toBeGreaterThanOrEqual(0);
  });

  it("should correctly compute isMappingComplete", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.isMappingComplete).toBe(false);
  });

  it("should identify unique column index correctly", async () => {
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.uniqueColumnIndex).toBe(0);
  });

  it("should handle missing unique ID column correctly", async () => {
    meta.columns = [{ type: COLUMN_TYPE.FIRST_NAME, index: 1, name: "Name", originalName: "Name but longer" }];
    const setupStatus = await SetupStatus.create(meta, rawData, {}, 1);
    expect(setupStatus.uniqueColumnIndex).equals(undefined);
  });
});
