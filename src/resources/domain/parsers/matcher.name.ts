import { removeDiacritics } from "~resources/utils/text";
import type { SpreadsheetRow } from "~resources/domain/dbos/spreadsheet.dbo";
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo";
import { closest as levenshteinClosest, distance as levenshteinDistance } from "fastest-levenshtein";
import { AutoMatcher } from "~resources/domain/parsers/matcher";
import type { MappingDbo, PairingMode } from "~resources/domain/dbos/mapping.dbo"

export class NameMatcher extends AutoMatcher {
  static readonly LENGTH_THRESHOLD = 3;

  constructor(eventPlayers: PlayerDbo[], spreadsheetPlayers: SpreadsheetRow[], pairs: MappingDbo | null) {
    super(eventPlayers, spreadsheetPlayers, pairs);
  }

  match(): MappingDbo {
    const updatedPairings: MappingDbo = { ...this.pairs };
    const unmatchedSpreadsheetPlayers = new Set(this.spreadsheetPlayers.map(p => p.id));

    for (const eventPlayer of this.eventPlayers) {
      if (updatedPairings[eventPlayer.id]) continue; // Keep existing pairing

      const eventFirstName = removeDiacritics(eventPlayer.firstName || "").toLowerCase();
      const eventLastName = removeDiacritics(eventPlayer.lastName || "").toLowerCase();

      const tryMatch = (mode: PairingMode, matcher: (p: SpreadsheetRow) => boolean) => {
        for (const spreadsheetId of unmatchedSpreadsheetPlayers) {
          const spreadsheetPlayer = this.spreadsheetPlayers.find(p => p.id === spreadsheetId);
          if (spreadsheetPlayer && matcher(spreadsheetPlayer)) {
            updatedPairings[eventPlayer.id] = { rowId: spreadsheetPlayer.id, mode };
            unmatchedSpreadsheetPlayers.delete(spreadsheetPlayer.id);
            return true;
          }
        }
        return false;
      };

      // **1. Strict match (Un-diacritic)**
      if (tryMatch("name-strict", p => NameMatcher.undiacriticMatch(p, eventFirstName, eventLastName))) continue;

      // **2. Name swap match**
      if (tryMatch("name-swap", p => NameMatcher.undiacriticSwapMatch(p, eventFirstName, eventLastName))) continue;

      // **3. First name initial + last name full**
      if (tryMatch("name-first-initial", p => NameMatcher.initialFirstMatch(p, eventFirstName, eventLastName))) continue;

      // **4. Full first name + last name initial**
      if (tryMatch("name-last-initial", p => NameMatcher.initialLastMatch(p, eventFirstName, eventLastName))) continue;

      // **5. Levenshtein Distance (Fuzzy Matching)**
      NameMatcher.levenshteinMatch(eventPlayer, this.spreadsheetPlayers, unmatchedSpreadsheetPlayers, updatedPairings);
    }

    return updatedPairings
  }

  /** Matches exact name ignoring diacritics */
  private static undiacriticMatch(p: SpreadsheetRow, firstName: string, lastName: string): boolean {
    return removeDiacritics(p.firstName).toLowerCase() === firstName &&
      removeDiacritics(p.lastName).toLowerCase() === lastName;
  }

  /** Matches swapped first and last names ignoring diacritics */
  private static undiacriticSwapMatch(p: SpreadsheetRow, firstName: string, lastName: string): boolean {
    return removeDiacritics(p.lastName).toLowerCase() === firstName &&
      removeDiacritics(p.firstName).toLowerCase() === lastName;
  }

  /** Matches first-name initial + last name full */
  private static initialFirstMatch(p: SpreadsheetRow, firstName: string, lastName: string): boolean {
    return firstName.charAt(0) === removeDiacritics(p.firstName).charAt(0).toLowerCase() &&
      lastName === removeDiacritics(p.lastName).toLowerCase();
  }

    /** Matches first-name full + last name initial */
  private static initialLastMatch(p: SpreadsheetRow, firstName: string, lastName: string): boolean {
    return firstName === removeDiacritics(p.firstName).toLowerCase() &&
      lastName.charAt(0) === removeDiacritics(p.lastName).charAt(0).toLowerCase();
  }

  /** Matches closest name using Levenshtein distance */
  private static levenshteinMatch(
    eventPlayer: PlayerDbo,
    spreadsheetPlayers: SpreadsheetRow[],
    unmatchedSpreadsheetPlayers: Set<string>,
    updatedPairings: MappingDbo
  ): void {
    const eventFullName = removeDiacritics(`${eventPlayer.firstName} ${eventPlayer.lastName}`).toLowerCase();
    const spreadsheetNames = spreadsheetPlayers.map(p =>
      removeDiacritics(`${p.firstName} ${p.lastName}`).toLowerCase()
    );

    const closest = levenshteinClosest(eventFullName, spreadsheetNames);
    const distance = levenshteinDistance(eventFullName, closest);

    if (distance <= NameMatcher.LENGTH_THRESHOLD) {
      const matchedSpreadsheet = spreadsheetPlayers.find(p =>
        removeDiacritics(`${p.firstName} ${p.lastName}`).toLowerCase() === closest
      );

      if (matchedSpreadsheet && unmatchedSpreadsheetPlayers.has(matchedSpreadsheet.id)) {
        updatedPairings[eventPlayer.id] = { rowId: matchedSpreadsheet.id, mode: "name-levenshtein" };
        unmatchedSpreadsheetPlayers.delete(matchedSpreadsheet.id);
      }
    }
  }
}
