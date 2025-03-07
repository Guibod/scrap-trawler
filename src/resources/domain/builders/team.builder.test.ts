import { describe, it, expect } from "vitest";
import type EventModelBuilder from "~resources/domain/builders/event.builder"
import TeamBuilder from "~resources/domain/builders/team.builder"
import { PlayerStatusDbo } from "~resources/domain/enums/player.status.dbo"

// Mock EventModelBuilder since it's only used as a parent reference
const mockEventModelBuilder = {} as EventModelBuilder;

describe("TeamBuilder", () => {
  it("should build a TeamDbo with default values", () => {
    const team = new TeamBuilder(mockEventModelBuilder).build();

    expect(team.id).toBeDefined();
    expect(team.displayName).toBeDefined();
    expect(team.status).toBe(PlayerStatusDbo.IDENTIFIED);
    expect(team.tableNumber).toBeNull();
    expect(team.players).toEqual([]);
  });

  it("should allow setting individual properties", () => {
    const team = new TeamBuilder(mockEventModelBuilder)
      .withId("team-001")
      .withDisplayName("Champions")
      .withStatus(PlayerStatusDbo.GUEST)
      .withTableNumber(10)
      .withPlayers(["player-1", "player-2"])
      .build();

    expect(team.id).toBe("team-001");
    expect(team.displayName).toBe("Champions");
    expect(team.status).toBe(PlayerStatusDbo.GUEST);
    expect(team.tableNumber).toBe(10);
    expect(team.players).toEqual(["player-1", "player-2"]);
  });

  it("should merge partial data correctly", () => {
    const team = new TeamBuilder(mockEventModelBuilder)
      .partial({ displayName: "Legends", status: PlayerStatusDbo.GUEST })
      .build();

    expect(team.displayName).toBe("Legends");
    expect(team.status).toBe(PlayerStatusDbo.GUEST);
  });

  it("should return to parent builder when calling end()", () => {
    const parent = new TeamBuilder(mockEventModelBuilder).end();
    expect(parent).toBe(mockEventModelBuilder);
  });
});