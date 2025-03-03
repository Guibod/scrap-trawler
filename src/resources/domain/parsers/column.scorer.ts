import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo";

export class SpreadsheetColumnScorer {
  private static basicLands = new Set(["plains", "island", "swamp", "mountain", "forest", "wastes"]);

  static calculateScores(values: string[], knownFirstNames: Set<string>, knownLastNames: Set<string>): Map<COLUMN_TYPE, number> {
    const scores = new Map<COLUMN_TYPE, number>();

    if (values.length === 0) {
      scores.set(COLUMN_TYPE.IGNORED_DATA, 1.0);
      return scores;
    }

    scores.set(COLUMN_TYPE.UNIQUE_ID, this.getEmailScore(values));
    scores.set(COLUMN_TYPE.DECKLIST_URL, this.getUrlScore(values));
    scores.set(COLUMN_TYPE.DECKLIST_TXT, this.getDecklistScore(values));
    scores.set(COLUMN_TYPE.FIRST_NAME, this.getFirstNameScore(values, knownFirstNames));
    scores.set(COLUMN_TYPE.LAST_NAME, this.getLastNameScore(values, knownLastNames));
    scores.set(COLUMN_TYPE.ARCHETYPE, this.getArchetypeScore(values));
    scores.set(COLUMN_TYPE.FILTER, this.getFilterScore(values));
    scores.set(COLUMN_TYPE.IGNORED_DATA, this.getIgnoredScore(values));
    scores.set(COLUMN_TYPE.PLAYER_DATA, this.getPlayerDataScore(values));

    return scores;
  }

  static getEmailScore(values: string[]): number {
    const count = values.filter(val => /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(val)).length;
    return count / values.length;
  }

  static getUrlScore(values: string[]): number {
    const count = values.filter(val => /^https?:\/\/[\w.-]+\.[a-z]{2,}.*$/.test(val)).length;
    return count / values.length;
  }

  static getDecklistScore(values: string[]): number {
    const joinedText = values.join("\n").toLowerCase();
    return joinedText.includes("\n") && [...this.basicLands].some(land => joinedText.includes(land)) ? 1.0 : 0.0;
  }

  static getFirstNameScore(values: string[], knownFirstNames: Set<string>): number {
    const count = values.filter(val => knownFirstNames.has(String(val).trim().toLowerCase())).length;
    return count / values.length;
  }

  static getLastNameScore(values: string[], knownLastNames: Set<string>): number {
    const count = values.filter(val => knownLastNames.has(String(val).trim().toLowerCase())).length;
    return count / values.length;
  }

  static getFilterScore(values: string[]): number {
    const nonEmptyValues = values.filter(val => String(val).trim() !== "");
    const totalEntries = nonEmptyValues.length;

    if (totalEntries < 8) return 0.0; // Too few entries to determine filter reliability

    const uniqueValues = new Set(nonEmptyValues);
    const uniqueCount = uniqueValues.size;

    if (uniqueCount === 1) return 0.0; // Only one repeated value → Ignore
    if (uniqueCount > 4) return 0.1; // More than 4 unique values → Not a filter

    // More than 16 rows makes the filter more trustworthy
    return totalEntries >= 16 ? 1.0 : 0.7;
  }

  static getArchetypeScore(values: string[]): number {
    const nonEmptyValues = values
      .filter(val => String(val).trim() !== "")
      .map(val => String(val).toLowerCase()); // ✅ Normalize case

    const totalEntries = nonEmptyValues.length;
    if (totalEntries < 8) return 0.0; // Not enough data

    const uniqueValues = new Set(nonEmptyValues);
    const uniqueRatio = uniqueValues.size / totalEntries;

    // ✅ Known Archetype Keywords (all lowercase for comparison)
    const archetypeKeywords = new Set([
      "aggro", "midrange", "control", "combo", "tempo", "burn", "prowess", "mill", "storm",
      "affinity", "mono-red", "dimir", "esper", "temur", "mardu", "grixis",
      "atraxa", "sisay", "kinnan", "aragorn", "rograkh"
    ]);

    // ✅ Check if ANY archetype keyword is present
    const containsArchetypeKeywords = nonEmptyValues.some(value => {
      const lowerValue = value.toLowerCase();
      return [...archetypeKeywords].some(keyword => lowerValue.includes(keyword));
    });

    // **Scoring Mechanism**
    if (containsArchetypeKeywords) {
      return 1.0; // ✅ Strong indicator
    }
    if (uniqueRatio > 0.75) {
      return 0.8; // ✅ High variance = Likely archetype
    }
    if (uniqueRatio > 0.5) {
      return 0.5; // 🤔 Somewhat likely archetype
    }

    return 0.1; // ❌ Not an archetype
  }

  static getPlayerDataScore(values: string[]): number {
    const nonEmptyValues = values
      .filter(val => val !== null && val !== undefined) // Remove null/undefined
      .map(val => String(val).trim()) // Convert to string & trim
      .filter(val => val !== ""); // Remove empty strings

    if (nonEmptyValues.length === 0) return 0.0; // Edge case: Empty column

    // 1️⃣ Check if fully numeric
    if (nonEmptyValues.every(val => /^\d+$/.test(val))) {
      return 1.0; // Strong indicator of user data (e.g., age, score, ID)
    }

    // 2️⃣ Check if social media handles
    if (nonEmptyValues.every(val => /^@\w+$/.test(val))) {
      return 1.0; // Strong indicator of social media handles
    }

    // 3️⃣ Check if mostly unique textual values
    const uniqueValues = new Set(nonEmptyValues);
    const uniqueRatio = uniqueValues.size / nonEmptyValues.length;
    if (uniqueRatio > 0.9) {
      return 0.9; // Likely user-specific data (usernames, identifiers)
    }

    return 0.1; // Defaults to filter column
  }

  static getIgnoredScore(values: string[]): number {
    const nonEmptyValues = values
      .filter(val => val !== null && val !== undefined) // Remove null/undefined
      .map(val => String(val).trim()) // Convert to string & trim
      .filter(val => val !== ""); // Remove empty strings

    if (nonEmptyValues.length === 0) return 1.0; // Fully empty column

    const uniqueValues = new Set(nonEmptyValues);
    if (uniqueValues.size === 1) return 1.0; // Column has only one unique value

    return 0.1; // Otherwise, assume the column has some relevance
  }
}
