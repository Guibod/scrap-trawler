import React from "react"
import { Card, CardBody, CardHeader } from "@heroui/card"
import Droppable from "~/resources/ui/components/dnd/droppable"
import { Draggable } from "~/resources/ui/components/dnd/draggable"
import Player from "~/resources/ui/components/player/player"
import PlayerChip from "~/resources/ui/components/event/setup/mapping/player.chip"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { PairingPlayer } from "~/resources/ui/components/event/setup/pairing/types"

type PairingMainProps = {
  players: PairingPlayer[]
  localMapping: MappingDbo
}

const PairingMain: React.FC<PairingMainProps> = ({ players }) => {
  return (
    <Card className="w-1/2 border p-4 rounded-lg shadow-md flex flex-col h-full">
      <CardHeader className="text-lg font-semibold">
        EventLink Players
      </CardHeader>
      <CardBody className="overflow-auto flex-1">
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <Droppable id={player.id} key={player.id} element="div">
              <Card className="mt-3 transition-all">
                <CardBody>
                  <Player playerId={player.id}>
                    {player.row && (
                      <Draggable<{ row: SpreadsheetRow }> id={player.row.id} data={{ row: player.row }}>
                        <PlayerChip row={player.row} mode={player.mode} />
                      </Draggable>
                    )}
                  </Player>
                </CardBody>
              </Card>
            </Droppable>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

export default PairingMain
