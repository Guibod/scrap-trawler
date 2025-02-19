export interface EventWriteDbo {
  id?: string;
  name: string;
  date: Date;
  organizer: string;
  raw_data?: {
    [key: string]: any
  }
}
