import type { EventStatusDbo } from "~resources/domain/dbos/status.dbo"

export interface EventModel {
  id: string;
  name: string;
  date: Date;
  organizer: string;
  status: EventStatusDbo,
  raw_data: {
    [key: string]: any
  }
}