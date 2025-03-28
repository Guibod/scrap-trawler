// src/storage/database-observer.ts
import type { Table } from "dexie"
import { EventBus } from "~/resources/utils/event-bus"

export class DatabaseObserver {
  private readonly DEBOUNCE_DELAY = 50
  constructor(private readonly tables: Table[]) {}

  start() {
    for (const table of this.tables) {
      table.hook("creating", (key) => {
        setTimeout(() => {
            EventBus.emit("storage:changed", {
              table: table.name,
              key: String(key),
              action: "create"
            })
          }, this.DEBOUNCE_DELAY
        )
      })

      table.hook("updating", (_, key) => {
        setTimeout(() => {
          EventBus.emit("storage:changed", {
            table: table.name,
            key: String(key),
            action: "update"
          })
        }, this.DEBOUNCE_DELAY)
      })

      table.hook("deleting", (key) => {
        setTimeout(() => {
          EventBus.emit("storage:changed", {
            table: table.name,
            key: String(key),
            action: "delete"
          })
        }, this.DEBOUNCE_DELAY)
      })
    }
  }
}
