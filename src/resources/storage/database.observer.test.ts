import { describe, it, beforeEach, vi, expect } from "vitest"
import "fake-indexeddb/auto"
import Dexie from "dexie"
import { DatabaseObserver } from "./database.observer"
import { EventBus } from "~/resources/utils/event-bus"

interface CatEntity {
  id: string
  name: string
}
interface DogEntity {
  id: string
  name: string
}

class TestDb extends Dexie {
  cats!: Dexie.Table<CatEntity, string>
  dogs!: Dexie.Table<DogEntity, string>

  constructor() {
    super("TestDb")
    this.version(1).stores({
      cats: "id",
      dogs: "id",
    })

    this.cats = this.table<CatEntity, 'id'>('cats');
    this.dogs = this.table<DogEntity, 'id'>('dogs');
  }
}

describe("DatabaseObserver (real Dexie)", () => {
  let db: TestDb
  const emit = vi.spyOn(EventBus, "emit")

  beforeEach(async () => {
    db = new TestDb()
    await db.open()
    emit.mockClear()

    new DatabaseObserver([db.cats, db.dogs]).start()
  })

  it("emits on create", async () => {
    await db.cats.add({ id: "1", name: "Create Me" })

    expect(emit).toHaveBeenCalledWith("storage:changed", {
      table: "cats",
      key: "1",
      action: "create",
    })
  })

  it("emits on update", async () => {
    await db.cats.add({ id: "2", name: "Before" })
    await db.cats.update("2", { name: "After" })

    expect(emit).toHaveBeenCalledWith("storage:changed", {
      table: "cats",
      key: "2",
      action: "update",
    })
  })

  it("emits on delete", async () => {
    await db.cats.add({ id: "3", name: "Delete Me" })
    await db.cats.delete("3")

    expect(emit).toHaveBeenLastCalledWith("storage:changed", {
      table: "cats",
      key: "3",
      action: "delete",
    })
  })
})
