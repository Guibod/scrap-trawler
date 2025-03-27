import { useState, useEffect } from "react"
import { addToast } from "@heroui/react"
import { NameMatcher } from "~/resources/domain/parsers/matcher.name"
import { RandomMatcher } from "~/resources/domain/parsers/matcher.random"
import { countDiff } from "~/resources/utils/diff"
import type { SpreadsheetRow, SpreadsheetRowId } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"
import type { Active } from "@dnd-kit/core"
import type { EventModel } from "~/resources/domain/models/event.model"
import { SetupStatus } from "~/resources/ui/components/event/setup/status"

export function usePairingController(event: EventModel, status: SetupStatus, handlePairings: (updatedPairings: MappingDbo | null) => void) {
  const [localMapping, setLocalMapping] = useState<MappingDbo>(event.mapping)
  const [unassigned, setUnassigned] = useState<SpreadsheetRow[]>([])
  const [active, setActive] = useState<Active | null>(null)

  useEffect(() => {
    setUnassigned(status.data.filter((p) => !status.getWotcIdByRow(p)))
  }, [status])

  const getSortedPlayers = () => {
    return Object.values(event.players)
      .map((player) => ({
        ...player,
        mode: localMapping?.[player.id]?.mode,
        row: status.data.find((row) => localMapping?.[player.id]?.rowId === row.id),
      }))
      .sort((a, b) => {
        const isAUnassigned = !localMapping?.[a.id]
        const isBUnassigned = !localMapping?.[b.id]
        if (isAUnassigned !== isBUnassigned) return isAUnassigned ? -1 : 1
        return (
          a.lastName.localeCompare(b.lastName) ||
          a.firstName.localeCompare(b.firstName)
        )
      })
  }

  const matchByName = () => {
    const matcher = new NameMatcher(Object.values(event.players), status.data, status.pairs)
    const updated = matcher.match()
    const diff = countDiff(updated, status.pairs)
    if (diff) {
      setLocalMapping(updated)
      handlePairings(updated)
      addToast({
        title: "Pairings Updated",
        description: `${diff} player(s) have been matched by name.`,
        severity: "success",
      })
    }
  }

  const assignRandomly = () => {
    const matcher = new RandomMatcher(Object.values(event.players), status.data, status.pairs)
    const updated = matcher.match()
    const diff = countDiff(updated, status.pairs)
    if (diff) {
      setLocalMapping(updated)
      handlePairings(updated)
      addToast({
        title: "Pairings Updated",
        description: `${diff} player(s) have been randomly assigned.`,
        severity: "success",
      })
    }
  }

  const unassignAll = () => {
    const previousCount = Object.keys(status.pairs).length
    if (previousCount > 0) {
      handlePairings(null)
      setLocalMapping(null)
      addToast({
        title: "Pairings Updated",
        description: `${previousCount} player(s) have been unassigned.`,
        severity: "success",
      })
    }
  }

  const handleDragStart = (event) => {
    setActive(event.active)
  }

  const handleDragEnd = ({ active, over }) => {
    setActive(null)
    if (!over) return

    const rowId: SpreadsheetRowId = active.id
    const wotcId: WotcId = over.id

    let updatedMapping = { ...localMapping }
    for (const id in updatedMapping) {
      if (updatedMapping[id].rowId === rowId) delete updatedMapping[id]
    }
    if (wotcId !== "pool") {
      updatedMapping[wotcId] = { rowId, mode: "manual" }
    }

    setLocalMapping(updatedMapping)

    const stillAssigned = new Set(Object.values(updatedMapping).map((m) => m.rowId))
    setUnassigned(status.data.filter((row) => !stillAssigned.has(row.id)))

    handlePairings(updatedMapping)
  }

  return {
    active,
    setActive,
    localMapping,
    unassigned,
    getSortedPlayers,
    matchByName,
    assignRandomly,
    unassignAll,
    handleDragStart,
    handleDragEnd,
  }
}
