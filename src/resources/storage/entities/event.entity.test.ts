import { describe, it, expect } from "vitest";
import { isEventEntity } from "~/resources/storage/entities/event.entity"
import { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"

// Mock valid and invalid test cases
const validEvent = {
  id: "event123",
  title: "Test Event",
  date: new Date().toISOString(),
  organizer: {},
  players: [],
  teams: [],
  rounds: [],
  decks: [],
  mapping: null,
  spreadsheet: null,
  raw_data: {
    wotc: { eventName: "Test Event", date: "2023-03-01" },
    spreadsheet: [{ player: "John Doe", deck: "Burn" }],
  },
  version: 1,
  scrapeStatus: EventScrapeStateDbo.PURGED,
  lastUpdated: null,
  lastScrapedAt: null,
};

const missingRequiredFields = { id: "event456", title: "Incomplete Event" };
const invalidDate = { ...validEvent, date: "not-a-date" };
const missingRawData = { ...validEvent, raw_data: {} };
const invalidRawDataType = { ...validEvent, raw_data: "notAnObject" };

// Unit tests
describe("isEventEntity Type Guard", () => {
  it("should return true for a valid EventEntity", () => {
    expect(isEventEntity(validEvent)).toBe(true);
  });

  it("should return false if required fields are missing", () => {
    expect(isEventEntity(missingRequiredFields)).toBe(false);
  });

  it("should return false if date is not a Date object", () => {
    expect(isEventEntity(invalidDate)).toBe(false);
  });

  it("should return false if raw_data is missing wotc", () => {
    expect(isEventEntity(missingRawData)).toBe(false);
  });

  it("should return false if raw_data is not an object", () => {
    expect(isEventEntity(invalidRawDataType)).toBe(false);
  });
});
