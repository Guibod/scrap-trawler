import type { CardDbo } from "~/resources/domain/dbos/card.dbo"
import { GroupBy } from "~/resources/domain/utils/deck.analyzer"
import React, { useState } from "react"
import DeckListSection from "~/resources/ui/components/deck/decklist/section"
import { Select, SelectItem } from "@heroui/react"
import { ViewMode } from "~/resources/ui/components/deck/enum"
import { cn } from "@heroui/theme"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { useDeck } from "~/resources/ui/components/deck/provider"

export type DecklistProps = {
  onHoveredCard: (card: CardDbo) => void
  className?: string
}

const groupByItems = [
  { key: GroupBy.TYPE, label: "Type" },
  { key: GroupBy.SUBTYPE, label: "Sub Types" },
  { key: GroupBy.COLOR, label: "Color" },
  { key: GroupBy.COLOR_IDENTITY, label: "Color Identity" },
  { key: GroupBy.MV, label: "Mana Value" },
  { key: GroupBy.NONE, label: "None" },
]

const viewModeItems = [
  { key: ViewMode.TABLE, label: "Table", className: "columns-2 sm:columns-3 lg:columns-4"  },
  { key: ViewMode.TABLE_CONDENSED, label: "Condensed Table", className: "columns-2 sm:columns-3 lg:columns-4" },
  { key: ViewMode.VISUAL_GRID, label: "Visual Grid", className: "flex flex-col" },
  { key: ViewMode.VISUAL_STACK, label: "Visual Stacks", className: "columns-2 sm:columns-3 lg:columns-4" },
  { key: ViewMode.VISUAL_STACK_SPLIT, label: "Visual Stacks (split)", className: "columns-2 sm:columns-3 lg:columns-4"},
  { key: ViewMode.VISUAL_SPOILER, label: "Visual Spoilers", className: "flex flex-col" },
]

export function DeckList({ onHoveredCard, className }: DecklistProps) {
  const { deck, analyzer } = useDeck()
  const [groupBy, setGroupBy] = useState<GroupBy>(GroupBy.TYPE);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE);
  const grouped = analyzer.groupBy({ grouping: groupBy, selector: ["mainboard"] })
  const groups = Array.from(grouped.keys())

  return (
    <Card className={cn("mt-6", className)}>
      <CardHeader className={"flex items-center gap-4"}>
        <Select items={viewModeItems} label="View mode" defaultSelectedKeys={[viewMode]} onChange={(e) => setViewMode(e.target.value as ViewMode)}>
          {(mode) => <SelectItem key={mode.key}>{mode.label}</SelectItem>}
        </Select>

        <Select items={groupByItems} label="Group by" defaultSelectedKeys={[groupBy]} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>
          {(option) => <SelectItem key={option.key}>{option.label}</SelectItem>}
        </Select>
      </CardHeader>

      <CardBody className={cn("mt-4")}>
        <div className={cn(viewModeItems.find((item) => item.key === viewMode)?.className)}>
          <DeckListSection key="commanders" viewMode={viewMode} title="Commanders" cards={deck.boards.commanders} onCardHover={onHoveredCard} />
          <DeckListSection key="companions" viewMode={viewMode} title="Companions" cards={deck.boards.companions} onCardHover={onHoveredCard} />
          <DeckListSection key="signatureSpell" viewMode={viewMode} title="Signature Spell" cards={deck.boards.signatureSpells} onCardHover={onHoveredCard} />

          {[ViewMode.VISUAL_GRID, ViewMode.VISUAL_SPOILER].includes(viewMode) && (
            <div className="break-after-column h-0" />
          )}

          {groups.map((group) => (
            <DeckListSection key={group} viewMode={viewMode} title={group} cards={grouped.get(group)} onCardHover={onHoveredCard} />
          ))}

          <DeckListSection key="sideboard" viewMode={viewMode} title="Sideboard" cards={deck.boards.sideboard} onCardHover={onHoveredCard} />
        </div>
      </CardBody>
    </Card>
  )
}

export default DeckList
