import { describe, it, expect } from "vitest";
import { isEventWriteDbo } from "~resources/domain/dbos/event.write.dbo"

// Mock valid and invalid test cases
const validEvent = {
  id: "event123",
  raw_data: {
    wotc: { eventName: "Test Event", date: "2023-03-01" },
    spreadsheet: [{ player: "John Doe", deck: "Burn" }],
  },
};

const missingRawData = { id: "event456" };
const missingWotc = { id: "event789", raw_data: {} };
const invalidRawDataType = { id: "event999", raw_data: "notAnObject" };
const nullRawData = { id: "event111", raw_data: null };

// Unit tests
describe("isEventWriteDbo Type Guard", () => {
  it("should return true for a valid EventWriteDbo", () => {
    expect(isEventWriteDbo(validEvent)).toBe(true);
  });

  it("should return false if raw_data is missing", () => {
    expect(isEventWriteDbo(missingRawData)).toBe(false);
  });

  it("should return false if raw_data.wotc is missing", () => {
    expect(isEventWriteDbo(missingWotc)).toBe(false);
  });

  it("should return false if raw_data is not an object", () => {
    expect(isEventWriteDbo(invalidRawDataType)).toBe(false);
  });

  it("should return false if raw_data is null", () => {
    expect(isEventWriteDbo(nullRawData)).toBe(false);
  });
});