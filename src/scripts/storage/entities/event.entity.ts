import type { WotcExtractedEvent } from "~scripts/eventlink/event-extractor"

export default class EventEntity {
  id!: string;
  name!: string;
  date!: Date;
  organizer!: string;
  raw_data: {
    wotc?: WotcExtractedEvent,
    [key: string]: any
  }
  last_updated?: Date;
}