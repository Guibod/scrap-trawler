import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { createMock } from "@golevelup/ts-vitest"
import type { LoggerInterface } from "~/resources/logging/interface"
import DatabaseService from "~/resources/storage/database"
import { EventBus } from "~/resources/utils/event-bus"
import type EventEntity from "~/resources/storage/entities/event.entity"
import { waitFor } from "@testing-library/react"

const mockLogger = createMock<LoggerInterface>();
vi.mock("~/resources/logging/logger", () => ({
  getLogger: () => mockLogger
}))

describe('DatabaseService', () => {
  const emit = vi.spyOn(EventBus, "emit")

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton for test isolation
    (DatabaseService as any).instance = undefined;
  });

  it('should create a singleton instance', () => {
    const db1 = DatabaseService.getInstance();
    const db2 = DatabaseService.getInstance();

    expect(db1).toBe(db2); // Singleton check
  });

  it('should initialize the database and event table', () => {
    const db = DatabaseService.getInstance();

    expect(db.events).toBeDefined(); // Ensure event table is created
    expect(typeof db.events.add).toBe('function'); // Dexie table methods should be available
  });

  it('should log database initialization', () => {
    DatabaseService.getInstance();

    expect(mockLogger.start).toHaveBeenCalledWith("Database initialized.");
  });

  it("should emit storage:changed on events table update", async () => {
    const db = DatabaseService.getInstance();

    await db.events.add({ id: "test-1", title: "before" } as EventEntity)
    await db.events.update("test-1", { title: "after" })

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith("storage:changed", {
        table: "events",
        key: "test-1",
        action: "update",
      })
    })
  })

  it("should emit storage:changed on events table delete", async () => {
    const db = DatabaseService.getInstance();

    await db.events.add({ id: "test-2", title: "to-delete" } as EventEntity)
    await db.events.delete("test-2")

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith("storage:changed", {
        table: "events",
        key: "test-2",
        action: "delete",
      })
    })
  })

  it("should emit storage:changed on events table create", async () => {
    const db = DatabaseService.getInstance();

    await db.events.add({ id: "test-3", title: "new" } as EventEntity)

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith("storage:changed", {
        table: "events",
        key: "test-3",
        action: "create",
      })
    })
  })
});
