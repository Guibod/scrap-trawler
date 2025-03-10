import { useDraggable } from "@dnd-kit/core";
import { Chip } from "@heroui/chip";
import { CSS } from "@dnd-kit/utilities";
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import { HandRaisedIcon, RocketLaunchIcon, UserIcon } from "@heroicons/react/24/outline";

interface DraggableChipProps {
  player: SpreadsheetRow;
  className?: string;
  mode?: PairingMode;
}

// Assign solid colors & icons based on pairing mode
const getChipStyles = (mode?: PairingMode) => {
  switch (mode) {
    case "manual":
      return { color: "bg-blue-500", icon: <HandRaisedIcon className="w-4 h-4 text-white" /> };
    case "random":
      return { color: "bg-red-500", icon: <RocketLaunchIcon className="w-4 h-4 text-white" /> };
    case "name-strict":
      return { color: "bg-green-500", icon: <UserIcon className="w-4 h-4 text-white" /> };
    case "name-swap":
      return { color: "bg-yellow-500", icon: <UserIcon className="w-4 h-4 text-white" /> };
    case "name-first-initial":
    case "name-last-initial":
      return { color: "bg-yellow-400", icon: <UserIcon className="w-4 h-4 text-white" /> };
    case "name-levenshtein":
      return { color: "bg-orange-500", icon: <UserIcon className="w-4 h-4 text-white" /> };
    default:
      return { color: "bg-gray-300", icon: null }; // Unpaired (light gray)
  }
};

const DraggableChip = ({ player, className, mode }: DraggableChipProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: player.id });

  const { color, icon } = getChipStyles(mode);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <Chip
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      draggable
      size="sm"
      className={`${className} ${color} text-white shadow-md hover:scale-105 active:scale-95`}
    >
      <div className="max-w-[140px] overflow-hidden whitespace-nowrap inline-flex gap-1">
        {icon}
        <span className="truncate">{player.firstName} {player.lastName}</span>
      </div>
    </Chip>
  );
};

export default DraggableChip;
