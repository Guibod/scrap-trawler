import { useDroppable } from "@dnd-kit/core";
import { Card, CardBody } from "@heroui/card";
import Player from "~resources/ui/components/player/player";
import DraggableChip from "~resources/ui/components/event/setup/mapping/player.chip"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { SpreadsheetRow } from "~resources/domain/dbos/spreadsheet.dbo"
import type { PairingMode } from "~resources/domain/dbos/mapping.dbo"

interface DroppablePlayerCardProps {
  player: PlayerDbo;
  assignedPlayer: SpreadsheetRow,
  mode: PairingMode
}

const DroppablePlayerCard = ({ player, assignedPlayer, mode }: DroppablePlayerCardProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: player.id });

  return (
    <Card ref={setNodeRef} className={`mt-3 transition-all ${isOver ? "border-2 border-blue-500" : ""}`}>
      <CardBody>
        <Player playerId={player.id}>
          {assignedPlayer && <DraggableChip player={assignedPlayer} mode={mode} />}
        </Player>
      </CardBody>
    </Card>
  );
};

export default DroppablePlayerCard;
