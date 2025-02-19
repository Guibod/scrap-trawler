export default class EventEntity {
  id!: string;
  name!: string;
  date!: Date;
  organizer!: string;
  raw_data: {
    [key: string]: object
  }
  last_updated?: Date;
}