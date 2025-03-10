import { describe, it, expect } from "vitest";
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo";
import { SpreadsheetColumnScorer } from "~/resources/domain/parsers/column.scorer"

const knownFirstNames = new Set(["alice", "john", "pierre", "thomas", "emma", "michael", "sophia"]);
const knownLastNames = new Set(["smith", "dupont", "van den berg", "johnson", "brown", "williams", "davis"]);

describe("SpreadsheetColumnScorer", () => {
  it("calculates email score correctly", () => {
    const emails = ["john.doe@example.com", "alice@gmail.com", "test123@yahoo.com"];
    expect(SpreadsheetColumnScorer.getEmailScore(emails)).toBe(1.0);

    const mixed = ["john.doe@example.com", "notAnEmail", "test123@yahoo.com"];
    expect(SpreadsheetColumnScorer.getEmailScore(mixed)).toBeCloseTo(2 / 3, 2);
  });

  it("calculates URL score correctly", () => {
    const urls = ["https://moxfield.com/decks/abc123", "http://archidekt.com/decks/xyz"];
    expect(SpreadsheetColumnScorer.getUrlScore(urls)).toBe(1.0);

    const mixed = ["https://moxfield.com/decks/abc123", "notAUrl"];
    expect(SpreadsheetColumnScorer.getUrlScore(mixed)).toBeCloseTo(0.625, 2);
  });

  it("calculates decklist score correctly", () => {
    const decklist = ["1 Lightning Bolt", "4 Brainstorm", "1 Tarmogoyf", "Mountain\nIsland\nSwamp"];
    expect(SpreadsheetColumnScorer.getDecklistScore(decklist)).toBe(1.0);

    const noDecklist = ["Hello", "World", "Just some random text"];
    expect(SpreadsheetColumnScorer.getDecklistScore(noDecklist)).toBe(0.0);
  });

  describe("SpreadsheetColumnScorer - Name Scores", () => {
    it("detects first names correctly (case insensitive)", () => {
      const firstNames = ["Alice", "JOHN", "pIeRrE", "thomas", "EMMA"];
      expect(SpreadsheetColumnScorer.getFirstNameScore(firstNames, knownFirstNames)).toBe(1.0);
    });

    it("detects last names correctly (case insensitive)", () => {
      const lastNames = ["sMiTh", "DUPONT", "Van Den Berg", "johnson", "BROWN"];
      expect(SpreadsheetColumnScorer.getLastNameScore(lastNames, knownLastNames)).toBe(1.0);
    });

    it("handles mixed first and last names (favoring first names)", () => {
      const mixedNames = ["Alice", "Emma", "Smith", "Davis", "John"];
      expect(SpreadsheetColumnScorer.getFirstNameScore(mixedNames, knownFirstNames)).toBe(0.6);
    });

    it("handles mixed first and last names (favoring last names)", () => {
      const mixedNames = ["Williams", "Brown", "Michael", "Davis", "Johnson"];
      expect(SpreadsheetColumnScorer.getLastNameScore(mixedNames, knownLastNames)).toBe(0.8);
    });

    it("handles unknown names gracefully", () => {
      const unknownNames = ["Zyphir", "Korvath", "Xenon", "Blarg"];
      expect(SpreadsheetColumnScorer.getFirstNameScore(unknownNames, knownFirstNames)).toBe(0.0);
    });

    it("handles empty values correctly", () => {
      const emptyValues = ["", " ", null as any, undefined as any];
      expect(SpreadsheetColumnScorer.getFirstNameScore(emptyValues, knownFirstNames)).toBe(0.0);
    });
  });

  describe("SpreadsheetColumnScorer - Archetype Score", () => {
    it("returns 0.0 if column has fewer than 8 entries", () => {
      const smallSet = ["Control", "Aggro", "Midrange", "Burn", "Storm"];
      expect(SpreadsheetColumnScorer.getArchetypeScore(smallSet)).toBe(0.0);
    });

    it("detects an archetype column with known archetype names", () => {
      const archetypeNames = [
        "Mono-Red", "Control", "Aggro", "Combo", "Dimir Midrange", "Storm", "Izzet Prowess", "Dimir Midrange"
      ];
      expect(SpreadsheetColumnScorer.getArchetypeScore(archetypeNames)).toBe(1.0);
    });

    it("detects a commander-based archetype column", () => {
      const edhArchetypes = [
        "b", "a", "a", "Aragorn Roi du Gondor", "c", "Gyome", "Prosper", "Sauron"
      ];
      expect(SpreadsheetColumnScorer.getArchetypeScore(edhArchetypes)).toBe(1.0);
    });

    it("detects an archetype column with high variance", () => {
      const highVariety = [
        "Boros", "Jund", "Izzet", "Dimir", "Sultai", "Mardu", "Grixis", "Esper"
      ];
      expect(SpreadsheetColumnScorer.getArchetypeScore(highVariety)).toBe(1);
    });

    it("returns a low score for columns with low variance", () => {
      const lowVariance = [
        "a", "b", "c", "d", "e", "f", "g", "h", "a", "b", "c"
      ];
      expect(SpreadsheetColumnScorer.getArchetypeScore(lowVariance)).toBe(0.5);
    });

    it("returns a very low score for non-archetype columns", () => {
      const nonArchetype = [
        "Yes", "No", "Yes", "No", "Maybe", "Yes", "No", "Yes"
      ];
      expect(SpreadsheetColumnScorer.getArchetypeScore(nonArchetype)).toBe(0.1);
    });
  });

  describe("SpreadsheetColumnScorer - Filter Score", () => {
    it("returns 0.0 for columns with fewer than 8 values", () => {
      const smallSet = ["A", "A", "B", "B", "C"];
      expect(SpreadsheetColumnScorer.getFilterScore(smallSet)).toBe(0.0);
    });

    it("returns 0.0 for columns with only one unique value", () => {
      const repeated = Array(20).fill("Yes");
      expect(SpreadsheetColumnScorer.getFilterScore(repeated)).toBe(0.0);
    });

    it("detects a proper filter column with exactly 2 unique values and 16+ entries", () => {
      const binaryFilter = Array(10).fill("Yes").concat(Array(10).fill("No"));
      expect(SpreadsheetColumnScorer.getFilterScore(binaryFilter)).toBe(1.0);
    });

    it("detects a filter column with 3-4 unique values and 16+ entries", () => {
      const multiFilter = ["A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A"];
      expect(SpreadsheetColumnScorer.getFilterScore(multiFilter)).toBe(1.0);
    });

    it("lowers score if the column has fewer than 16 entries", () => {
      const smallFilter = ["Yes", "No", "Yes", "No", "Yes", "No", "No", "No", "Maybe"];
      expect(SpreadsheetColumnScorer.getFilterScore(smallFilter)).toBe(0.7);
    });

    it("returns 0.1 for columns with more than 4 unique values", () => {
      const tooManyUnique = ["A", "B", "C", "D", "E", "F", "G", "H"];
      expect(SpreadsheetColumnScorer.getFilterScore(tooManyUnique)).toBe(0.1);
    });
  });


  it("correctly calculates scores for a mixed column", () => {
    const mixedColumn = ["john.doe@example.com", "Alice", "12345678", "Mono Red", "https://moxfield.com"];
    const scores = SpreadsheetColumnScorer.calculateScores(mixedColumn, knownFirstNames, knownLastNames);

    expect(scores.get(COLUMN_TYPE.UNIQUE_ID)).toBe(0.2);
    expect(scores.get(COLUMN_TYPE.FIRST_NAME)).toBe(0.2);
  });

  describe("SpreadsheetColumnScorer - User Data Scores", () => {
    it("detects fully numeric data as user data", () => {
      const numericData = ["123", "456", "789", "101112"];
      expect(SpreadsheetColumnScorer.getPlayerDataScore(numericData)).toBe(1.0);
    });

    it("detects mostly unique textual values as user data", () => {
      const uniqueUsernames = ["PlayerOne", "Xx_Gamer_xX", "MagicFan99", "ProTourneyPlayer"];
      expect(SpreadsheetColumnScorer.getPlayerDataScore(uniqueUsernames)).toBe(0.9);
    });

    it("detects social media handles as user data", () => {
      const socialHandles = ["@mtgplayer", "@coolguy", "@judge123"];
      expect(SpreadsheetColumnScorer.getPlayerDataScore(socialHandles)).toBe(1.0);
    });

    it("detects mixed user data correctly", () => {
      const mixedUserData = ["@player1", "DCI12345", "12345", "MagicFan88"];
      expect(SpreadsheetColumnScorer.getPlayerDataScore(mixedUserData)).toBe(0.9);
    });

    it("handles empty values correctly", () => {
      const emptyValues = ["", " ", null as any, undefined as any];
      expect(SpreadsheetColumnScorer.getPlayerDataScore(emptyValues)).toBe(0.0);
    });
  });

  describe("SpreadsheetColumnScorer - Ignored Column Detection", () => {
    it("detects a fully empty column as ignored", () => {
      const emptyColumn = ["", " ", null as any, undefined as any];
      expect(SpreadsheetColumnScorer.getIgnoredScore(emptyColumn)).toBe(1.0);
    });

    it("detects a column with a single repeated value as ignored", () => {
      const repeatedValue = ["N/A", "N/A", "N/A", "N/A"];
      expect(SpreadsheetColumnScorer.getIgnoredScore(repeatedValue)).toBe(1.0);
    });

    it("detects a column with minor variations as non-ignored", () => {
      const mixedValues = ["N/A", "N/A", "Unknown", "N/A"];
      expect(SpreadsheetColumnScorer.getIgnoredScore(mixedValues)).toBe(0.1);
    });

    it("detects a column with diverse values as relevant", () => {
      const diverseValues = ["Red", "Blue", "Green", "Yellow"];
      expect(SpreadsheetColumnScorer.getIgnoredScore(diverseValues)).toBe(0.1);
    });
  });
});
