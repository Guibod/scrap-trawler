import type { ResolvedDeckCard } from "~/resources/domain/mappers/deck.mapper"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { ManaCurveHistogram } from "~/resources/ui/components/deck/statistics/mana.curve"
import React, { useState } from "react"
import { CardTypes, GroupBy } from "~/resources/domain/utils/deck.analyzer"
import DeckListSection from "~/resources/ui/components/deck/decklist/section"
import { ViewMode } from "~/resources/ui/components/deck/enum"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { ManaColorBreakdown } from "~/resources/ui/components/deck/statistics/mana.breakdown"

type EventDeckStatisticsProps = {
  onHoveredCard: (card: CardDbo | null) => void
}

const EventDeckStatistics: React.FC<EventDeckStatisticsProps> = ({onHoveredCard}) => {
  const { analyzer } = useDeck()
  const [cardSubset, setCardSubset] = useState<Map<CardTypes, ResolvedDeckCard[]>>(new Map())
  const manaStatistics = analyzer.analyzeMana({ selector: ["mainboard"] })

  const handleStackedHistogramClick = (mv: string) => {
    setCardSubset(analyzer.groupBy({ mv, grouping: GroupBy.TYPE}))
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="text-2xl font-semibold">
          Mana Value
        </CardHeader>
        <CardBody>
          <p className={"text-medium"}>
            The average mana value of the main deck is <strong>{manaStatistics.avgWithLands}</strong> with
            lands and <strong>{manaStatistics.avgNoLands}</strong> without lands.<br/>
            The median mana value is <strong>{manaStatistics.medianWithLands}</strong> with lands
            and <strong>{manaStatistics.medianNoLands}</strong> without lands.<br/>

            This deck's total mana value is <strong>{manaStatistics.totalMV}</strong>
          </p>

          <div className="flex mt-4">
            <ManaCurveHistogram onStackedHistogramClick={handleStackedHistogramClick} />

            {cardSubset &&
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2">
                {Array.from(cardSubset.keys()).map(key => (
                  <DeckListSection
                    key={key}
                    title={key}
                    cards={cardSubset.get(key)}
                    viewMode={ViewMode.TABLE}
                    onCardHover={onHoveredCard}
                  />
                ))}
              </div>
            }
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="text-2xl font-semibold">Mana Breakdown</CardHeader>
        <CardBody>
          <ManaColorBreakdown />
        </CardBody>
      </Card>
    </>
  )
}

export default EventDeckStatistics