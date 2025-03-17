import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { createMock } from "@golevelup/ts-vitest"
import type { LoggerInterface } from "~/resources/logging/interface"
import DatabaseService from "~/resources/storage/database"

const mockLogger = createMock<LoggerInterface>();
vi.mock("~/resources/logging/logger", () => ({
  getLogger: () => mockLogger
}))

describe('DatabaseService', () => {
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
});
