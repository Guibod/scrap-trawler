import { describe, it, expect } from "vitest";
import PlayerBuilder from "~resources/domain/builders/player.builder"
import type EventModelBuilder from "~resources/domain/builders/event.builder"
import { PlayerStatusDbo } from "~resources/domain/enums/player.status.dbo"

// Mock EventModelBuilder since it's only used as a parent reference
const mockEventModelBuilder = {} as EventModelBuilder;

describe("PlayerBuilder", () => {
  it("should build a PlayerDbo with default values", () => {
    const player = new PlayerBuilder(mockEventModelBuilder).build();

    expect(player.id).toBeDefined();
    expect(player.avatar).toBeDefined();
    expect(player.isAnonymized).toBeDefined();
    expect(player.archetype).toBeDefined();
    expect(player.tournamentId).toBeDefined();
    expect(player.teamId).toBeDefined();
    expect(player.tableNumber).toBeNull(); // Most of the time it should be null
    expect(player.status).toBe(PlayerStatusDbo.IDENTIFIED);
    expect(player.overrides).toBeDefined();
  });

  it("should allow setting individual properties", () => {
    const player = new PlayerBuilder(mockEventModelBuilder)
      .withId("player-123")
      .withDisplayName("John Doe")
      .withFirstName("John")
      .withLastName("Doe")
      .withTableNumber(5)
      .withStatus(PlayerStatusDbo.GUEST)
      .build();

    expect(player.id).toBe("player-123");
    expect(player.displayName).toBe("John Doe");
    expect(player.firstName).toBe("John");
    expect(player.lastName).toBe("Doe");
    expect(player.tableNumber).toBe(5);
    expect(player.status).toBe(PlayerStatusDbo.GUEST);
  });

  it("should correctly handle anonymized players", () => {
    const player = new PlayerBuilder(mockEventModelBuilder)
      .withIsAnonymized(true)
      .build();

    expect(player.isAnonymized).toBe(true);
    expect(player.displayName).toBeNull();
    expect(player.firstName).toBeNull();
    expect(player.lastName).toBeNull();
    expect(player.overrides).toBeDefined();
  });

  it("should correctly handle guest players", () => {
    const player = new PlayerBuilder(mockEventModelBuilder)
      .withGuest()
      .build();

    expect(player.status).toBe(PlayerStatusDbo.GUEST);
    expect(player.displayName).toBeNull();
    expect(player.firstName).toBeNull();
    expect(player.lastName).toBeNull();
  });

  it("should merge partial data correctly", () => {
    const player = new PlayerBuilder(mockEventModelBuilder)
      .partial({ displayName: "Jane Doe", isAnonymized: false })
      .build();

    expect(player.displayName).toBe("Jane Doe");
    expect(player.isAnonymized).toBe(false);
  });

  it("should return to parent builder when calling end()", () => {
    const parent = new PlayerBuilder(mockEventModelBuilder).end();
    expect(parent).toBe(mockEventModelBuilder);
  });
});