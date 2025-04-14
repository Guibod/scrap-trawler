import { describe, it, expect, beforeEach } from "vitest";
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo";
import type { SpreadsheetRawRow } from "~/resources/domain/dbos/spreadsheet.dbo";
import { faker } from "@faker-js/faker";
import { SpreadsheetColumnDetector } from "~/resources/domain/parsers/column.detector" // **Using Faker.js for realistic data!**

// **Realistic Name Dataset**
const knownFirstNames = [
  "Alice", "John", "Pierre", "Thomas", "Emma", "Michael", "Sophia", "Julien", "Kevin", "Hugo", "Raphael",
  "Alexandre", "Matthieu", "Guillaume", "Cyril", "Yann", "Sebastien"
];
const knownLastNames = [
  "Smith", "Dupont", "Johnson", "Brown", "Williams", "Davis", "Boddaert", "Andreotti", "Bouleau", "Laurent", "Garreau"
];

let detector: SpreadsheetColumnDetector;

beforeEach(() => {
  detector = new SpreadsheetColumnDetector(knownFirstNames, knownLastNames);
});

describe("SpreadsheetColumnDetector (Row-Major Format)", () => {
  describe("🔹 `detectColumns` (Full Table Detection)", () => {
    it("assigns high-priority columns first", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        faker.internet.url(), // Decklist URL
        faker.helpers.arrayElement(knownFirstNames), // First Name
        faker.helpers.arrayElement(knownLastNames), // Last Name
        "1 Lightning Bolt\n1 Forest\n1 Island", // Decklist TXT
        faker.internet.email() // Unique ID
      ]);

      const detected = detector.detectColumns(data);
      expect(detected.get(0)).toBe(COLUMN_TYPE.DECKLIST_URL);
      expect(detected.get(1)).toBe(COLUMN_TYPE.FIRST_NAME);
      expect(detected.get(2)).toBe(COLUMN_TYPE.LAST_NAME);
      expect(detected.get(3)).toBe(COLUMN_TYPE.DECKLIST_TXT);
      expect(detected.get(4)).toBe(COLUMN_TYPE.UNIQUE_ID);
    });

    it("ensures multiple UNIQUE_ID columns can exist", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        faker.internet.email(),
        faker.internet.email()
      ]);

      const detected = detector.detectColumns(data);
      expect(detected.get(0)).toBe(COLUMN_TYPE.UNIQUE_ID);
      expect(detected.get(1)).toBe(COLUMN_TYPE.IGNORED_DATA); // Only one assigned
    });

    it("ensures only one DECKLIST_URL column is detected", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        faker.internet.url(),
        faker.internet.url()
      ]);

      const detected = detector.detectColumns(data);
      expect(detected.get(0)).toBe(COLUMN_TYPE.DECKLIST_URL);
      expect(detected.get(1)).toBe(COLUMN_TYPE.IGNORED_DATA); // Only one assigned
    });

    it("detects a single DECKLIST_TXT column", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        "1 Lightning Bolt\n1 Forest\n1 Island",
        "1 Arid Mesa\n2 Mountain\n1 Snapcaster Mage"
      ]);

      const detected = detector.detectColumns(data);
      expect(detected.get(0)).toBe(COLUMN_TYPE.DECKLIST_TXT);
      expect(detected.get(1)).toBe(COLUMN_TYPE.IGNORED_DATA);
    });

    it("detects first and last names separately", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        faker.helpers.arrayElement(knownFirstNames),
        faker.helpers.arrayElement(knownLastNames),
      ]);

      const detected = detector.detectColumns(data);
      expect(detected.get(0)).toBe(COLUMN_TYPE.FIRST_NAME);
      expect(detected.get(1)).toBe(COLUMN_TYPE.LAST_NAME);
    });

    it("detects numeric user data correctly", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        faker.string.numeric(6),
        faker.helpers.arrayElement(knownFirstNames),
        faker.internet.email()
      ]);

      expect(detector.detectColumns(data).get(0)).toBe(COLUMN_TYPE.PLAYER_DATA);
    });

    it("detects filter columns correctly", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        faker.helpers.arrayElement(["Standard", "Modern", "Legacy"])
      ]);

      expect(detector.detectColumns(data).get(0)).toBe(COLUMN_TYPE.FILTER);
    });

    it("detects empty columns as IGNORED_DATA", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        faker.helpers.arrayElement(["", " ", null as any, undefined as any])
      ]);

      expect(detector.detectColumns(data).get(0)).toBe(COLUMN_TYPE.IGNORED_DATA);
    });

    it("resolves conflicts by ensuring unique types first", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        faker.internet.url(),
        faker.helpers.arrayElement(knownFirstNames),
        faker.helpers.arrayElement(knownLastNames),
        "1 Lightning Bolt\n1 Forest\n1 Island",
        faker.internet.email()
      ]);

      const detected = detector.detectColumns(data);
      expect(detected.get(0)).toBe(COLUMN_TYPE.DECKLIST_URL);
      expect(detected.get(1)).toBe(COLUMN_TYPE.FIRST_NAME);
      expect(detected.get(2)).toBe(COLUMN_TYPE.LAST_NAME);
      expect(detected.get(3)).toBe(COLUMN_TYPE.DECKLIST_TXT);
      expect(detected.get(4)).toBe(COLUMN_TYPE.UNIQUE_ID);
    });

    it("detects decklists containing only basic lands", () => {
      const data: SpreadsheetRawRow[] = Array.from({ length: 16 }, () => [
        "Plains\nIsland\nSwamp",
        "Mountain\nForest\nWastes"
      ]);

      expect(detector.detectColumns(data).get(0)).toBe(COLUMN_TYPE.DECKLIST_TXT);
    });

    it("detects a column of usernames as PLAYER_DATA", () => {
      const data: SpreadsheetRawRow[] = [
        [ '@Bert.Schinner', 'izzet prowess' ],
        [ '@Margaret_Kutch', 'esper control' ],
        [ '@Brent11', 'mono-red' ],
        [ '@Dayton_Goldner67', 'izzet prowess' ],
        [ '@Leola.Schuppe', 'mono-red' ],
        [ '@Earlene.Gleason67', 'mono-red' ],
        [ '@Brenden95', 'izzet prowess' ],
        [ '@Molly_Wiegand92', 'mono-red' ],
        [ '@Brennon48', 'mono-red' ],
        [ '@Ethan_Bode54', 'esper control' ],
        [ '@Jensen.Flatley25', 'izzet prowess' ],
        [ '@Coralie.Mohr99', 'izzet prowess' ],
        [ '@Lesley_Stroman42', 'esper control' ],
        [ '@Abigayle.Reichert', 'mono-red' ],
        [ '@Verlie_OKeefe', 'mono-red' ],
        [ '@Erika.Nicolas', 'esper control' ]
      ]
      expect(detector.detectColumns(data).get(0)).toBe(COLUMN_TYPE.PLAYER_DATA);
    });
  });
});
