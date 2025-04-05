import DeckListCard from "~/resources/ui/components/deck/decklist/card"
import React from "react"
import type { ResolvedDeckCard } from "~/resources/domain/mappers/deck.mapper"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"
import { ViewMode } from "~/resources/ui/components/deck/enum"
import { cn } from "@heroui/theme"

type DeckListSectionProps = {
  title: string
  cards: ResolvedDeckCard[]
  viewMode: ViewMode
  onCardHover: (card: CardDbo | null) => void
}

const classNameByViewMode: Record<ViewMode, string> = {
  [ViewMode.TABLE]: "flex flex-col text-sm px-2 space-y-1",
  [ViewMode.TABLE_CONDENSED]: "flex flex-col text-sm px-1",
  [ViewMode.VISUAL_GRID]: "position-relative flex flex-wrap mt-32 gap-2",
  [ViewMode.VISUAL_SPOILER]: "position-relative flex flex-wrap gap-2",
  [ViewMode.VISUAL_STACK]: "flex flex-col mb-80",
  [ViewMode.VISUAL_STACK_SPLIT]: "flex flex-col mb-80",
}

const DeckListSection: React.FC<DeckListSectionProps> = ({ title, cards, viewMode = ViewMode.TABLE, onCardHover }) => {
  if (!cards?.length) return null
  const isSplit = [ViewMode.VISUAL_STACK_SPLIT].includes(viewMode)
  const isCondensed = [ViewMode.TABLE_CONDENSED].includes(viewMode)
  const hasColumns = [ViewMode.TABLE_CONDENSED, ViewMode.TABLE, ViewMode.VISUAL_STACK, ViewMode.VISUAL_STACK_SPLIT].includes(viewMode)

  const cardsOptionallySplit = isSplit
    ? cards.flatMap(({ card, quantity }) =>
      Array.from({ length: quantity }, () => ({ card, quantity: 1 }))
    )
    : cards

  const count = cards.reduce((sum, { quantity }) => sum + quantity, 0)

  return (
    <section className={cn(
      "break-inside-avoid break-after-avoid-page",
      isCondensed ? "mb-1" : "mb-4",
      hasColumns ? "": ""
    )}>
      <h3 className="text-xl font-semibold mb-2">{title} ({count})</h3>
      <ul className={cn(classNameByViewMode[viewMode])}>
        {cardsOptionallySplit
          .slice()
          .sort((a, b) => a.card.name.localeCompare(b.card.name))
          .map(({ card, quantity }) => (
          <DeckListCard
            key={card.name}
            card={card}
            viewMode={viewMode}
            quantity={quantity}
            onHover={onCardHover}
          />
        ))}
      </ul>
    </section>
  )
}

export default DeckListSection