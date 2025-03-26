import React from "react";
import { Button } from "@heroui/button";
import { useEventSetup } from "~/resources/ui/components/event/setup/provider";
import { DndContext } from "@dnd-kit/core";
import DroppablePlayerCard from "~/resources/ui/components/event/setup/mapping/player.card"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { SpreadsheetRowId } from "~/resources/domain/dbos/spreadsheet.dbo"
import SpreadsheetPlayerPool from "~/resources/ui/components/event/setup/mapping/player.pool"
import { MagnifyingGlassIcon, XCircleIcon, RocketLaunchIcon } from "@heroicons/react/20/solid";
import { Alert } from "@heroui/alert"
import { RandomMatcher } from "~/resources/domain/parsers/matcher.random"
import { NameMatcher } from "~/resources/domain/parsers/matcher.name"
import { Card, CardBody, CardHeader } from "@heroui/card"

const SetupPairing: React.FC = () => {
  const { status, handlePairings, event } = useEventSetup();

  const matchByName = () => {
    const matcher = new NameMatcher(Object.values(event.players), status.data, status.pairs);
    handlePairings(matcher.match());
  };

  const assignRandomly = () => {
    const matcher = new RandomMatcher(Object.values(event.players), status.data, status.pairs);
    handlePairings(matcher.match());
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const rowId: SpreadsheetRowId = active.id; // Spreadsheet player ID
    const wotcId: WotcId = over.id; // EventLink player ID or "pool"

    // Clone current pairings
    const updatedMapping = { ...event.mapping };

    if (wotcId === "pool") {
      // Dropped into the pool → Remove pairing
      Object.keys(updatedMapping).forEach((personaId) => {
        if (updatedMapping[personaId].rowId === rowId) {
          delete updatedMapping[personaId];
        }
      });
    } else {
      // Assign to a new player
      Object.keys(updatedMapping).forEach((personaId) => {
        if (updatedMapping[personaId].rowId === rowId) {
          delete updatedMapping[personaId]; // Remove previous assignment
        }
      });

      updatedMapping[wotcId] = { rowId, mode: "manual" }; // New pairing
    }

    handlePairings(updatedMapping);
  };


  return (
    <DndContext onDragEnd={handleDragEnd}>
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
              onPress={() => handlePairings(null)}
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
                {Object.values(event.players).map((player) => (
                  <DroppablePlayerCard
                    key={player.id}
                    player={player}
                    assignedPlayer={status.getRowByWotcId(player.id)}
                    mode={status.getModeByWotcId(player.id)}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Right: Spreadsheet Players (Draggable) */}
          <Card className="w-1/2 border p-4 rounded-lg shadow-md flex flex-col h-full">
            <CardHeader className="text-lg font-semibold">
              Spreadsheet Players
            </CardHeader>
            <CardBody className="overflow-auto flex-1">
              <SpreadsheetPlayerPool />
            </CardBody>
          </Card>
        </div>
      </div>

    </DndContext>
);
};

export default SetupPairing;
