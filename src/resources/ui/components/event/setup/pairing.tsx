import React, { useEffect, useState } from "react"
import { Button } from "@heroui/button";
import { useEventSetup } from "~/resources/ui/components/event/setup/provider";
import { DndContext, DragOverlay, type Active, rectIntersection } from "@dnd-kit/core"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { SpreadsheetRow, SpreadsheetRowId } from "~/resources/domain/dbos/spreadsheet.dbo"
import { MagnifyingGlassIcon, XCircleIcon, RocketLaunchIcon } from "@heroicons/react/20/solid";
import { Alert } from "@heroui/alert"
import { RandomMatcher } from "~/resources/domain/parsers/matcher.random"
import { NameMatcher } from "~/resources/domain/parsers/matcher.name"
import { Card, CardBody, CardHeader } from "@heroui/card"
import PlayerChip from "~/resources/ui/components/event/setup/mapping/player.chip"
import Droppable from "~/resources/ui/components/dnd/droppable"
import { Draggable } from "~/resources/ui/components/dnd/draggable"
import type { MappingDbo, PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import Player from "~/resources/ui/components/player/player"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import { addToast } from "@heroui/react"
import { countDiff } from "~/resources/utils/diff"

type PairingPlayer = {
  row?: SpreadsheetRow
  mode?: PairingMode
} & PlayerDbo

const SetupPairing: React.FC = () => {
  const { status, handlePairings, event } = useEventSetup();
  const [active, setActive] = useState<Active>(null);
  const [unassigned, setUnassigned] = useState<SpreadsheetRow[]>([])
  const [localMapping, setLocalMapping] = useState<MappingDbo>(event.mapping);

  const getSortedPlayers = (): PairingPlayer[] => {
    return Object.values(event.players)
      .map(player => ({
        ...player,
        mode: localMapping?.[player.id]?.mode,
        row: status.data.find((row) => localMapping?.[player.id]?.rowId === row.id),
      }))
      .sort((a, b) => {
        const isAUnassigned = !localMapping?.[a.id];
        const isBUnassigned = !localMapping?.[b.id];

        if (isAUnassigned !== isBUnassigned) {
          return isAUnassigned ? -1 : 1; // unassigned first
        }

        return a.lastName.localeCompare(b.lastName) ||
            a.firstName.localeCompare(b.firstName)
    });
  }

  useEffect(() => {
    setUnassigned(status.data.filter((p) => !status.getWotcIdByRow(p)))
  }, [status])


  const matchByName = () => {
    const matcher = new NameMatcher(Object.values(event.players), status.data, status.pairs);
    const updated = matcher.match()
    const diff = countDiff(updated, status.pairs);
    if (diff) {
      setLocalMapping(updated);
      handlePairings(updated)
      addToast({
        title: "Pairings Updated",
        description: `${diff} player(s) have been matched by name.`,
        severity: "success"
      })
    }
  };

  const assignRandomly = () => {
    const matcher = new RandomMatcher(Object.values(event.players), status.data, status.pairs);
    const updated = matcher.match()
    const diff = countDiff(updated, status.pairs);
    if (diff) {
      setLocalMapping(updated);
      handlePairings(updated)
      addToast({
        title: "Pairings Updated",
        description: `${diff} player(s) have been randomly by name.`,
        severity: "success"
      })
    }
  };

  const unassignAll = () => {
    const previousCount = Object.keys(status.pairs).length
    if (previousCount > 0) {
      handlePairings(null)
      setLocalMapping(null)
      addToast({
        title: "Pairings Updated",
        description: `${previousCount} player(s) have been unassigned.`,
        severity: "success"
      })
    }
  }

  const handleDragStart = (event) => {
    setActive(event.active);
  }

  const handleDragEnd = ({ active, over }) => {
    setActive(null);
    if (!over) return;

    const rowId: SpreadsheetRowId = active.id; // Spreadsheet player ID
    const wotcId: WotcId = over.id; // EventLink player ID or "pool"

    // Clone current pairings
    let updatedMapping = { ...localMapping };
    if (wotcId === "pool") {
      for (const id in updatedMapping) {
        if (updatedMapping[id].rowId === rowId) delete updatedMapping[id];
      }
    } else {
      for (const id in updatedMapping) {
        if (updatedMapping[id].rowId === rowId) delete updatedMapping[id];
      }
      updatedMapping[wotcId] = { rowId, mode: "manual" };
    }

    setLocalMapping(updatedMapping);

    // Optimistically update unassigned
    const stillAssigned = new Set(Object.values(updatedMapping).map((m) => m.rowId));
    setUnassigned(status.data.filter((row) => !stillAssigned.has(row.id)));

    // Then call the actual store update
    handlePairings(updatedMapping);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} collisionDetection={rectIntersection}>
      <DragOverlay>
        {active ? (
          <PlayerChip row={active.data.current.row} />
        ): null}
      </DragOverlay>

      <div className="flex flex-col w-full p-4">
        {status.hasAllPairings && (
          <Alert color="success" className="mb-4" isClosable={true}>
            Pairings are complete !
          </Alert>
        )}

        <div>
          {/* Action Buttons */}
          <div className="mb-4 flex gap-4">
            <Button
              onPress={matchByName}
              color={"primary"}
              startContent={<MagnifyingGlassIcon className={"fill-gray-500 stroke-black"} />}
            >Match by Name</Button>

            <Button
              onPress={assignRandomly}
              color={"secondary"}
              startContent={<RocketLaunchIcon className={"fill-gray-500 stroke-black"} />}
            >
              Assign Randomly
            </Button>

            <Button
              onPress={unassignAll}
              color="danger"
              startContent={<XCircleIcon className={"fill-gray-500 stroke-black"} />}
            >
              Reset Assignments
            </Button>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-100px)]">
          {/* Left: Tournament Players (Drop Targets) */}
          <Card className="w-1/2 border p-4 rounded-lg shadow-md flex flex-col h-full">
            <CardHeader className="text-lg font-semibold">
              EventLink Players
            </CardHeader>
            <CardBody className="overflow-auto flex-1">
              <div className="flex flex-col gap-2">
                {getSortedPlayers().map((player) => {
                  return (
                    <Droppable
                      id={player.id}
                      key={player.id}
                      element="div"
                    >
                      <Card className={`mt-3 transition-all`}>
                        <CardBody>
                          <Player playerId={player.id}>
                            {player.row &&
                              <Draggable<{row: SpreadsheetRow}> id={player.row.id} data={{ row: player.row }}>
                                <PlayerChip row={player.row} mode={player.mode} />
                              </Draggable>}
                          </Player>
                        </CardBody>
                      </Card>
                    </Droppable>
                  )
                })}
              </div>
            </CardBody>
          </Card>

          {/* Right: Spreadsheet Players (Draggable) */}
          <Card className="w-1/2 border p-4 rounded-lg shadow-md flex flex-col h-full">
            <CardHeader className="text-lg font-semibold">
              Spreadsheet Players
            </CardHeader>
            <CardBody className="overflow-auto flex-1">
              <p className="text-medium mb-5">Each chip represent a player and can be drag’n’dropped on the left side of
                the page.</p>

              <Droppable id={"pool"} element="div" className="overflow-auto grid-cols-3 grid gap-2 min-w-0 px-2 content-start">
                {unassigned.map((row) => (
                  <Draggable<{ row: SpreadsheetRow }> key={row.id} id={row.id} data={{ row }}>
                    <PlayerChip
                      key={row.id}
                      row={row}
                      className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full w-fit min-w-40"
                    />
                  </Draggable>
                ))}
              </Droppable>
            </CardBody>
          </Card>
        </div>
      </div>

    </DndContext>
);
};

export default SetupPairing;
