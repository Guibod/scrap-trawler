import React from "react"
import { cn } from "~/resources/ui/utils"
import { LinkIcon } from "@heroicons/react/20/solid"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"
import { Link } from "react-router-dom"
import { Chip } from "@heroui/chip"
import { useDeck } from "~/resources/ui/components/deck/provider"

const sourceStyles: Record<DeckSource, { color: string; label: string }> = {
  [DeckSource.MOXFIELD]: {
    color: "bg-[#731fa1] text-white",
    label: "Moxfield",
  },
  [DeckSource.TEXT]: {
    color: "bg-gray-500 text-white",
    label: "Text Import",
  },
  [DeckSource.MAGIC_VILLE]: {
    color: "bg-[##ffffcc] text-black",
    label: "Magic Ville",
  },
  [DeckSource.ARCHIDEKT]: {
    color: "bg-[#fa890d] text-black",
    label: "Archidekt",
  },
  [DeckSource.UNKNOWN]: {
    color: "bg-yellow-600 text-white",
    label: "Unknown",
  },
}

interface Props {
  className?: string
}

export function DeckSourceBadge({ className }: Props) {
  const { deck } = useDeck()

  const source = sourceStyles[deck?.source] || sourceStyles[DeckSource.UNKNOWN]

  return (
    <Link to={deck.url} target="_blank" rel="noopener noreferrer">
      <Chip
        avatar={<LinkIcon className="opacity-80 w-4 h-4" aria-label="link-icon" />}
        className={cn(
        source.color,
        "inline-flex items-center gap-1 px-2 py-1 whitespace-nowrap",
        className
      )}>
        {source.label}
      </Chip>
    </Link>
  )
}
