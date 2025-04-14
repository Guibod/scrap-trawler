import React, { useEffect, useState } from "react"
import { cn } from "~/resources/ui/utils"
import { ExclamationTriangleIcon, CheckBadgeIcon } from "@heroicons/react/20/solid"
import { Chip } from "@heroui/chip"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { useEvent } from "~/resources/ui/providers/event"

interface Props {
  className?: string
}

export function DeckLastUpdate({ className }: Props) {
  const { deck } = useDeck()

  return (
    <Chip
      avatar={
        deck.legal ? (
          <CheckBadgeIcon className="w-4 h-4 text-green-400" aria-label="ok-icon" />
        ) : (
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-300" aria-label="warning-icon" />
        )
      }
      className={cn(
        deck.legal ? "bg-green-800 text-white" : "bg-red-800 text-white",
        "inline-flex items-center gap-1 px-2 py-1 whitespace-nowrap",
        className
      )}
    >
      {deck.legal ? `legal in ${deck.format} ` : `illegal in ${deck.format}`}
    </Chip>
  )
}

export default DeckLastUpdate
