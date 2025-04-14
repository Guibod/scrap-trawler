import { describe, it, expect } from "vitest";
import type EventModelBuilder from "~/resources/domain/builders/event.builder"
import EventOrganizerBuilder from "~/resources/domain/builders/organizer.builder"

// Mock EventModelBuilder since it's only used as a parent reference
const mockEventModelBuilder = {} as EventModelBuilder;

describe("EventOrganizerBuilder", () => {
  it("should build an EventOrganizerDbo with default values", () => {
    const organizer = new EventOrganizerBuilder(mockEventModelBuilder).build();

    expect(organizer.id).toBeDefined();
    expect(organizer.name).toBeDefined();
    expect(organizer.phoneNumber).toBeDefined();
    expect(organizer.emailAddress).toBeDefined();
    expect(organizer.location).toBeDefined();
    expect(organizer.isPremium).toBeDefined();
  });

  it("should allow setting individual properties", () => {
    const organizer = new EventOrganizerBuilder(mockEventModelBuilder)
      .withId("custom-id")
      .withName("Custom Name")
      .withPhoneNumber("+123456789")
      .withEmailAddress("custom@email.com")
      .withLocation(40.7128, -74.0060, "New York, NY")
      .withIsPremium(true)
      .build();

    expect(organizer.id).toBe("custom-id");
    expect(organizer.name).toBe("Custom Name");
    expect(organizer.phoneNumber).toBe("+123456789");
    expect(organizer.emailAddress).toBe("custom@email.com");
    expect(organizer.location).toEqual({
      type: "Point",
      coordinates: [-74.0060, 40.7128],
      properties: { address: "New York, NY" }
    });
    expect(organizer.isPremium).toBe(true);
  });

  it("should merge partial data correctly", () => {
    const organizer = new EventOrganizerBuilder(mockEventModelBuilder)
      .partial({ name: "Partial Name", isPremium: false })
      .build();

    expect(organizer.name).toBe("Partial Name");
    expect(organizer.isPremium).toBe(false);
  });

  it("should return to parent builder when calling end()", () => {
    const parent = new EventOrganizerBuilder(mockEventModelBuilder).end();
    expect(parent).toBe(mockEventModelBuilder);
  });
});
