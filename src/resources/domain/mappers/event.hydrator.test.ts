import { vi, describe, it, expect } from 'vitest';

import { ScrapTrawlerError } from "~/resources/exception"
import type EventEntity from "~/resources/storage/entities/event.entity"
import { sampleEvent, sampleGameState, sampleOrganizer } from "~/resources/integrations/eventlink/data/sample.event"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"

const loggerErrorMock = vi.fn();
vi.doMock('~/resources/logging/logger', () => ({
  getLogger: vi.fn(() => ({
    error: loggerErrorMock,
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  })),
}));

// 🚀 Re-import EventHydrator AFTER mocking the logger
const { default: EventHydrator } = await vi.importActual<typeof import("~/resources/domain/mappers/event.hydrator")>('~/resources/domain/mappers/event.hydrator');

// Mock event data
const validEventData = {
  event: { status: 'ONGOING' },
  players: [],
  rounds: [],
  raw_data: {
    wotc: {
      event: sampleEvent,
      organization: sampleOrganizer,
      rounds: {
        "1": sampleGameState,
        "2": sampleGameState,
      }
    }
  }
} as unknown as EventEntity

const nullEventData = {
  event: null,
  players: [],
  rounds: [],
  raw_data: {}
} as unknown as EventEntity


describe('EventHydrator', () => {
  it('should hydrate a valid event', () => {
    const result = EventHydrator.hydrate(validEventData);
    expect(result).toBeDefined();
  });

  it('should throw an error if event is null', () => {
    expect(() => EventHydrator.hydrate(nullEventData)).toThrow(ScrapTrawlerError);
  });

  it('should handle missing status safely', () => {
    const data = {
      ...validEventData,
      event: {}
    } as unknown as EventEntity;
    expect(() => EventHydrator.hydrate(data)).not.toThrow();
  });

  describe('inferStatus', () => {
    it('should return default NOT_STARTED statuses when no data is provided', () => {
      const entity = { raw_data: {} } as unknown as EventEntity;
      const status = EventHydrator.inferStatus(entity);
      expect(status).toEqual({
        global: GlobalStatus.NOT_STARTED,
        scrape: ScrapeStatus.IN_PROGRESS,
        pair: PairStatus.NOT_STARTED,
        fetch: FetchStatus.NOT_STARTED,
      });
    });

    it('should set scrape to COMPLETED and global to PARTIAL when event is ENDED', () => {
      const entity = { raw_data: { wotc: { event: { status: 'ENDED' } } } }  as unknown as EventEntity;
      const status = EventHydrator.inferStatus(entity);
      expect(status.scrape).toBe(ScrapeStatus.COMPLETED);
      expect(status.global).toBe(GlobalStatus.PARTIAL);
    });

    it('should set pair to PARTIAL when spreadsheet data exists', () => {
      const entity = { raw_data: { spreadsheet: {} } }   as unknown as EventEntity
      const status = EventHydrator.inferStatus(entity);
      expect(status.pair).toBe(PairStatus.PARTIAL);
    });

    it('should set pair to COMPLETED when spreadsheet is fully mapped and finalized', () => {
      const entity = {
        raw_data: { spreadsheet: {} },
        mapping: true,
        spreadsheet: { columns: [1], finalized: true },
      }  as unknown as EventEntity;
      const status = EventHydrator.inferStatus(entity);
      expect(status.pair).toBe(PairStatus.COMPLETED);
    });

    it('should set global to COMPLETED when both scrape and pair and fetch are completed', () => {
      const entity = {
        raw_data: { wotc: { event: { status: 'ENDED' } }, spreadsheet: {}, fetch: {} },
        mapping: true,
        decks: [{ status: DeckStatus.FETCHED }],
        spreadsheet: { columns: [1], finalized: true },
      }   as unknown as EventEntity
      const status = EventHydrator.inferStatus(entity);
      expect(status.global).toBe(GlobalStatus.COMPLETED);
    });

    it('should log an error but not crash if an exception occurs', () => {
      const entity = null;
      expect(() => EventHydrator.inferStatus(entity)).not.toThrow();
      expect(loggerErrorMock).toHaveBeenCalledWith(
        'Failed to infer status:',
        expect.any(TypeError)
      );
    });
  });
});