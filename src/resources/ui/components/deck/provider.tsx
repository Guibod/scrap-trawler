import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { DeckMapper, type ResolvedDeckDbo } from "~/resources/domain/mappers/deck.mapper"
import { DeckAnalyzer } from "~/resources/domain/utils/deck.analyzer"
import type { PlayerProfile } from "~/resources/domain/mappers/player.mapper"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"

export type DeckContextValue = {
  deck: ResolvedDeckDbo | null
  analyzer: DeckAnalyzer | null
  onHoveredCard: (CardDbo) => void
  hoveredCard: CardDbo | null
}

const DeckContext = createContext<DeckContextValue>({
  deck: null,
  analyzer: null,
  hoveredCard: null,
  onHoveredCard: () => {}
})

type DeckProviderProps = {
  player: PlayerProfile
  children: React.ReactNode
}

export function DeckProvider({ player, children }: DeckProviderProps) {
  const [resolvedDeck, setResolvedDeck] = useState<ResolvedDeckDbo | null>(null)
  const [hoveredCard, setHoveredCard] = React.useState<CardDbo | null>(null)

  useEffect(() => {
    if (!player?.deck) return
    const mapper = new DeckMapper()
    mapper.toResolvedDeck(player.deck).then(setResolvedDeck)
  }, [player?.deck])

  const analyzer = useMemo(() => resolvedDeck ? new DeckAnalyzer(resolvedDeck) : null, [resolvedDeck])

  return (
    <DeckContext.Provider value={{
      deck: resolvedDeck,
      onHoveredCard: setHoveredCard,
      hoveredCard,
      analyzer
    }}>
      {children}
    </DeckContext.Provider>
  )
}

export function useDeck() {
  return useContext(DeckContext)
}
