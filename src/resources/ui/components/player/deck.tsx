import DeckLegality from "~/resources/ui/components/deck/legality"
import { DeckSourceBadge } from "~/resources/ui/components/deck/source"
import DeckList from "~/resources/ui/components/deck/decklist"
import DeckStatistics from "~/resources/ui/components/deck/statistics"
import React from "react"
import { cn } from "@heroui/theme"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { Card, CardBody } from "@heroui/card"
import DeckLastUpdate from "~/resources/ui/components/deck/last.update"
import { useEventFetchStatus, useFetchService } from "~/resources/ui/providers/fetcher"
import { Button } from "@heroui/button"
import { useEvent, usePlayer } from "~/resources/ui/providers/event"

type PlayerDeckProps = {
  className?: string
}

const PlayerDeck: React.FC<PlayerDeckProps> = ({className}) => {
  const { event } = useEvent()
  const { deck, hoveredCard, onHoveredCard } = useDeck()

  if (!deck) {
    return (
      <div className="col-span-9 space-y-6 mt-4">
        <p>No deck defined for this user, did you fetch the decks ?</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-12 gap-4", className)}>
      <h3 className="text-2xl font-semibold flex gap-5 align-baseline col-span-12">
        Decklist
        <DeckLegality />
        <DeckLastUpdate />
        <DeckSourceBadge />
      </h3>

      <Card className="col-span-3 aspect-[3/4] flex items-center justify-center sticky top-20 self-start">
        <CardBody>
          {hoveredCard ? (
            <img aria-label="card-preview" src={hoveredCard.imageMedium} alt="Hovered card" className="max-h-full max-w-full object-contain rounded-3xl" />
          ) : (
            <span className="text-muted-foreground">Hover a card to preview it</span>
          )}
        </CardBody>
      </Card>

      <div className="col-span-9 space-y-6 mt-4">


        <DeckList className="space-y-4" onHoveredCard={onHoveredCard}/>

        <DeckStatistics onHoveredCard={onHoveredCard} />
      </div>
    </div>
  )
}

export default PlayerDeck