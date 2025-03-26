import DraggableChip from "~/resources/ui/components/event/setup/mapping/player.chip"
import React from "react"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import { useDroppable } from "@dnd-kit/core"

const SpreadsheetPlayerPool = () => {
  const { status } = useEventSetup();
  const { setNodeRef } = useDroppable({ id: "pool" });

  const remaining = status.data.filter((p) => !status.getWotcIdByRow(p))

  if (!remaining.length) {
    return (
      <div className="text-gray-500 text-md">Good job ! All players have been paired.</div>
    )
  }

  return (
    <>
      <p className="text-medium mb-5">Each chip represent a player and can be drag’n’dropped on the left side of the page.</p>
      <div ref={setNodeRef} className="overflow-auto grid-cols-3 grid gap-2 min-w-0 px-2">

        {remaining.map(p => (
          <DraggableChip key={p.id} player={p}
                         className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full min-w-0" />
        ))}
      </div>
    </>
    )
}

export default SpreadsheetPlayerPool;