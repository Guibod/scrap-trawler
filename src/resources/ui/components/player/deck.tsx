import DeckLegality from "~/resources/ui/components/deck/legality"
import { DeckSourceBadge } from "~/resources/ui/components/deck/source"
import DeckList from "~/resources/ui/components/deck/decklist"
import DeckStatistics from "~/resources/ui/components/deck/statistics"
import React from "react"
import { cn } from "@heroui/theme"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { Card, CardBody } from "@heroui/card"
import DeckLastUpdate from "~/resources/ui/components/deck/last.update"
import { usePlayer } from "~/resources/ui/providers/event"
import DeckFetcherResolver from "~/resources/integrations/decks/resolver"
import { NothingFetcher } from "~/resources/integrations/decks/fetchers/nothing.fetcher"
import { Alert } from "@heroui/alert"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"

type PlayerDeckProps = {
  className?: string
}

const PlayerDeck: React.FC<PlayerDeckProps> = ({className}) => {
  const { deck, hoveredCard, onHoveredCard } = useDeck()

  if (!deck) {
    return (
      <Alert color="danger" title={`No Deck data`}>
        <p>This is a rather strange behavior, you should not view this. Please file a bug report.</p>
      </Alert>
    )
  }

  if (!deck.boards?.mainboard) {
    const player = usePlayer()
    const fetcherClass = DeckFetcherResolver.resolveFetcherType(player.spreadsheetRow)

    if (fetcherClass === NothingFetcher) {
      return (
        <Alert color="warning" title={`Missing support for this external source`}>
          <p>This deck was published on an unsupported website, using this url: <a href={player.spreadsheetRow?.decklistUrl} target="_blank">{player.spreadsheetRow?.decklistUrl}</a></p>
          <p>Scrap Trawler will likely support this source in a near future, but right now it’s not supported.</p>
        </Alert>
      )
    }

    if (deck.status === DeckStatus.FAILED) {
      return (
        <Alert color="danger" title={`Failed to recover the deck`}>
          <p>The deck was not fetched successfully. It’s likely that the deck is not published anymore.</p>
          <p>This deck is <a href={player.spreadsheetRow?.decklistUrl} target="_blank">{player.spreadsheetRow?.decklistUrl}</a></p>
          <p>The logged error(s) were:</p>
          <ul className="list-disc pl-5">
            {deck.errors?.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )
    }

    return (
      <Alert color="primary" title={`No deck found`}>
        <p>No deck defined for this user, did you recover a card database and fetched the decks ?</p>
        <p>This deck is <a href={player.spreadsheetRow?.decklistUrl} target="_blank">{player.spreadsheetRow?.decklistUrl}</a></p>
      </Alert>
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