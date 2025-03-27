import { Chip } from "@heroui/chip";
import React from "react";
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import { HandRaisedIcon, RocketLaunchIcon, UserIcon } from "@heroicons/react/24/outline";

interface PlayerChipProps {
  row: SpreadsheetRow;
  className?: string;
  mode?: PairingMode;
}

// Assign solid colors & icons based on pairing mode
const getChipStyles = (mode?: PairingMode) => {
  switch (mode) {
    case "manual":
      return { color: "bg-blue-500", text: "text-white", icon: <HandRaisedIcon className="w-4 h-4 text-white  translate-y-[2px]" /> };
    case "random":
      return { color: "bg-red-500", text: "text-white", icon: <RocketLaunchIcon className="w-4 h-4 text-white  translate-y-[2px]" /> };
    case "name-strict":
      return { color: "bg-green-500", text: "text-gray-800", icon: <UserIcon className="w-4 h-4 text-grey-800  translate-y-[2px]" /> };
    case "name-swap":
      return { color: "bg-yellow-500", text: "text-gray-800", icon: <UserIcon className="w-4 h-4 text-grey-800  translate-y-[2px]" /> };
    case "name-first-initial":
    case "name-last-initial":
      return { color: "bg-yellow-400", text: "text-gray-800", icon: <UserIcon className="w-4 h-4 gray-800  translate-y-[2px]" /> };
    case "name-levenshtein":
      return { color: "bg-orange-500", text: "text-white", icon: <UserIcon className="w-4 h-4 text-white  translate-y-[2px]" /> };
    default:
      return { color: "bg-gray-300", text: "text-black", icon: null }; // Unpaired (light gray)
  }
};

const PlayerChip = ({ row, className, mode }: PlayerChipProps) => {
  const { color, icon, text } = getChipStyles(mode);

  return (
    <Chip
      aria-label={`chip for ${row?.firstName} ${row?.lastName}`}
      draggable
      size="sm"
      className={`${className} ${color} ${text} shadow-md hover:scale-105 active:scale-95`}
    >
      <div className="max-w-[140px] overflow-hidden whitespace-nowrap inline-flex items-baseline gap-1">
        {icon}
        <span className="truncate">{row?.firstName} {row?.lastName}</span>
      </div>
    </Chip>
  );
};

export default PlayerChip;
