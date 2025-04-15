import EventService from "~/resources/domain/services/event.service"
import SettingsService from "~/resources/domain/services/settings.service"
import CardService from "~/resources/domain/services/card.service"
import { type DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import { DeckSource, DeckStatus } from "~/resources/domain/dbos/deck.dbo"
import DeckFetcherResolver from "~/resources/integrations/decks/resolver"
import AbstractDeckFetcher from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type { DeckDescription } from "~/resources/storage/entities/event.entity"
import { getLogger } from "~/resources/logging/logger"

// Type Definitions
type RequestId = DeckFetchRequest["id"];
type EventId = string;
type FetcherType = typeof AbstractDeckFetcher;
type EventFetchStructure = {
  started: boolean
  processed: number
  count: number
  hasError: boolean  // caught an error
  hasFailure: boolean  // failed to fetch
  tasks: Map<FetcherType, (() => Promise<void>)[]>;
};

export enum EventFetchStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  PARTIAL = "PARTIAL",
  FAILED = "FAILED",
}

export default class DeckFetchService {
  private static instance: DeckFetchService;
  private logger = getLogger("DeckFetchService")
  private requests: Map<RequestId, DeckFetchRequest> = new Map();
  private taskQueues: Map<EventId, EventFetchStructure> = new Map();
  private isProcessing = false;
  private onEventStart?: (eventId: EventId, count: number) => void;
  private onProgress?: (eventId: EventId, processed: number, count: number, hasError: boolean, hasFailure: boolean) => void;
  private onEventComplete?: (eventId: EventId, status: EventFetchStatus, count: number) => void;

  private constructor(
    public readonly eventService: EventService,
    public readonly cardService: CardService,
    public readonly settingsService: SettingsService
  ) {}

  static getInstance(eventService: EventService = EventService.getInstance(), cardService: CardService = CardService.getInstance(), settingsService: SettingsService = SettingsService.getInstance()): DeckFetchService {
    if (!DeckFetchService.instance) {
      DeckFetchService.instance = new DeckFetchService(eventService, cardService, settingsService);
    }
    return DeckFetchService.instance;
  }

  setOnEventStart(callback: typeof DeckFetchService.prototype.onEventStart) {
    this.onEventStart = callback;
  }

  setOnProgress(callback: typeof DeckFetchService.prototype.onProgress) {
    this.onProgress = callback;
  }

  setOnEventComplete(callback: typeof DeckFetchService.prototype.onEventComplete) {
    this.onEventComplete = callback;
  }

  async schedule(requests: DeckFetchRequest[]) {
    for (const request of requests) {
      if (this.requests.has(request.id)) continue;
      this.requests.set(request.id, request);

      // Initialize task queue for eventId if not present
      if (!this.taskQueues.has(request.eventId)) {
        this.taskQueues.set(request.eventId, {
          started: false,
          count: 0,
          processed: 0,
          hasError: false,
          hasFailure: false,
          tasks: new Map()
        });
      }

      const eventQueue = this.taskQueues.get(request.eventId)!;
      eventQueue.count += 1;
      const fetcherType = request.fetcherType;

      // Initialize fetcher queue inside event queue
      if (!eventQueue.tasks.has(fetcherType)) {
        eventQueue.tasks.set(fetcherType, [] as any);
      }

      const fetchQueue = eventQueue.tasks.get(fetcherType)!;

      // Store the function instead of an immediately-executing Promise
      fetchQueue.push(() => this.executeFetch(request));
    }

    this.logger.info(`Scheduled ${requests.length} fetch requests`);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.logger.info(`Processing fetch queue with ${this.requests.size} requests`);
    this.isProcessing = true;

    while (this.taskQueues.size > 0) {
      for (const fetcherQueues of this.taskQueues.values()) {
        for (const fetchTasks of fetcherQueues.tasks.values()) {
          while (fetchTasks.length > 0) {
            const task = fetchTasks.shift(); // Get next task
            if (task) await task(); // Execute only when dequeued
          }
        }
      }
      this.taskQueues.clear(); // Clear completed tasks before checking for new ones
    }

    this.logger.info(`Fetch queue completed`);
    this.isProcessing = false;
  }

  async cancelRequest(requestId: string): Promise<void> {
    this.logger.warn(`Cancelling request ${requestId}`);
    this.requests.delete(requestId);
  }

  async cancelEvent(eventId: string): Promise<void> {
    for (const [key, request] of this.requests.entries()) {
      if (request.eventId === eventId) {
        this.logger.warn(`Cancelling request ${key} for event ${eventId}`);
        this.requests.delete(key);
      }
    }
  }

  async cancelAll(): Promise<void> {
    this.logger.warn(`Cancelling ALL`);
    this.requests.clear();
  }

  private async executeFetch(request: DeckFetchRequest): Promise<void> {
    const taskQueueItem = this.taskQueues.get(request.eventId)
    if (!taskQueueItem.started) {
      taskQueueItem.started = true
      this.onEventStart?.(request.eventId, taskQueueItem.count);
    }

    const emptyDeck: Omit<DeckDescription, 'id'> = {
      boards: null,
      archetype: null,
      colors: [],
      face: null,
      format: null,
      source: DeckSource.UNKNOWN,
      lastUpdated: null,
      legal: false,
      name: null,
      url: null
    }
    const fetcherType = DeckFetcherResolver.resolveFetcherType(request.row);
    const id = await fetcherType.generateId(request.row)
    let response: DeckFetchResponse | null = null
    try {
      await this.eventService.addDeckToEvent(
        request.eventId,
        {
          ...emptyDeck,
          id,
          spreadsheetRowId: request.row.id,
          status: DeckStatus.PENDING,
        },
        null
      );

      const fetcher = new fetcherType(this.settingsService, this.cardService, this.eventService)
      await fetcher.applyThrottle()
      response = await fetcher.run(request)

      let status = DeckStatus.FETCHED
      if (!response.success) {
        taskQueueItem.hasFailure = true
        status = DeckStatus.FAILED
      }

      await this.eventService.addDeckToEvent(
        request.eventId,
        {
          ...response.deck,
          id,
          spreadsheetRowId: request.row.id,
          status,
          errors: response.errorMessage ? [response.errorMessage] : [],
        },
        response.rawData
      );
    } catch (error) {
      taskQueueItem.hasError = true
      await this.eventService.addDeckToEvent(
        request.eventId,
        {
          ...emptyDeck,
          id,
          lastUpdated: null,
          spreadsheetRowId: request.row.id,
          status: DeckStatus.ERROR,
          errors: [error.message],
        },
        response?.rawData
      );
    } finally {
      taskQueueItem.processed++
      this.onProgress?.(request.eventId, taskQueueItem.processed, taskQueueItem.count, taskQueueItem.hasError, taskQueueItem.hasFailure);

      this.requests.delete(request.id);
      const remaining = Array.from(taskQueueItem.tasks.values()).reduce((acc, val) => acc + val.length, 0)
      if (!remaining) {
        let status = EventFetchStatus.SUCCESS
        if (taskQueueItem.hasFailure) {
          status = taskQueueItem.hasError ? EventFetchStatus.FAILED : EventFetchStatus.PARTIAL
        }
        this.onEventComplete?.(request.eventId, status, taskQueueItem.count);
      }
    }
  }
}