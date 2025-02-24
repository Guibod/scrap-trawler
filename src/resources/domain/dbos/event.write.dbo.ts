export interface EventWriteDbo {
  id?: string;
  name: string;
  date: Date | string;
  organizer: string;
  raw_data?: {
    [key: string]: any
  }
}
