import React, { useEffect, useState } from "react"
import { cn } from "~/resources/ui/utils"
import { ExclamationTriangleIcon, CheckBadgeIcon } from "@heroicons/react/20/solid"
import { Chip } from "@heroui/chip"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { useEvent } from "~/resources/ui/providers/event"
import { Tooltip } from "@heroui/tooltip"
import { formatTimeDifference } from "~/resources/utils/date"

interface Props {
  className?: string
}

export function DeckLastUpdate({ className }: Props) {
  const { event } = useEvent()
  const { deck } = useDeck()
  const [isModifiedSinceEventStart, setIsModifiedSinceEventStart] = useState(false)

  useEffect(() => {
    setIsModifiedSinceEventStart(deck.lastUpdated > event.date)
  }, [deck.lastUpdated, event.date])

  return (
    <Tooltip content={isModifiedSinceEventStart ?
      `Deck modified ${formatTimeDifference(event.date, deck.lastUpdated, 'hour')}` :
      "No late deck modifications detected"
    }>
      <Chip
        avatar={
          isModifiedSinceEventStart ? (
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-300" aria-label="warning-icon" />
          ) : (
            <CheckBadgeIcon className="w-4 h-4 text-green-400" aria-label="ok-icon" />
          )
        }
        className={cn(
          isModifiedSinceEventStart ? "bg-red-800 text-white" : "bg-green-800 text-white",
          "inline-flex items-center gap-1 px-2 py-1 whitespace-nowrap",
          className
        )}
      >
        {deck.lastUpdated.toLocaleString()}
      </Chip>
    </Tooltip>
  )
}

export default DeckLastUpdate
