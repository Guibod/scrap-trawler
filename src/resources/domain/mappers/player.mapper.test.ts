import { beforeEach, describe, expect, it } from "vitest"
import type { EventModel } from "~/resources/domain/models/event.model"
import EventBuilder from "~/resources/domain/builders/event.builder"
import { PlayerMapper } from "~/resources/domain/mappers/player.mapper"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"

describe("EventModel null safety", () => {
  let event: EventModel
  let generatedRow: SpreadsheetRow

  beforeEach(() => {
    event = EventBuilder.anEvent
      .withPlayers(10)
      .withDecks(10)
      .player()
      .partial({ id: "abc", firstName: "Adam", lastName: "Savage" })
      .withOverrides({ firstName: "Alan", displayName: null, lastName: null, archetype: null, decklistUrl: null, decklistTxt: null })
      .end()
      .deck()
      .withRowId("abc-row")
      .withArchetype("Control")
      .end()
      .withWotcIdToRowIdMapping("abc", "abc-row")
      .build()
    generatedRow = event.spreadsheet.data.find(row => row.id === event.mapping["abc"].rowId);
  })

  it("handles spreadsheet without overrides", () => {
    event.players.abc.overrides = null;

    const player = PlayerMapper.toProfile(event, "abc");
    expect(player.firstName).toEqual(generatedRow.firstName);
    expect(player.lastName).toEqual(generatedRow.lastName);
    expect(player.deck.archetype).toEqual("Control");
  });

  it("handles spreadsheet with null data", () => {
    event.spreadsheet.data = null;

    const player = PlayerMapper.toProfile(event, "abc");
    expect(player.firstName).toEqual("Alan");
    expect(player.lastName).toEqual("Savage");
    expect(player.deck.archetype).toEqual("Control");
  });

  it("handles spreadsheet with null mapping", () => {
    event.mapping = null;

    const player = PlayerMapper.toProfile(event, "abc");
    expect(player.firstName).toEqual("Alan");
    expect(player.lastName).toEqual("Savage");
    expect(player.deck).toBeNull();
  });

  it("handles spreadsheet with empty mapping", () => {
    event.mapping = {};

    const player = PlayerMapper.toProfile(event, "abc");
    expect(player.firstName).toEqual("Alan");
    expect(player.lastName).toEqual("Savage");
    expect(player.deck).toBeNull();
  });

  it("handles complete record", () => {
    const player = PlayerMapper.toProfile(event, "abc");
    expect(player.firstName).toEqual("Alan");
    expect(player.lastName).toEqual(generatedRow.lastName);
    expect(player.deck.archetype).toBe("Control");
  });

  it("handles matches recovery", () => {
    const player = PlayerMapper.toProfile(event, "abc");

    expect(player.matches).toHaveLength(4)
    expect(player.matches[0].matchId).toBeTypeOf("string")
    expect(player.matches[0].tableNumber).toBeTypeOf("number")
    expect(player.matches[1].matchId).toBeTypeOf("string")
    expect(player.matches[1].tableNumber).toBeTypeOf("number")
    expect(player.matches[2].matchId).toBeTypeOf("string")
    expect(player.matches[2].tableNumber).toBeTypeOf("number")
    expect(player.matches[3].matchId).toBeTypeOf("string")
    expect(player.matches[3].tableNumber).toBeTypeOf("number")
  })

});
