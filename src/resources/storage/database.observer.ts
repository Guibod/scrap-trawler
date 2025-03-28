// src/storage/database-observer.ts
import type { Table } from "dexie"
import { EventBus } from "~/resources/utils/event-bus"

export class DatabaseObserver {
  constructor(private readonly tables: Table[]) {}

  start() {
    for (const table of this.tables) {
      table.hook("creating", (key) => {
        EventBus.emit("storage:changed", {
          table: table.name,
          key: String(key),
          action: "create"
        })
      })

      table.hook("updating", (_, key) => {
        EventBus.emit("storage:changed", {
          table: table.name,
          key: String(key),
          action: "update"
        })
      })

      table.hook("deleting", (key) => {
        EventBus.emit("storage:changed", {
          table: table.name,
          key: String(key),
          action: "delete"
        })
      })
    }
  }
}
