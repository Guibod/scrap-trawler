// SetupPairing/index.tsx
import React from "react"
import { DndContext, DragOverlay, rectIntersection } from "@dnd-kit/core"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import PlayerChip from "~/resources/ui/components/event/setup/mapping/player.chip"
import { usePairingController } from "~/resources/ui/components/event/setup/pairing/usePairing.controller"
import PairingMain from "~/resources/ui/components/event/setup/pairing/main"
import PairingSidebar from "~/resources/ui/components/event/setup/pairing/sidebar"
import PairingActions from "~/resources/ui/components/event/setup/pairing/actions"

const SetupPairing: React.FC = () => {
  const { status, handlePairings, event } = useEventSetup()
  const controller = usePairingController(event, status, handlePairings)

  return (
    <DndContext
      onDragEnd={controller.handleDragEnd}
      onDragStart={controller.handleDragStart}
      collisionDetection={rectIntersection}
    >
      <DragOverlay>
        {controller.active ? <PlayerChip row={controller.active.data.current.row} /> : null}
      </DragOverlay>

      <div className="flex flex-col w-full p-4">
        <PairingActions {...controller} />
        <div className="flex gap-6 h-[calc(100vh-100px)]">
          <PairingMain players={controller.getSortedPlayers()} {...controller} />
          <PairingSidebar unassigned={controller.unassigned} />
        </div>
      </div>
    </DndContext>
  )
}

export default SetupPairing
