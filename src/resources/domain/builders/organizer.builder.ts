import { faker } from "@faker-js/faker";
import type { GeoJSON, Point } from "geojson"
import type { EventOrganizerDbo } from "~/resources/domain/dbos/event.organizer.dbo"
import type EventModelBuilder from "~/resources/domain/builders/event.builder"

export default class EventOrganizerBuilder {
  private organizer: Partial<EventOrganizerDbo> = {};
  private parentBuilder: EventModelBuilder;

  constructor(parent: EventModelBuilder) {
    this.parentBuilder = parent;
  }

  partial(data: Partial<EventOrganizerDbo>) {
    Object.assign(this.organizer, data);
    return this;
  }

  withId(id: string) {
    this.organizer.id = id;
    return this;
  }

  withName(name: string) {
    this.organizer.name = name;
    return this;
  }

  withPhoneNumber(phoneNumber: string) {
    this.organizer.phoneNumber = phoneNumber;
    return this;
  }

  withEmailAddress(email: string) {
    this.organizer.emailAddress = email;
    return this;
  }

  withLocation(latitude: number, longitude: number, address: string) {
    this.organizer.location = {
      type: "Point",
      coordinates: [longitude, latitude],
      properties: { address },
    } as GeoJSON<Point, { address: string }>;
    return this;
  }

  withIsPremium(isPremium: boolean) {
    this.organizer.isPremium = isPremium;
    return this;
  }

  end() {
    return this.parentBuilder;
  }

  private fillMissingFields() {
    this.organizer.id ??= faker.string.uuid();
    this.organizer.name ??= faker.company.name();
    this.organizer.phoneNumber ??= faker.phone.number();
    this.organizer.emailAddress ??= faker.internet.email();
    this.organizer.location ??= {
      type: "Point",
      coordinates: [faker.location.longitude(), faker.location.latitude()],
      properties: { address: faker.location.streetAddress() },
    } as GeoJSON<Point, { address: string }>;
    this.organizer.isPremium ??= faker.datatype.boolean();
  }

  build(): EventOrganizerDbo {
    this.fillMissingFields();
    return this.organizer as EventOrganizerDbo;
  }
}