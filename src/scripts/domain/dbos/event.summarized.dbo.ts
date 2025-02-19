import type { EventStatusDbo } from './status.dbo';

export interface EventSummarizedDbo {
  id: string;
  name: string;
  date: Date;
  organizer: string;
  status: EventStatusDbo;
}
