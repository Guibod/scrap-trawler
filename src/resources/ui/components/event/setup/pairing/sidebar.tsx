// PairingSidebar.tsx
import React from "react"
import { Card, CardBody, CardHeader } from "@heroui/card"
import Droppable from "~/resources/ui/components/dnd/droppable"
import { Draggable } from "~/resources/ui/components/dnd/draggable"
import PlayerChip from "~/resources/ui/components/event/setup/mapping/player.chip"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"

type PairingSidebarProps = {
  unassigned: SpreadsheetRow[]
}

const PairingSidebar: React.FC<PairingSidebarProps> = ({ unassigned }) => {
  return (
    <Card className="w-1/2 border p-4 rounded-lg shadow-md flex flex-col h-full">
      <CardHeader className="text-lg font-semibold">
        Spreadsheet Players
      </CardHeader>
      <CardBody className="overflow-auto flex-1">
        <p className="text-medium mb-5">
          Each chip represents a player and can be drag’n’dropped on the left side of the page.
        </p>

        <Droppable
          id="pool"
          element="div"
          className="overflow-auto grid-cols-3 grid gap-2 min-w-0 px-2 content-start"
        >
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
  )
}

export default PairingSidebar
