import { type WotcExtractedEvent } from "~scripts/eventlink/event-extractor";

/**
 * Data structure for storing extracted events in local storage.
 */
export interface EventDbo {
  eventId: string;
  name: string;
  date: Date;
  organizer: string;
  rawWotcData: WotcExtractedEvent;
}

/**
 * Minimal format for listing events.
 */
export interface EventSummary {
  id: string;
  name: string;
  date: Date;
}

export class EventStorage {
  /**
   * Saves an extracted event into local storage.
   * Updates the stored data if the event already exists.
   */
  static async save(event: EventDbo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.get(event.eventId, (existingData) => {
        const updatedData = {
          ...existingData[event.eventId], // Preserve existing data if available
          rawWotcData: event.rawWotcData, // Store the new extracted data
        };

        chrome.storage.local.set({ [event.eventId]: updatedData }, () => {
          if (chrome.runtime.lastError) {
            console.error("Failed to store event data:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log(`Event ${event.eventId} successfully saved.`);
            resolve();
          }
        });
      });
    });
  }

  /**
   * Retrieves an extracted event from local storage.
   */
  static async get(eventId: string): Promise<EventDbo | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(eventId, (data) => {
        resolve(data[eventId] ? data[eventId] : null);
      });
    });
  }

  /**
   * Lists all stored events in a minimal format (id & name).
   */
  static async listEvents(): Promise<EventSummary[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (data) => {
        const events: EventSummary[] = Object.values(data).sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        ).map((event: any) => ({
          id: event.eventId,
          name: event.name,
          organizer: event.organizer,
          date: event.date
        }));
        resolve(events);
      });
    });
  }
}

export class EventMapper {
  /**
   * Converts an ExtractedEvent (domain layer) to an EventDbo (DBO layer).
   */
  static toDbo(event: WotcExtractedEvent): EventDbo {
    return {
      date: new Date(event.event.actualStartTime ?? event.event.scheduledStartTime),
      organizer: event.organization.name,
      name: event.event.title,
      eventId: event.event.id.toString(),
      rawWotcData: event
    };
  }

  /**
   * Converts an EventDbo (DBO layer) back to an ExtractedEvent (domain layer).
   */
  static fromDbo(eventDbo: EventDbo): WotcExtractedEvent {
    return eventDbo.rawWotcData;
  }
}