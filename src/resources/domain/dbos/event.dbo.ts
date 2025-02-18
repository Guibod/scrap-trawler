interface EventStatus {
  scrape: "IN_PROGRESS" | "COMPLETED";
  pair: "NOT_STARTED" | "UNRESOLVED" | "PARTIAL" | "COMPLETE";
  fetch: "NOT_STARTED" | "SUCCESS" | "PARTIAL" | "FAILED";
  global: "NOT_STARTED" | "COMPLETED" | "PARTIAL";
}

export interface EventDbo {
  id: string;
  name: string;
  date: Date;
  organizer: string;
  status: EventStatus
}